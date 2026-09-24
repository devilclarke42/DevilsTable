import test from "node:test";
import assert from "node:assert/strict";
import { readJson, fakeAdapter } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { validateStockCatalogue } from "../scripts/validation/stock-validator.js";
import { stockTableDocuments, itemUuid } from "../scripts/builders/roll-table-factory.js";
import { createStockTableBuilder } from "../scripts/builders/roll-table-builder.js";
import { planRollTables, tableReadBackError } from "../scripts/builders/roll-table-plan.js";
import { rollStockFromTables, rollStockList } from "../scripts/stock/stock-roller.js";

const production = () => loadStockCatalogue({ readJson });
const tierOf = table => table.flags["devils-table"].tier;
const scopeTables = (data, shopId = "general-store", categoryId = null) => stockTableDocuments(data, { shopId, categoryId });
const rollSequence = values => async sides => { const value = values.shift(); assert.ok(value >= 1 && value <= sides, `d${sides}: ${value}`); return value; };

test("five stock profiles generate only 20 tables while all 120 IDs remain reserved", async () => {
  const data = await production();
  assert.equal(validateStockCatalogue(data).valid, true);
  const tables = stockTableDocuments(data);
  assert.equal(tables.length, 20);
  assert.equal(data.tableLedger.ids.length, 120);
  assert.ok(tables.every(table => data.tableLedger.ids.includes(table.flags["devils-table"].sourceId)));
  const items = new Set(data.entries.map(({ item }) => itemUuid(item.id)));
  const nested = new Set(tables.map(table => `Compendium.world.devils-table-stock-tables.RollTable.${table._id}`));
  for (const table of tables) for (const result of table.results) {
    if (result.type === "document") assert.ok(items.has(result.documentUuid) || nested.has(result.documentUuid));
    assert.equal(Object.hasOwn(result, "documentCollection"), false);
    assert.equal(Object.hasOwn(result, "text"), false);
    assert.equal(typeof result.type, "string");
  }
  const counts = Object.fromEntries(data.stock.profiles.map(profile => [profile.shop, tables.filter(t => t.flags["devils-table"].shop === profile.shop).length]));
  assert.deepEqual(counts, { tavern: 4, "general-store": 4, alchemist: 4, blacksmith: 4, "black-market": 4 });
});

test("one Always draw returns every core good instead of selecting only one", async () => {
  const data = await production();
  const table = scopeTables(data).find(table => tierOf(table) === "always");
  assert.equal(table.formula, "1d1");
  assert.equal(table.results.length, 47);
  const drawn = table.results.filter(row => row.range[0] <= 1 && row.range[1] >= 1);
  assert.equal(drawn.length, 47);
  for (const id of ["DT_ITEM_GS_ROPE_HEMP", "DT_ITEM_GS_SACK", "DT_ITEM_GS_CANDLE", "DT_ITEM_GS_SOAP", "DT_ITEM_GS_TORCH"]) {
    assert.ok(drawn.some(row => row.flags["devils-table"].itemId === id));
  }
});

test("rotating d100 ranges preserve 80/15/5 odds and empty tiers do not promote rares", async () => {
  const data = await production();
  for (const tables of [scopeTables(data), scopeTables(data, "general-store", "travel")]) {
    const rotating = tables.find(table => tierOf(table) === "rotating");
    const matches = Array.from({ length: 100 }, (_, index) => rotating.results.filter(row => index + 1 >= row.range[0] && index + 1 <= row.range[1]));
    assert.ok(matches.every(rows => rows.length === 1));
    assert.deepEqual(rotating.results.map(row => row.range), [[1, 80], [81, 95], [96, 100]]);
  }
  const travel = scopeTables(data, "general-store", "travel");
  const eligibleIds = new Set(data.entries.filter(({ item }) => item.category === "travel").map(({ item }) => item.id));
  const empty = await rollStockFromTables(travel, { draws: 3, eligibleIds, rollDie: rollSequence([1, 80, 100]) });
  assert.equal(empty.selected.length, 3); // The three Always travel goods; no forced compass/spyglass.
  const rare = await rollStockFromTables(travel, { draws: 1, eligibleIds, rollDie: rollSequence([81, 1]) });
  assert.equal(rare.selected.filter(row => row.tier === "rarely").length, 1);
});

test("shop overrides change local tiers without changing item identity or source", async () => {
  const data = await production();
  const before = structuredClone(data.entries);
  const oil = scopeTables(data, "alchemist").find(table => tierOf(table) === "often").results.find(row => row.flags["devils-table"].itemId === "DT_ITEM_GS_OIL_LAMP");
  assert.equal(oil.documentUuid, itemUuid("DT_ITEM_GS_OIL_LAMP"));
  const lockbox = scopeTables(data, "blacksmith").find(table => tierOf(table) === "often").results.find(row => row.flags["devils-table"].itemId === "DT_ITEM_GS_LOCKBOX");
  assert.ok(lockbox);
  assert.deepEqual(data.entries, before);
});

test("Merchant Notes remain builder-only and never change generated tables", async () => {
  const data = await production();
  const before = stockTableDocuments(data);
  data.shopDefinitions[0].merchantNotes.alwaysStocks.push("MERCHANT_ONLY_SENTINEL");
  assert.deepEqual(stockTableDocuments(data), before);
  assert.ok(!JSON.stringify(before).includes("MERCHANT_ONLY_SENTINEL"));
});

test("table and result IDs survive display renames, source order changes and rebalancing", async () => {
  const data = await production();
  const before = stockTableDocuments(data);
  data.shopDefinitions[1].name = "A Renamed Store";
  data.entries.reverse();
  data.entries.find(({ item }) => item.id === "DT_ITEM_GS_SOAP").item.name = "Village Soap";
  data.stock.oftenChance = 70;
  const after = stockTableDocuments(data);
  assert.deepEqual(after.map(table => table._id), before.map(table => table._id));
  for (let i = 0; i < before.length; i++) assert.deepEqual(after[i].results.map(row => row._id), before[i].results.map(row => row._id));
});

test("result ordering and equivalent table HTML are harmless; altered odds and UUIDs remain failures", async () => {
  const expected = stockTableDocuments(await production());
  const saved = structuredClone(expected);
  for (const table of saved) { table.results.reverse(); table.description = table.description.replaceAll("&#39;", "'"); }
  assert.equal(planRollTables(expected, saved).unchanged, 20);
  saved[0].results[0].documentUuid = "Compendium.world.wrong.Item.1234567890123456";
  const plan = planRollTables(expected, saved);
  assert.equal(plan.update.length, 1);
  const error = tableReadBackError(plan.update, saved);
  assert.match(error.details[0].path, /documentUuid/);
  const rangeDrift = structuredClone(expected);
  rangeDrift[3].results[0].range[1] = 79;
  assert.equal(planRollTables(expected, rangeDrift).update.length, 1);
});

test("preview, first build, filtered rebuild and repeated all-shop build preserve table identities", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createStockTableBuilder({ load: () => data, adapter });
  assert.equal((await build()).create, 20);
  assert.equal(state.pack, null);
  assert.deepEqual(state.summaries, []);
  const first = await build({ dryRun: false, shopId: "general-store", categoryId: "containers" });
  assert.equal(first.create, 4);
  assert.equal(first.pack, "world.devils-table-stock-tables");
  assert.equal((await build({ dryRun: false })).create, 16);
  assert.equal((await build({ dryRun: false })).unchanged, 20);
  assert.equal((await build({ categoryId: "travel" })).unchanged, 20);
  assert.equal(state.pack.locked, true);
  assert.ok(state.writes.every(write => write.count <= 100));
});

test("partial table writes relock and converge on retry", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ hasPack: false });
  state.hooks.create = docs => { state.docs.push(...structuredClone(docs.slice(0, 4))); throw new Error("Disconnected"); };
  const build = createStockTableBuilder({ load: () => data, adapter });
  await assert.rejects(build({ dryRun: false }), /partial/);
  assert.equal(state.docs.length, 4);
  assert.equal(state.pack.locked, true);
  delete state.hooks.create;
  const result = await build({ dryRun: false });
  assert.equal(result.unchanged, 4);
  assert.equal(result.create, 16);
});

test("unmanaged result rows fail before any table is unlocked or written", async () => {
  const data = await production();
  const existing = scopeTables(data);
  existing[0].results.push({ _id: "customrow0000001", name: "Custom item", range: [1, 1] });
  const { adapter, state } = fakeAdapter({ existing });
  await assert.rejects(createStockTableBuilder({ load: () => data, adapter })({ dryRun: false }), /unmanaged result/);
  assert.deepEqual(state.configurations, []);
  assert.deepEqual(state.writes, []);
});

test("stock sampling is duplicate-free, keeps Always goods and does not mutate built rows", async () => {
  const data = await production();
  const tables = scopeTables(data);
  const before = structuredClone(tables);
  const stock = await rollStockFromTables(tables, { draws: 50, rollDie: async () => 1 });
  const ids = stock.selected.map(({ row }) => row.flags["devils-table"].itemId);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(stock.selected.filter(row => row.tier === "always").length, 47);
  assert.equal(stock.selected.filter(row => row.tier === "often").length, 16);
  assert.equal(stock.selected.filter(row => row.tier === "rarely").length, 0);
  assert.deepEqual(tables, before);
});

test("Roll Stock uses current built tables and never writes packs, chat or inventories", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ existing: stockTableDocuments(data) });
  const stock = await rollStockList({ load: () => data, adapter, draws: 1, rollDie: rollSequence([95, 1, ...Array(48).fill(1)]) });
  assert.equal(stock.items.length, 48);
  assert.equal(stock.items.filter(item => item.tier === "rarely").length, 1);
  assert.ok(stock.items.every(item => item.uuid.startsWith("Compendium.world.devils-table-items.Item.")));
  assert.ok(stock.items.every(item => Number.isSafeInteger(item.quantity) && item.quantity >= 1));
  assert.deepEqual(state.writes, []);
  assert.deepEqual(state.summaries, []);
  assert.deepEqual(state.configurations, []);
  state.docs[0].formula = "1d20";
  await assert.rejects(rollStockList({ shopId: "tavern", load: () => data, adapter }), /outdated/);
  await assert.rejects(rollStockList({ shopId: null, load: () => data, adapter }), /Select one shop/);
});

test("draw bounds and faulty random results fail without looping", async () => {
  const tables = scopeTables(await production());
  for (const draws of [-1, 1.5, 51]) await assert.rejects(rollStockFromTables(tables, { draws, rollDie: async () => 1 }), /Draw count/);
  for (const value of [0, 101, NaN, 1.5]) await assert.rejects(rollStockFromTables(tables, { draws: 1, rollDie: async () => value }), /Invalid d100/);
});

const invalid = {
  "unknown shop": data => { data.stock.profiles[0].shop = "missing"; },
  "missing shop profile": data => { data.stock.profiles.pop(); },
  "duplicate shop profile": data => { data.stock.profiles.push(structuredClone(data.stock.profiles[0])); },
  "duplicate identity": data => { data.stock.profiles[1].id = data.stock.profiles[0].id; },
  "invalid probabilities": data => { data.stock.oftenChance = 99; },
  "rare more likely than often": data => { data.stock.oftenChance = 10; },
  "fractional probabilities": data => { data.stock.rarelyChance = 1.5; },
  "unregistered category": data => { data.stock.profiles[0].categories.push("missing"); },
  "missing authored category": data => { data.stock.profiles[1].categories.pop(); },
  "unreserved table": data => { data.tableLedger.ids.shift(); },
  "duplicate reserved table": data => { data.tableLedger.ids.push(data.tableLedger.ids[0]); },
  "wrong-shop override": data => { data.stock.profiles[0].overrides.push({ itemId: "DT_ITEM_GS_SPYGLASS", tier: "always" }); },
  "unknown override item": data => { data.stock.profiles[0].overrides.push({ itemId: "DT_ITEM_MISSING_GOOD", tier: "often" }); },
  "duplicate override": data => { data.stock.profiles[2].overrides.push(structuredClone(data.stock.profiles[2].overrides[0])); },
  "invalid tier": data => { data.stock.profiles[2].overrides[0].tier = "legendary"; },
  "excessive roll count": data => { data.stock.profiles[0].draws = 100000; }
};
for (const [label, mutate] of Object.entries(invalid)) {
  test(`stock validation rejects ${label}`, async () => {
    const data = await production();
    mutate(data);
    assert.equal(validateStockCatalogue(data).valid, false);
  });
}
