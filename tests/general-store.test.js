import test from "node:test";
import assert from "node:assert/strict";
import { loadCatalogue } from "../scripts/data/catalogue-loader.js";
import { validateCatalogue } from "../scripts/validation/catalogue-validator.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { matchesGenerated, generatedDifferences } from "../scripts/builders/generated-fields.js";
import { readJson, fakeAdapter } from "./helpers.js";

const production = () => loadCatalogue({ readJson });
const findItem = (data, name) => data.entries.find(({ item }) => item.name === name).item;

test("new purchase units preserve whole-bundle prices and adjusted weights", async () => {
  const data = await production();
  const added = data.entries.filter(({ item }) => item.category !== "containers");
  assert.equal(added.length, 56);
  for (const { item } of added) {
    assert.ok(item.saleUnit?.trim());
    const doc = catalogueEntryToItem(item);
    assert.equal(doc.system.quantity, 1);
    assert.equal(doc.system.source.rules, "2014");
    assert.equal(doc.system.weight.value, item.weight.value);
    assert.deepEqual(doc.system.price, item.price);
    assert.equal(doc.flags["devils-table"].saleUnit, item.saleUnit);
  }
  assert.equal(findItem(data, "Pitons").weight.value, 2);
  assert.match(findItem(data, "Pitons").saleUnit, /10|ten/i);
  assert.equal(findItem(data, "Horse Feed").weight.value, 10);
  assert.match(findItem(data, "Horse Feed").saleUnit, /day/);
  assert.match(findItem(data, "Horseshoes").saleUnit, /four/);
});

test("fuel and food consume exactly one owning sale unit without a stale actor reference", async () => {
  const data = await production();
  const items = data.entries.filter(({ item }) => item.mechanics.use?.mode === "consume");
  assert.equal(items.length, 8);
  for (const { item } of items) {
    const doc = catalogueEntryToItem(item);
    assert.equal(doc.type, "consumable");
    assert.deepEqual(doc.system.uses, { spent: 0, max: "1", recovery: [], autoDestroy: true });
    const [activity] = Object.values(doc.system.activities);
    assert.equal(activity.type, "utility");
    assert.equal(activity.activation.type, "special");
    assert.equal(activity.consumption.spellSlot, false);
    assert.deepEqual(activity.consumption.targets, [{ type: "itemUses", target: "", value: "1", scaling: { mode: "", formula: "" } }]);
    assert.equal(activity.target.prompt, false);
    assert.deepEqual(activity.effects, []);
    assert.equal(activity.roll.formula, "");
  }
  assert.equal(catalogueEntryToItem(findItem(data, "Horse Feed")).system.type.value, "food");
});

test("reusable lights and climbing kit have actions without inventory consumption", async () => {
  const data = await production();
  for (const name of ["Lantern", "Hooded Lantern", "Bullseye Lantern", "Lamp", "Climber's Kit"]) {
    const doc = catalogueEntryToItem(findItem(data, name));
    assert.equal(doc.system.type.value, "trinket");
    assert.deepEqual(doc.system.uses, { spent: 0, max: "", recovery: [], autoDestroy: false });
    const [activity] = Object.values(doc.system.activities);
    assert.equal(activity.activation.type, "action");
    assert.equal(activity.activation.value, 1);
    assert.deepEqual(activity.consumption.targets, []);
    assert.equal(activity.consumption.spellSlot, false);
    assert.equal(activity.target.prompt, false);
  }
  const hood = Object.values(catalogueEntryToItem(findItem(data, "Hooded Lantern")).system.activities)[0];
  assert.equal(hood.duration.units, "hour");
  assert.equal(hood.duration.value, "6");
});

test("light reach uses total dim distance; burn metadata never creates token effects", async () => {
  const data = await production();
  for (const [name, bright, dim, hours, shape] of [
    ["Torch", 20, 40, 1, "radius"], ["Candle", 5, 10, 1, "radius"],
    ["Beeswax Candle", 5, 10, 4, "radius"], ["Tallow Candle", 5, 10, 2, "radius"],
    ["Lamp", 15, 45, 6, "radius"], ["Hooded Lantern", 30, 60, 6, "radius"],
    ["Bullseye Lantern", 60, 120, 6, "cone"]
  ]) {
    const item = findItem(data, name);
    const before = structuredClone(item);
    const doc = catalogueEntryToItem(item);
    const light = doc.flags["devils-table"].light;
    assert.deepEqual([light.brightFeet, light.dimFeet, light.durationHours, light.shape], [bright, dim, hours, shape]);
    assert.equal(Object.hasOwn(doc, "effects"), false);
    light.brightFeet = 999;
    assert.deepEqual(item, before);
  }
});

test("utility activity identity survives item/action renaming and no source object is shared", async () => {
  const data = await production();
  const item = findItem(data, "Torch");
  const before = catalogueEntryToItem(item);
  item.name = "Village Torch";
  item.mechanics.use.name = "Record spent torch";
  const after = catalogueEntryToItem(item);
  assert.equal(before._id, after._id);
  assert.deepEqual(Object.keys(before.system.activities), Object.keys(after.system.activities));
  after.system.activities[Object.keys(after.system.activities)[0]].activation.condition = "Changed copy";
  assert.notEqual(item.mechanics.use.condition, "Changed copy");
});

test("six new vessels use native containers outside the Containers category", async () => {
  const data = await production();
  for (const [name, empty, capacity] of [
    ["Cooking Pot", 3, 4], ["Camp Kettle", 1.5, 4], ["Cup", 0.15, 1],
    ["Bowl", 0.25, 1], ["Wash Bucket", 1.5, 24], ["Feed Bag", 0.5, 10]
  ]) {
    const doc = catalogueEntryToItem(findItem(data, name));
    assert.equal(doc.type, "container");
    assert.equal(doc.system.weight.value, empty);
    assert.equal(doc.system.capacity.weight.value, capacity);
    assert.deepEqual(doc.system.properties, []);
  }
});

test("an existing Containers build gains 56 items and retains all 13 original documents", async () => {
  const data = await production();
  const existing = data.entries.filter(({ item }) => item.category === "containers").map(({ item }) => catalogueEntryToItem(item));
  const { adapter, state } = fakeAdapter({ existing });
  const build = createBuilder({ load: () => data, adapter });
  const preview = await build({ shopId: "general-store" });
  assert.deepEqual([preview.create, preview.update, preview.unchanged], [56, 0, 13]);
  assert.deepEqual(state.writes, []);
  const result = await build({ dryRun: false, shopId: "general-store" });
  assert.equal(result.written, 56);
  assert.equal(state.docs.length, 69);
  assert.deepEqual(state.docs.slice(0, 13), existing);
  assert.equal((await build({ dryRun: false })).unchanged, 69);
  assert.deepEqual(state.writes, [{ action: "create", count: 56 }]);
});

test("sequential category builds preserve earlier categories and shared-shop identities", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createBuilder({ load: () => data, adapter });
  let count = 0;
  for (const category of data.categoryDefinitions) {
    const result = await build({ dryRun: false, shopId: "general-store", categoryId: category.id });
    assert.equal(result.create, category.plannedItems.length);
    assert.equal(result.preserved, count);
    count += result.create;
    assert.equal(state.docs.length, count);
  }
  assert.equal((await build({ dryRun: false, shopId: "alchemist" })).unchanged, 6);
  assert.equal(state.docs.length, 69);
});

test("native activity consumption and light metadata remain strict at read-back", async () => {
  const data = await production();
  const expected = catalogueEntryToItem(findItem(data, "Torch"));
  const activityId = Object.keys(expected.system.activities)[0];
  for (const mutate of [
    doc => { doc.system.uses.autoDestroy = false; },
    doc => { doc.system.activities[activityId].consumption.targets[0].target = doc._id; },
    doc => { doc.system.activities[activityId].consumption.targets[0].value = "2"; },
    doc => { doc.flags["devils-table"].light.dimFeet = 20; }
  ]) {
    const saved = structuredClone(expected);
    mutate(saved);
    assert.equal(matchesGenerated(saved, expected), false);
    assert.ok(generatedDifferences(saved, expected).length);
  }
});

const invalidMechanics = {
  "missing use action": item => { delete item.mechanics.use; },
  "blank action condition": item => { item.mechanics.use.condition = " "; },
  "unsupported potion subtype": item => { item.mechanics.subtype = "potion"; },
  "loot subtype on consumable": item => { item.mechanics.subtype = "gear"; },
  "unsupported activation": item => { item.mechanics.use.activation = "free"; },
  "unsupported consumption mode": item => { item.mechanics.use.mode = "quantity"; },
  "unsupported fuel": item => { item.mechanics.light.fuel = "magic"; },
  "dim reach below bright reach": item => { item.mechanics.light.dimFeet = 10; },
  "zero burn duration": item => { item.mechanics.light.durationHours = 0; },
  "self-fuel that never consumes": item => { item.mechanics.use.mode = "reusable"; },
  "external fuel that deletes its lamp": item => { item.mechanics.light.fuel = "oil"; },
  "container capacity on consumable": item => { item.mechanics.capacity = { weight: { value: 1, units: "lb" }, volume: { value: 1, units: "pint" } }; },
  "light mapped as food": item => { item.mechanics.subtype = "food"; },
  "light/use on loot": item => { item.mechanics.type = "loot"; item.mechanics.subtype = "gear"; },
  "blank sale unit": item => { item.saleUnit = " "; },
  "food that does not consume": item => { delete item.mechanics.light; item.mechanics.subtype = "food"; item.mechanics.use.mode = "reusable"; }
};
for (const [label, mutate] of Object.entries(invalidMechanics)) {
  test(`consumable validation rejects ${label}`, async () => {
    const data = await production();
    mutate(findItem(data, "Torch"));
    assert.equal(validateCatalogue(data).valid, false);
  });
}
