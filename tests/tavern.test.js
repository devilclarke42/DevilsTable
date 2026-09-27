import test from "node:test";
import assert from "node:assert/strict";
import { readJson, fakeAdapter } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { validateStockCatalogue } from "../scripts/validation/stock-validator.js";
import { selectEntries } from "../scripts/data/shop-catalogue.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { createStockTableBuilder } from "../scripts/builders/roll-table-builder.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";
import { stockGroups, stockProfiles } from "../scripts/data/stock-catalogue.js";
import { rollStockList } from "../scripts/stock/stock-roller.js";

const load = async () => {
  const data = await loadStockCatalogue({ readJson });
  for (const file of data.index.deferredFiles) data.entries.push(...(await readJson(file)).map((item, i) => ({ item, location: `${file}[${i}]` })));
  Object.assign(data.stock.profiles.find(p => p.shop === "tavern"), await readJson("data/deferred-tavern-stock.json"));
  return data;
};
const categories = ["ale", "beer", "mead", "wine", "spirits", "non-alcoholic-drinks", "hot-drinks", "breakfast", "lunch", "dinner", "stews", "roasts", "bread", "cheese", "desserts", "snacks", "travel-meals", "luxury-meals", "animal-feed"];
test("Deferred Tavern has 152 new menu products across all 19 categories and shares 31 existing goods", async () => {
  const data = await load(); assert.equal(validateStockCatalogue(data).valid, true);
  const tavern = selectEntries(data, { shopId: "tavern" }); assert.equal(tavern.length, 183);
  assert.equal(tavern.filter(({ item }) => item.id.startsWith("DT_ITEM_GS_")).length, 31);
  assert.equal(selectEntries(data, { shopId: "general-store" }).length, 144);
  for (const categoryId of categories) {
    const entries = selectEntries(data, { shopId: "tavern", categoryId });
    assert.equal(entries.length, 8);
    const definition = data.categoryDefinitions.find(c => c.shop === "tavern" && c.id === categoryId);
    assert.deepEqual(entries.map(({ item }) => item.name), definition.plannedItems);
    for (const { item } of entries) {
      assert.match(item.id, /^DT_ITEM_TAV_/); assert.ok(data.ledger.ids.includes(item.id));
      assert.ok(item.description.length > 180); assert.ok(item.saleUnit.trim()); assert.ok(item.weight.value > 0);
      assert.ok(item.tags.length >= 4); assert.equal(item.shops.join(), "tavern");
    }
  }
  assert.equal(new Set(data.entries.map(({ item }) => item.id)).size, 296);
  assert.equal(new Set(data.entries.map(({ item }) => item.name.normalize("NFKC").toLowerCase())).size, 296);
});
test("Deferred Tavern consumables consume one sale unit without healing, effects or stale item references", async () => {
  const data = await load();
  for (const { item } of data.entries.filter(({ item }) => item.id.startsWith("DT_ITEM_TAV_"))) {
    const before = structuredClone(item), doc = catalogueEntryToItem(item);
    assert.equal(doc.type, "consumable"); assert.equal(doc.system.type.value, "food");
    assert.equal(doc.system.quantity, 1); assert.equal(doc.system.source.rules, "2014");
    assert.equal(doc.system.weight.value, item.weight.value); assert.deepEqual(doc.system.price, item.price);
    const actions = Object.values(doc.system.activities); assert.equal(actions.length, 1);
    assert.equal(actions[0].activation.type, "special"); assert.equal(actions[0].type, "utility");
    assert.deepEqual(actions[0].effects, []); assert.equal(actions[0].roll.formula, "");
    assert.deepEqual(actions[0].consumption.targets, [{ type: "itemUses", target: "", value: "1", scaling: { mode: "", formula: "" } }]);
    assert.deepEqual(item, before);
  }
});
test("Deferred alpha.25 catalogue upgrade creates only the 152 Tavern records and repeat builds converge", async () => {
  const data = await load();
  const old = data.entries.filter(({ item }) => item.id.startsWith("DT_ITEM_GS_")).map(({ item }) => catalogueEntryToItem(item));
  const { adapter, state } = fakeAdapter({ existing: old }); const build = createBuilder({ load: () => data, adapter });
  const preview = await build(); assert.deepEqual([preview.create, preview.update, preview.unchanged], [152, 0, 144]);
  assert.deepEqual(state.writes, []);
  await build({ dryRun: false }); assert.equal(state.docs.length, 296); assert.deepEqual(state.docs.slice(0, 144), old);
  assert.equal((await build({ dryRun: false })).unchanged, 296);
  assert.equal((await build({ dryRun: false, shopId: "tavern" })).unchanged, 183);
});
test("Deferred Tavern keeps four existing table identities; only its rows change and rebuild converges", async () => {
  const data = await load(), previous = structuredClone(data);
  previous.entries = previous.entries.filter(({ item }) => item.id.startsWith("DT_ITEM_GS_"));
  Object.assign(previous.stock.profiles.find(p => p.shop === "tavern"), {
    coverage: "partial", draws: 10, categoryDraws: 3,
    categories: ["containers", "fire-lighting", "rope-climbing", "camping", "household", "animal", "travel"], overrides: []
  });
  const old = stockTableDocuments(previous), expected = stockTableDocuments(data);
  assert.equal(expected.length, 32); assert.deepEqual(expected.map(t => t._id), old.map(t => t._id));
  const { adapter, state } = fakeAdapter({ existing: old }); const build = createStockTableBuilder({ load: () => data, adapter });
  const preview = await build(); assert.deepEqual([preview.create, preview.update, preview.unchanged], [0, 4, 28]);
  assert.deepEqual(state.writes, []); await build({ dryRun: false });
  assert.equal((await build({ dryRun: false })).unchanged, 32);
  const profile = stockProfiles(data).find(p => p.shop === "tavern"); assert.equal(profile.coverage, "complete");
  const groups = stockGroups(data, profile), ids = Object.values(groups).flat().map(i => i.id);
  assert.equal(ids.length, 183); assert.equal(new Set(ids).size, 183);
  assert.equal(groups.always.length, 8); assert.ok(groups.always.some(i => i.id === "DT_ITEM_GS_FEED_HORSE"));
  assert.ok(!groups.always.some(i => i.category === "luxury-meals"));
  for (const categoryId of categories) {
    const stock = await rollStockList({ load: () => data, adapter, shopId: "tavern", categoryId, draws: 2, rollDie: async () => 1 });
    assert.ok(stock.items.length > 0 || categoryId === "luxury-meals"); // Often rolls do not force rare luxury stock.
    for (const row of stock.items) assert.ok(data.entries.some(({ item }) => item.id === row.id && item.category === categoryId));
  }
});
