import test from "node:test";
import assert from "node:assert/strict";
import { loadCatalogue } from "../scripts/data/catalogue-loader.js";
import { selectEntries, shopView } from "../scripts/data/shop-catalogue.js";
import { validateCatalogue } from "../scripts/validation/catalogue-validator.js";
import { priceBand } from "../scripts/validation/item-rules.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { readJson, catalogue, fakeAdapter } from "./helpers.js";

const production = () => loadCatalogue({ readJson });

test("all ten curated General Store categories contain exactly their approved items", async () => {
  const data = await production();
  assert.deepEqual(data.categoryDefinitions.map(category => category.name), [
    "Containers", "Lighting & Fire", "Rope & Climbing", "Camping", "Writing", "Household", "Animal Supplies", "Travel", "Tools", "Trade Goods"
  ]);
  for (const category of data.categoryDefinitions) {
    assert.deepEqual(data.entries.filter(({ item }) => item.category === category.id).map(({ item }) => item.name), category.plannedItems);
  }
  assert.equal(data.entries.length, 144);
  assert.ok(data.entries.every(({ item }) => item.shops.includes("general-store")));
  assert.deepEqual(new Set(data.entries.map(({ item }) => item.id)), new Set(data.ledger.ids));
  const view = shopView(data, { shopId: "general-store" });
  assert.deepEqual(view.categories.map(category => category.count), [13, 17, 10, 21, 13, 18, 12, 13, 16, 11]);
  assert.deepEqual(view.priceBands.map(band => band.count), [58, 61, 23, 2]);
});

test("every registered shop has three Merchant Notes tiers, including the requested village profile", async () => {
  const data = await production();
  assert.deepEqual(new Set(data.shopDefinitions.map(shop => shop.id)), new Set(data.index.shops));
  const view = shopView(data, { shopId: "general-store" });
  assert.deepEqual(view.shop.merchantNotes, {
    alwaysStocks: ["Rope", "Sacks", "Candles", "Soap", "Rations", "Torches"],
    oftenStocks: ["Lanterns", "Tents", "Blankets"], rarelyStocks: ["Spyglass", "Silk Rope", "Lockbox"]
  });
});

const invalidMetadata = {
  "missing shop": data => data.shopDefinitions.pop(),
  "duplicate shop": data => data.shopDefinitions.push(structuredClone(data.shopDefinitions[0])),
  "unregistered shop": data => { data.shopDefinitions[0].id = "missing"; },
  "missing Merchant Notes": data => { delete data.shopDefinitions[0].merchantNotes; },
  "missing stock tier": data => { delete data.shopDefinitions[0].merchantNotes.rarelyStocks; },
  "blank stock guidance": data => { data.shopDefinitions[0].merchantNotes.alwaysStocks = [" "]; },
  "conflicting stock tiers": data => { data.shopDefinitions[0].merchantNotes.rarelyStocks.push(" bread "); },
  "duplicate category": data => data.categoryDefinitions.push(structuredClone(data.categoryDefinitions[0])),
  "undefined category shop": data => { data.categoryDefinitions[0].shop = "missing"; },
  "unregistered category": data => { data.categoryDefinitions[0].id = "missing"; },
  "item outside shop categories": data => { data.entries[0].item.category = "food"; }
};
for (const [label, mutate] of Object.entries(invalidMetadata)) {
  test(`shop validation rejects ${label}`, async () => {
    const data = await production();
    mutate(data);
    assert.equal(validateCatalogue(data).valid, false);
  });
}

test("whole-coin pricing enforces cp/sp limits and the 25 gp specialist boundary", async () => {
  const data = await catalogue();
  for (const price of [{ value: 1, denomination: "cp" }, { value: 9, denomination: "cp" },
    { value: 1, denomination: "sp" }, { value: 9, denomination: "sp" },
    { value: 1, denomination: "gp" }, { value: 24, denomination: "gp" },
    { value: 25, denomination: "gp" }, { value: 1000, denomination: "gp" }]) {
    data.entries[0].item.price = price;
    assert.equal(validateCatalogue(data).valid, true, JSON.stringify(price));
  }
  assert.equal(priceBand({ value: 24, denomination: "gp" }), "Equipment");
  assert.equal(priceBand({ value: 25, denomination: "gp" }), "Specialist");
  for (const price of [{ value: 0, denomination: "cp" }, { value: 10, denomination: "cp" },
    { value: 10, denomination: "sp" }, { value: 0.5, denomination: "gp" },
    { value: 1, denomination: "ep" }, { value: 1, denomination: "pp" }]) {
    data.entries[0].item.price = price;
    assert.ok(validateCatalogue(data).errors.some(error => error.path.includes("price")), JSON.stringify(price));
  }
});

test("native containers preserve empty mass and count contents without a loot subtype", async () => {
  const data = await production();
  for (const { item } of data.entries.filter(({ item }) => item.mechanics.type === "container")) {
    const before = structuredClone(item);
    const doc = catalogueEntryToItem(item);
    assert.equal(doc.type, "container");
    assert.equal(doc.system.quantity, 1);
    assert.equal(doc.system.source.rules, "2014");
    assert.deepEqual(doc.system.weight, { value: item.weight.value, units: "lb" });
    assert.deepEqual(doc.system.capacity.weight, item.mechanics.capacity.weight);
    assert.equal(doc.system.capacity.count, 0);
    assert.equal(doc.system.capacity.volume.units, "cubicFoot");
    assert.deepEqual(doc.system.properties, []);
    assert.equal(Object.hasOwn(doc.system, "type"), false);
    doc.system.capacity.weight.value = 999;
    assert.deepEqual(item, before);
  }
  const waterskin = data.entries.find(({ item }) => item.id === "DT_ITEM_GS_WATERSKIN").item;
  assert.equal(waterskin.weight.value, 0.5);
  assert.equal(waterskin.mechanics.capacity.weight.value, 4);
});

test("liquid capacities use US measures and convert to supported D&D5e volume units", async () => {
  const data = await production();
  const volume = name => catalogueEntryToItem(data.entries.find(({ item }) => item.name === name).item).system.capacity.volume.value;
  assert.equal(volume("Backpack"), 1);
  assert.ok(Math.abs(volume("Flask") - 0.016710069444444445) < 1e-12);
  assert.ok(Math.abs(volume("Bottle") - 0.03342013888888889) < 1e-12);
  assert.equal(volume("Waterskin"), volume("Bottle") * 2);
  assert.ok(Math.abs(volume("Barrel") - 5.347222222222222) < 1e-12);
});

const invalidContainers = {
  "missing capacity": item => { delete item.mechanics.capacity; },
  "incomplete capacity": item => { delete item.mechanics.capacity.volume; },
  "zero weight capacity": item => { item.mechanics.capacity.weight.value = 0; },
  "negative volume": item => { item.mechanics.capacity.volume.value = -1; },
  "unsupported capacity unit": item => { item.mechanics.capacity.volume.units = "bucket"; },
  "nonfinite capacity": item => { item.mechanics.capacity.weight.value = Infinity; },
  "weightless mundane container": item => { item.weight.value = 0; },
  "loot subtype on container": item => { item.mechanics.subtype = "gear"; },
  "container category mapped to loot": item => { item.mechanics = { type: "loot", subtype: "gear" }; }
};
for (const [label, mutate] of Object.entries(invalidContainers)) {
  test(`container validation rejects ${label}`, async () => {
    const data = await production();
    mutate(data.entries[0].item);
    assert.equal(validateCatalogue(data).valid, false);
  });
}

test("loot still requires a subtype and cannot silently acquire container capacity", async () => {
  const data = await catalogue();
  delete data.entries[0].item.mechanics.subtype;
  assert.equal(validateCatalogue(data).valid, false);
  data.entries[0].item.mechanics.subtype = "gear";
  data.entries[0].item.mechanics.capacity = (await production()).entries[0].item.mechanics.capacity;
  assert.equal(validateCatalogue(data).valid, false);
});

test("notes and category plans never enter Item documents or trigger Item updates", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createBuilder({ load: () => data, adapter });
  await build({ dryRun: false });
  data.shopDefinitions[0].merchantNotes.alwaysStocks.push("MERCHANT_ONLY_SENTINEL");
  data.categoryDefinitions[0].plannedItems.push("PLAN_ONLY_SENTINEL");
  assert.equal((await build()).unchanged, 144);
  assert.ok(!JSON.stringify(state.docs).includes("SENTINEL"));
  for (const doc of state.docs) {
    assert.equal(Object.hasOwn(doc.flags["devils-table"], "merchantNotes"), false);
  }
});

test("shared goods keep one identity across filtered and full builds", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createBuilder({ load: () => data, adapter });
  const first = await build({ dryRun: false, shopId: "alchemist", categoryId: "containers" });
  assert.equal(first.create, 3);
  const second = await build({ dryRun: false, shopId: "general-store", categoryId: "containers" });
  assert.equal(second.create, 10);
  assert.equal(second.unchanged, 3);
  assert.equal(state.docs.length, 13);
  assert.equal((await build()).unchanged, 13);
  data.entries.find(({ item }) => item.name === "Bottle").item.price.value = 3;
  const updated = await build({ dryRun: false, shopId: "alchemist", categoryId: "containers" });
  assert.equal(updated.update, 1);
  assert.equal(updated.preserved, 10);
  assert.equal(state.docs.length, 13);
});

test("empty shop/category intersections never create or clear a pack", async () => {
  const data = await production();
  assert.equal(selectEntries(data, { shopId: "blacksmith", categoryId: "travel" }).length, 0);
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const result = await createBuilder({ load: () => data, adapter })({ dryRun: false, shopId: "blacksmith", categoryId: "travel" });
  assert.equal(result.count, 0);
  assert.match(result.warnings.join(" "), /No authored items/);
  assert.equal(state.pack, null);
  assert.deepEqual(state.writes, []);
  assert.deepEqual(state.configurations, []);
});

test("unknown filters and invalid out-of-scope items fail before any pack changes", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter();
  const build = createBuilder({ load: () => data, adapter });
  await assert.rejects(build({ dryRun: false, shopId: "missing" }), /Unknown shop/);
  await assert.rejects(build({ dryRun: false, categoryId: "missing" }), /Unknown category/);
  await assert.rejects(build({ dryRun: false, shopId: "general-store", categoryId: "food" }), /not defined/);
  data.entries[0].item.price.value = -1;
  await assert.rejects(build({ dryRun: false, shopId: "alchemist" }), /Validation failed/);
  assert.deepEqual(state.writes, []);
  assert.deepEqual(state.configurations, []);
});
