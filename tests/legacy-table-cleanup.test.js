import test from "node:test";
import assert from "node:assert/strict";
import { readJson, fakeAdapter } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { stockTableDocuments, tableUuid } from "../scripts/builders/roll-table-factory.js";
import { planLegacyCleanup, createLegacyTableCleanup } from "../scripts/builders/legacy-table-cleanup.js";
import { createStockTableBuilder } from "../scripts/builders/roll-table-builder.js";

async function environment({ locked = true } = {}) {
  const catalogue = await loadStockCatalogue({ readJson });
  const active = stockTableDocuments(catalogue);
  const legacy = stockTableDocuments(catalogue, {}, { legacyCategories: true })
    .filter(table => catalogue.tableLedger.ids.includes(table.flags["devils-table"].sourceId));
  const { adapter, state } = fakeAdapter({ existing: [...active, ...legacy], locked });
  state.world = [];
  state.cleanup = [];
  adapter.readWorldTables = async () => structuredClone(state.world);
  adapter.saveCleanupSummary = async summary => state.cleanup.push(structuredClone(summary));
  adapter.deleteLegacy = async (_pack, ids) => {
    if (state.beforeDelete) await state.beforeDelete(ids);
    const selected = ids.slice(0, state.deleteLimit ?? ids.length);
    state.docs = state.docs.filter(table => !selected.includes(table._id));
    state.writes.push({ action: "deleteLegacy", count: selected.length });
    return selected.map(_id => ({ _id }));
  };
  const cleanup = createLegacyTableCleanup({ load: () => catalogue, adapter });
  const preview = scope => cleanup(scope);
  const execute = async scope => {
    const plan = await preview(scope);
    return cleanup({ ...scope, dryRun: false, approvedIds: plan.removable.map(table => table.id) });
  };
  return { catalogue, active, legacy, adapter, state, cleanup, preview, execute };
}

test("compact builds preserve old category tables until explicit cleanup; whole-shop output is unchanged", async () => {
  const { catalogue, state, adapter, active } = await environment();
  const original = structuredClone(state.docs);
  const result = await createStockTableBuilder({ load: () => catalogue, adapter })({ dryRun: false });
  assert.equal(result.unchanged, 32);
  assert.equal(result.preserved, 100);
  assert.deepEqual(state.docs, original);
  assert.ok(active.every(table => table.flags["devils-table"].category === "all"));
});

test("cleanup preview is read-only and 100 eligible legacy tables are removed after exact approval", async () => {
  const { state, preview, cleanup, active } = await environment();
  const plan = await preview();
  assert.equal(plan.removable.length, 100);
  assert.equal(plan.preserved.length, 0);
  assert.deepEqual(state.configurations, []);
  assert.deepEqual(state.writes, []);
  assert.deepEqual(state.cleanup, []);
  const result = await cleanup({ dryRun: false, approvedIds: plan.removable.map(table => table.id) });
  assert.equal(result.deleted, 100);
  assert.deepEqual(state.docs, active);
  assert.deepEqual(state.configurations, [false, true]);
  assert.equal(state.cleanup[0].status, "complete");
  assert.equal((await preview()).removable.length, 0);
});

test("shop/category cleanup affects only the reviewed four legacy tables", async () => {
  const { execute, state } = await environment();
  const result = await execute({ shopId: "general-store", categoryId: "travel" });
  assert.equal(result.deleted, 4);
  assert.equal(state.docs.length, 128);
});

test("edited results, folders and foreign flags protect tables and their linked category sets", async () => {
  const { catalogue, state, legacy } = await environment();
  state.docs.find(table => table._id === legacy[0]._id).results.push({ _id: "custom0000000001", name: "User addition" });
  state.docs.find(table => table._id === legacy[4]._id).folder = "userfolder000001";
  state.docs.find(table => table._id === legacy[8]._id).flags.other = { note: "Keep this" };
  const before = structuredClone(state.docs);
  const plan = planLegacyCleanup(catalogue, state.docs, []);
  assert.equal(plan.preserved.length, 12);
  assert.equal(plan.removable.length, 88);
  assert.deepEqual(state.docs, before);
});

test("world and unrelated compendium RollTable references preserve their full dependency chains", async () => {
  const { catalogue, state, legacy } = await environment();
  state.world.push({ _id: "world00000000001", name: "World table", results: [{ documentUuid: tableUuid(legacy[0].flags["devils-table"].sourceId) }] });
  state.docs.push({ _id: "custom0000000001", name: "Personal table", description: `@UUID[${tableUuid(legacy[4].flags["devils-table"].sourceId)}]`, flags: {}, results: [] });
  const plan = planLegacyCleanup(catalogue, state.docs, state.world);
  assert.equal(plan.preserved.length, 8);
  assert.equal(plan.removable.length, 92);
});

test("no deletion is allowed without the exact reviewed IDs or after a preview becomes stale", async () => {
  const { state, preview, cleanup } = await environment();
  const plan = await preview();
  await assert.rejects(cleanup({ dryRun: false }), /not approved/);
  state.docs.find(table => table._id === plan.removable[0].id).name = "Edited after preview";
  await assert.rejects(cleanup({ dryRun: false, approvedIds: plan.removable.map(table => table.id) }), /selection changed/);
  assert.deepEqual(state.configurations, []);
  assert.deepEqual(state.writes, []);
});

test("permission and missing compact tables block cleanup before any mutation", async () => {
  const { state, preview } = await environment();
  state.permissions = false;
  await assert.rejects(preview(), /Permission denied/);
  state.permissions = true;
  state.docs.shift();
  await assert.rejects(preview(), /compact shop tables/);
  assert.deepEqual(state.writes, []);
});

test("references introduced after unlock stop deletion and restore the original lock", async () => {
  const { state, preview, cleanup } = await environment();
  const plan = await preview();
  state.hooks.configure = locked => {
    if (!locked) state.world.push({ name: "New reference", description: `@UUID[${tableUuid(plan.removable[0].sourceId)}]` });
  };
  await assert.rejects(cleanup({ dryRun: false, approvedIds: plan.removable.map(table => table.id) }), /changed during cleanup/);
  assert.equal(state.pack.locked, true);
  assert.deepEqual(state.writes, []);
});

test("partial deletion relocks and requires a new preview to converge", async () => {
  const { state, execute, preview } = await environment();
  state.deleteLimit = 40;
  await assert.rejects(execute(), /partial/);
  assert.equal(state.docs.length, 92);
  assert.equal(state.pack.locked, true);
  assert.equal(state.cleanup[0].deleted, 40);
  assert.equal((await preview()).removable.length, 60);
  delete state.deleteLimit;
  assert.equal((await execute()).deleted, 60);
  assert.equal(state.docs.length, 32);
});

test("originally unlocked packs stay unlocked and no-op cleanup performs no deletes", async () => {
  const { state, execute } = await environment({ locked: false });
  await execute();
  const writes = structuredClone(state.writes);
  await execute();
  assert.equal(state.pack.locked, false);
  assert.deepEqual(state.configurations, []);
  assert.deepEqual(state.writes, writes);
});

test("read-back catches a hook reporting deletions without actually deleting", async () => {
  const { adapter, state, execute } = await environment();
  adapter.deleteLegacy = async (_pack, ids) => ids.map(_id => ({ _id }));
  await assert.rejects(execute(), /read-back verification/);
  assert.equal(state.docs.length, 132);
  assert.equal(state.pack.locked, true);
});

test("lock cleanup errors do not hide deletion errors and the guard is released", async () => {
  const { state, execute, preview } = await environment();
  state.beforeDelete = () => { throw new Error("Deletion failed"); };
  state.hooks.configure = locked => { if (locked) throw new Error("Relock failed"); };
  await assert.rejects(execute(), error => /Deletion failed/.test(error.message) && /Relock failed/.test(error.message));
  delete state.beforeDelete;
  delete state.hooks.configure;
  assert.equal((await preview()).removable.length, 100);
});

test("build and cleanup services share the same client overlap guard", async () => {
  const { catalogue, adapter, state, execute } = await environment();
  let enter;
  let release;
  const started = new Promise(resolve => { enter = resolve; });
  const hold = new Promise(resolve => { release = resolve; });
  state.beforeDelete = async () => { enter(); await hold; };
  const pending = execute();
  await started;
  try { await assert.rejects(createStockTableBuilder({ load: () => catalogue, adapter })(), /already running/); }
  finally { release(); }
  await pending;
});
