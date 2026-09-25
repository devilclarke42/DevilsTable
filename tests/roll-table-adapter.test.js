import test from "node:test";
import assert from "node:assert/strict";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createRollTableAdapter } from "../scripts/builders/roll-table-adapter.js";
import { createStockTableBuilder } from "../scripts/builders/roll-table-builder.js";
import { documentIdFor } from "../scripts/builders/document-id.js";
import { readJson } from "./helpers.js";

function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) merge(target[key] ??= {}, value);
    else target[key] = structuredClone(value);
  }
  return target;
}

async function environment(t) {
  const catalogue = await loadStockCatalogue({ readJson });
  const globals = ["CONFIG", "game", "foundry"];
  const previous = globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const state = { tables: new Map(), writes: [], settings: [], dropRow: false, failDelete: false };
  class Table {
    constructor(data) {
      this.data = structuredClone(data);
      if (state.dropRow) this.data.results.pop();
    }
    get results() { return new Map((this.data.results ?? []).map(row => [row._id, row])); }
    validate(options) { assert.equal(options.strict, true); }
    toObject() { return structuredClone(this.data); }
    static async createDocuments(data, options) {
      state.writes.push({ action: "createTables", count: data.length, options });
      return data.map(source => {
        const table = new Table(source);
        state.tables.set(source._id, table);
        return table;
      });
    }
    static async updateDocuments(data, options) {
      state.writes.push({ action: "updateTables", count: data.length, options });
      return data.map(source => {
        assert.equal(Object.hasOwn(source, "results"), false, "Embedded rows must use their own APIs.");
        const table = state.tables.get(source._id);
        merge(table.data, source);
        return table;
      });
    }
    static async deleteDocuments(ids, options) {
      state.writes.push({ action: "deleteTables", count: ids.length, options });
      return ids.map(id => { const table = state.tables.get(id); state.tables.delete(id); return table; });
    }
    async createEmbeddedDocuments(type, rows, options) {
      assert.equal(type, "TableResult");
      assert.equal(options.keepId, true);
      state.writes.push({ action: "createRows", count: rows.length });
      this.data.results.push(...structuredClone(rows));
      return rows;
    }
    async updateEmbeddedDocuments(type, rows) {
      assert.equal(type, "TableResult");
      state.writes.push({ action: "updateRows", count: rows.length });
      for (const row of rows) merge(this.data.results.find(r => r._id === row._id), row);
      return rows;
    }
    async deleteEmbeddedDocuments(type, ids) {
      assert.equal(type, "TableResult");
      if (state.failDelete) throw new Error("Simulated embedded delete failure");
      state.writes.push({ action: "deleteRows", count: ids.length });
      this.data.results = this.data.results.filter(row => !ids.includes(row._id));
      return ids;
    }
  }
  class Result {
    constructor(row) { this.row = row; }
    validate(options) { assert.equal(options.strict, true); assert.ok(["document", "text"].includes(this.row.type)); }
  }
  const items = catalogue.entries.map(({ item }) => catalogueEntryToItem(item));
  const itemPack = {
    collection: "world.devils-table-items", documentName: "Item", metadata: { packageType: "world", system: "dnd5e" },
    invalidDocumentIds: new Set(), getDocuments: async () => items.map(item => ({ toObject: () => structuredClone(item) }))
  };
  const tablePack = {
    collection: "world.devils-table-stock-tables", documentName: "RollTable", metadata: { packageType: "world" },
    invalidDocumentIds: new Set(), locked: true,
    getDocument: async id => state.tables.get(id), getDocuments: async () => [...state.tables.values()],
    configure: async ({ locked }) => { tablePack.locked = locked; }
  };
  globalThis.CONFIG = { Item: { documentClass: class {} }, RollTable: { documentClass: Table }, TableResult: { documentClass: Result } };
  globalThis.game = {
    user: { id: "gm", isGM: true }, users: { activeGM: { id: "gm" } }, release: { generation: 14 }, system: { id: "dnd5e", version: "5.3.3" },
    packs: new Map([[itemPack.collection, itemPack], [tablePack.collection, tablePack]]),
    tables: { invalidDocumentIds: new Set(), contents: [] },
    settings: { set: async (...args) => state.settings.push(args) }
  };
  globalThis.foundry = { documents: { collections: { CompendiumCollection: { createCompendium: async metadata => {
    assert.equal(metadata.type, "RollTable");
    state.writes.push({ action: "createPack" });
    return tablePack;
  } } } } };
  return { catalogue, state, items, tablePack, itemPack };
}

test("legacy cleanup adapter only deletes named pack tables and has an independent record", async t => {
  const { catalogue, state, tablePack } = await environment(t);
  const docs = stockTableDocuments(catalogue, { shopId: "general-store", categoryId: "writing" }, { legacyCategories: true });
  const adapter = createRollTableAdapter();
  await adapter.create(tablePack, docs);
  assert.deepEqual(await adapter.readWorldTables(), []);
  const removed = await adapter.deleteLegacy(tablePack, [docs[0]._id]);
  assert.equal(removed.length, 1);
  assert.equal(state.tables.size, 3);
  assert.equal(state.writes.at(-1).options.pack, "world.devils-table-stock-tables");
  await adapter.saveCleanupSummary({ deleted: 1 });
  assert.equal(state.settings[0][1], "lastTableCleanupSummary");
  game.tables.invalidDocumentIds.add("bad");
  await assert.rejects(adapter.readWorldTables(), /Invalid world RollTables/);
});

test("table preflight resolves real item identities and missing links block all writes", async t => {
  const { catalogue, items, state } = await environment(t);
  const adapter = createRollTableAdapter();
  const docs = stockTableDocuments(catalogue);
  await adapter.validateDocuments(docs);
  items.splice(items.findIndex(item => item.flags["devils-table"].sourceId === "DT_ITEM_GS_SOAP"), 1);
  await assert.rejects(adapter.validateDocuments(docs), /Missing or conflicting compendium item DT_ITEM_GS_SOAP/);
  assert.deepEqual(state.writes, []);
});

test("a managed source ID on the wrong document ID does not satisfy a reference", async t => {
  const { catalogue, items } = await environment(t);
  items[0]._id = "incorrect0000001";
  await assert.rejects(createRollTableAdapter().validateDocuments(stockTableDocuments(catalogue)), /Missing or conflicting/);
});

test("preflight detects dropped embedded models and unknown nested tables", async t => {
  const { catalogue, state } = await environment(t);
  const docs = stockTableDocuments(catalogue, { shopId: "general-store", categoryId: "containers" });
  state.dropRow = true;
  await assert.rejects(createRollTableAdapter().validateDocuments(docs), /dropped/);
  state.dropRow = false;
  docs.at(-1).results[0].documentUuid = "Compendium.world.wrong.RollTable.0000000000000000";
  await assert.rejects(createRollTableAdapter().validateDocuments(docs), /Unresolved nested/);
});

test("table adapter enforces target pack and active-GM restrictions", async t => {
  const { tablePack } = await environment(t);
  const adapter = createRollTableAdapter();
  tablePack.documentName = "Item";
  await assert.rejects(adapter.getPack(), /not a world RollTable/);
  game.user.isGM = false;
  assert.throws(adapter.assertCanBuild, /Only a GM/);
  game.user.isGM = true;
  game.users.activeGM.id = "other";
  assert.throws(adapter.assertCanBuild, /active GM/);
});

test("create keeps embedded IDs, locks its pack and saves the separate table summary", async t => {
  const { catalogue, state, tablePack } = await environment(t);
  const build = createStockTableBuilder({ load: () => catalogue });
  const result = await build({ dryRun: false, shopId: "general-store", categoryId: "writing", profileId: "DT_TABLE_GS" });
  assert.equal(result.create, 4);
  assert.equal(state.writes[0].options.keepId, true);
  assert.equal(state.writes[0].options.keepEmbeddedIds, true);
  assert.equal(state.settings[0][1], "lastTableBuildSummary");
  assert.equal(tablePack.locked, true);
  assert.equal((await build({ dryRun: false, shopId: "general-store", categoryId: "writing", profileId: "DT_TABLE_GS" })).unchanged, 4);
});

test("tier changes reconcile owned rows and preserve table identity, folder and foreign flags", async t => {
  const { catalogue, state, tablePack } = await environment(t);
  const scope = { dryRun: false, shopId: "general-store", categoryId: "writing", profileId: "DT_TABLE_GS" };
  const build = createStockTableBuilder({ load: () => catalogue });
  await build(scope);
  const table = [...state.tables.values()].find(t => t.data.flags["devils-table"].tier === "always");
  const oldId = table.data._id;
  table.data.folder = "userFolder";
  table.data.flags.other = { preserved: true };
  const chalk = table.data.results.find(row => row.flags["devils-table"].itemId === "DT_ITEM_GS_CHALK");
  chalk.flags.other = { rowFlag: true };
  catalogue.entries.find(({ item }) => item.id === "DT_ITEM_GS_PAPER").item.availability = "variable";
  const result = await build(scope);
  assert.equal(result.update, 2);
  assert.equal(table.data._id, oldId);
  assert.equal(table.data.folder, "userFolder");
  assert.equal(table.data.flags.other.preserved, true);
  assert.equal(table.data.results.find(row => row._id === chalk._id).flags.other.rowFlag, true);
  assert.ok(state.writes.some(write => write.action === "createRows"));
  assert.ok(state.writes.some(write => write.action === "deleteRows"));
  assert.equal(tablePack.locked, true);
  assert.equal((await build(scope)).unchanged, 4);
});

test("an embedded-row failure relocks the pack and retry converges", async t => {
  const { catalogue, state, tablePack } = await environment(t);
  const scope = { dryRun: false, shopId: "general-store", categoryId: "writing", profileId: "DT_TABLE_GS" };
  const build = createStockTableBuilder({ load: () => catalogue });
  await build(scope);
  catalogue.entries.find(({ item }) => item.id === "DT_ITEM_GS_PAPER").item.availability = "variable";
  state.failDelete = true;
  await assert.rejects(build(scope), /embedded delete failure/);
  assert.equal(tablePack.locked, true);
  state.failDelete = false;
  await build(scope);
  assert.equal((await build(scope)).unchanged, 4);
});

test("large new result pools are split into bounded embedded-document batches", async t => {
  const { catalogue, state, items } = await environment(t);
  const scope = { dryRun: false, shopId: "general-store", categoryId: "writing", profileId: "DT_TABLE_GS" };
  const build = createStockTableBuilder({ load: () => catalogue });
  await build(scope);
  const base = catalogue.entries.find(({ item }) => item.id === "DT_ITEM_GS_PAPER").item;
  for (let i = 0; i < 205; i++) {
    const item = { ...structuredClone(base), id: `DT_ITEM_TEST_STOCK_${i}`, name: `Stock fixture ${i}`, availability: "variable" };
    catalogue.entries.push({ item, location: `synthetic[${i}]` });
    catalogue.ledger.ids.push(item.id);
    items.push(catalogueEntryToItem(item));
  }
  await build(scope);
  const batches = state.writes.filter(write => write.action === "createRows");
  assert.deepEqual(batches.map(write => write.count), [100, 100, 5]);
  assert.equal((await build(scope)).unchanged, 4);
});

test("unmanaged rows introduced after preview are protected during an update", async t => {
  const { catalogue, state, tablePack } = await environment(t);
  const docs = stockTableDocuments(catalogue, { shopId: "general-store", categoryId: "writing" });
  const adapter = createRollTableAdapter();
  await adapter.create(tablePack, docs);
  const table = state.tables.get(docs[0]._id);
  table.data.results.push({ _id: documentIdFor("CUSTOM"), name: "Keep me", range: [1, 1], flags: {} });
  await assert.rejects(adapter.update(tablePack, docs), /unmanaged result/);
  assert.ok(table.data.results.some(row => row.name === "Keep me"));
  assert.equal(state.writes.filter(write => write.action === "deleteRows").length, 0);
});
