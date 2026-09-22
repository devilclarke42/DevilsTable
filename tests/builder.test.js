import test from "node:test";
import assert from "node:assert/strict";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { documentIdFor } from "../scripts/builders/document-id.js";
import { planBuild } from "../scripts/builders/build-plan.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { catalogue, fixture, fakeAdapter } from "./helpers.js";

test("ID algorithm has frozen FNV-1a test vectors", () => {
  assert.equal(documentIdFor(""), "cbf29ce484222325");
  assert.equal(documentIdFor("hello"), "a430d84680aabd0b");
  assert.match(documentIdFor(fixture.id), /^[a-f0-9]{16}$/);
  assert.notEqual(documentIdFor(`${fixture.id}_ONE`), documentIdFor(`${fixture.id}_TWO`));
});
test("renaming, recategorising and changing shops never changes identity", () => {
  const first = catalogueEntryToItem(fixture);
  const second = catalogueEntryToItem({ ...fixture, name: "New name", category: "household", shops: ["alchemist"] });
  assert.equal(first._id, second._id);
  assert.equal(second.flags["devils-table"].sourceId, fixture.id);
});
test("converter keeps the adjusted weight and 2014 baseline without mutating source", () => {
  const before = structuredClone(fixture);
  const doc = catalogueEntryToItem(fixture);
  assert.equal(doc.system.weight.value, fixture.weight.value);
  assert.equal(doc.system.source.rules, "2014");
  doc.flags["devils-table"].tags.push("changed");
  assert.deepEqual(fixture, before);
});
test("descriptions cannot inject HTML", () => {
  const doc = catalogueEntryToItem({ ...fixture, description: '<img src=x onerror="alert(1)">\n\nSecond line' });
  assert.ok(!doc.system.description.value.includes("<img"));
  assert.ok(doc.system.description.value.includes("&lt;img"));
});
test("unsupported item type is not silently converted", () => {
  assert.throws(() => catalogueEntryToItem({ ...fixture, mechanics: { type: "weapon" } }), /No converter/);
});
test("read-only plan preserves unknown entries and detects occupied IDs", () => {
  const doc = catalogueEntryToItem(fixture);
  assert.equal(planBuild([doc], [{ _id: "user-item" }]).preserved, 1);
  assert.throws(() => planBuild([doc], [{ _id: doc._id, name: "User item" }]), /occupied/);
});
test("managed duplicate permanent IDs, ID drift, and type changes fail closed", () => {
  const doc = catalogueEntryToItem(fixture);
  assert.throws(() => planBuild([doc], [doc, { ...doc, _id: "another-id" }]), /Duplicate managed/);
  assert.throws(() => planBuild([doc], [{ ...doc, _id: "another-id" }]), /ID drift/);
  assert.throws(() => planBuild([doc], [{ ...doc, type: "weapon" }]), /type changed/);
});
test("preview is read-only and is the API default", async () => {
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createBuilder({ load: catalogue, adapter });
  const report = await build();
  assert.equal(report.status, "preview");
  assert.equal(report.create, 1);
  assert.equal(state.pack, null);
  assert.equal(state.writes.length, 0);
  assert.equal(state.summaries.length, 0);
});
test("first build locks a new pack; second build creates no duplicates", async () => {
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createBuilder({ load: catalogue, adapter });
  const first = await build({ dryRun: false });
  const second = await build({ dryRun: false });
  assert.equal(first.create, 1);
  assert.equal(second.unchanged, 1);
  assert.equal(state.docs.length, 1);
  assert.equal(state.pack.locked, true);
  assert.equal(state.writes.length, 1);
});
test("updates preserve user flags, folders and ID", async () => {
  const doc = catalogueEntryToItem(fixture);
  doc.name = "Old name";
  doc.folder = "existing-folder";
  doc.flags.other = { useful: true };
  const { adapter, state } = fakeAdapter({ existing: [doc] });
  const report = await createBuilder({ load: catalogue, adapter })({ dryRun: false });
  assert.equal(report.update, 1);
  assert.equal(state.docs[0]._id, doc._id);
  assert.equal(state.docs[0].folder, "existing-folder");
  assert.deepEqual(state.docs[0].flags.other, { useful: true });
});
test("empty catalogue never clears a pack or unlocks it", async () => {
  const { adapter, state } = fakeAdapter({ existing: [catalogueEntryToItem(fixture)] });
  const report = await createBuilder({ load: () => catalogue([]), adapter })({ dryRun: false });
  assert.equal(report.preserved, 1);
  assert.equal(state.docs.length, 1);
  assert.equal(state.configurations.length, 0);
});
test("validation and preflight failures occur before writes", async () => {
  const data = await catalogue();
  data.entries[0].item.weight.value = -2;
  const { adapter, state } = fakeAdapter();
  await assert.rejects(createBuilder({ load: () => data, adapter })({ dryRun: false }), /Validation failed/);
  state.hooks.preflight = () => { throw new Error("System validation error"); };
  await assert.rejects(createBuilder({ load: catalogue, adapter })({ dryRun: false }), /System validation/);
  assert.equal(state.writes.length, 0);
  assert.equal(state.configurations.length, 0);
});
test("failed writes relock, record failure, and release the busy guard", async () => {
  const { adapter, state } = fakeAdapter();
  state.hooks.create = () => { throw new Error("Server failed"); };
  const build = createBuilder({ load: catalogue, adapter });
  await assert.rejects(build({ dryRun: false }), /partial/);
  assert.equal(state.pack.locked, true);
  assert.equal(state.summaries[0].status, "failed");
  delete state.hooks.create;
  assert.equal((await build({ dryRun: false })).create, 1);
});
test("an originally unlocked pack stays unlocked", async () => {
  const { adapter, state } = fakeAdapter({ locked: false });
  await createBuilder({ load: catalogue, adapter })({ dryRun: false });
  assert.equal(state.pack.locked, false);
});
test("concurrent local builds are rejected", async () => {
  const { adapter } = fakeAdapter();
  let proceed;
  const wait = new Promise(resolve => { proceed = resolve; });
  const build = createBuilder({ load: async () => { await wait; return catalogue(); }, adapter });
  const first = build();
  await assert.rejects(build(), /already running/);
  proceed();
  await first;
});
test("permission failure occurs before loading catalogue", async () => {
  const { adapter, state } = fakeAdapter();
  state.permissions = false;
  await assert.rejects(createBuilder({ load: () => { throw new Error("Must not load"); }, adapter })(), /Permission denied/);
});
test("writes are batched and retry converges after partial failure", async () => {
  const items = Array.from({ length: 205 }, (_, i) => ({ ...fixture, id: `DT_ITEM_TEST_BATCH_${i}` }));
  const { adapter, state } = fakeAdapter();
  state.hooks.create = () => { if (state.docs.length === 100) throw new Error("Disconnected"); };
  const build = createBuilder({ load: () => catalogue(items), adapter });
  await assert.rejects(build({ dryRun: false }), /partial/);
  assert.equal(state.docs.length, 100);
  assert.equal(state.pack.locked, true);
  delete state.hooks.create;
  const retry = await build({ dryRun: false });
  assert.equal(retry.unchanged, 100);
  assert.equal(retry.create, 105);
  assert.equal(state.docs.length, 205);
  assert.ok(state.writes.every(write => write.count <= 100));
});
test("progress callbacks cannot interrupt persistence", async () => {
  const { adapter, state } = fakeAdapter();
  await createBuilder({ load: catalogue, adapter })({ dryRun: false, onProgress() { throw new Error("UI closed"); } });
  assert.equal(state.docs.length, 1);
  assert.equal(state.pack.locked, true);
});
test("silent hook cancellations and read-back mismatch are failures", async () => {
  const { adapter, state } = fakeAdapter();
  adapter.create = async () => [];
  const build = createBuilder({ load: catalogue, adapter });
  await assert.rejects(build({ dryRun: false }), /prevented/);
  adapter.create = async (_pack, docs) => docs;
  await assert.rejects(build({ dryRun: false }), /Read-back verification/);
  assert.equal(state.pack.locked, true);
});

test("lock restoration failures report manual recovery and do not hide the write failure", async () => {
  const { adapter, state } = fakeAdapter();
  state.hooks.create = () => { throw new Error("Write rejected"); };
  state.hooks.configure = next => { if (next) throw new Error("Lock rejected"); };
  const build = createBuilder({ load: catalogue, adapter });
  await assert.rejects(build({ dryRun: false }), error => {
    assert.match(error.message, /Write rejected/);
    assert.match(error.message, /restore it manually/);
    return true;
  });
  assert.equal(state.summaries[0].status, "failed");
  delete state.hooks.create;
  delete state.hooks.configure;
  assert.equal((await build()).status, "preview");
});
test("summary persistence errors are explicit and release the guard", async () => {
  const { adapter, state } = fakeAdapter();
  adapter.saveSummary = () => { throw new Error("Setting rejected"); };
  const build = createBuilder({ load: catalogue, adapter });
  await assert.rejects(build({ dryRun: false }), /Could not save the build record/);
  assert.equal(state.pack.locked, true);
  assert.equal((await build()).unchanged, 1);
});
