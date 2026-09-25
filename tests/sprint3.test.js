import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readJson, fakeAdapter, root } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { validateStockCatalogue } from "../scripts/validation/stock-validator.js";
import { validateCatalogue } from "../scripts/validation/catalogue-validator.js";
import { stockProfiles, stockGroups } from "../scripts/data/stock-catalogue.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { createStockTableBuilder } from "../scripts/builders/roll-table-builder.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";
import { rollStockList } from "../scripts/stock/stock-roller.js";

const production = () => loadStockCatalogue({ readJson });
const general = data => data.stock.profiles.find(profile => profile.shop === "general-store");

test("all 69 accepted source records survive unchanged except explicit Container sale units", async () => {
  const data = await production();
  const baseline = await readJson("tests/fixtures/general-store-alpha6-hashes.json");
  assert.equal(baseline.items.length, 69);
  for (const { id, sha256 } of baseline.items) {
    const item = structuredClone(data.entries.find(entry => entry.item.id === id).item);
    if (item.category === "containers") delete item.saleUnit;
    assert.equal(createHash("sha256").update(JSON.stringify(item)).digest("hex"), sha256, id);
  }
  for (const [shop, count] of [["tavern", 31], ["alchemist", 6], ["blacksmith", 7], ["black-market", 4]]) {
    assert.equal(data.entries.filter(({ item }) => item.shops.includes(shop)).length, count);
  }
});

test("alpha.6 Item upgrade creates 75, adds 13 sale-unit flags and preserves 56 unchanged", async () => {
  const data = await production();
  const ids = new Set((await readJson("tests/fixtures/general-store-alpha6-hashes.json")).items.map(item => item.id));
  const existing = data.entries.filter(({ item }) => ids.has(item.id)).map(({ item }) => {
    const doc = catalogueEntryToItem(item);
    if (item.category === "containers") delete doc.flags["devils-table"].saleUnit;
    return doc;
  });
  existing[0].folder = "personalFolder";
  existing[0].flags.other = { keep: true };
  const { adapter, state } = fakeAdapter({ existing });
  const build = createBuilder({ load: () => data, adapter });
  const preview = await build();
  assert.deepEqual([preview.create, preview.update, preview.unchanged], [75, 13, 56]);
  assert.deepEqual(state.writes, []);
  await build({ dryRun: false });
  assert.equal(state.docs.length, 144);
  assert.equal(new Set(state.docs.map(doc => doc._id)).size, 144);
  assert.equal(state.docs[0].folder, "personalFolder");
  assert.equal(state.docs[0].flags.other.keep, true);
  assert.equal((await build({ dryRun: false })).unchanged, 144);
});

test("every product has a sale unit, meaningful tags and a known or packaged icon", async () => {
  const data = await production();
  const icons = new Set((await readJson("tests/fixtures/core-icon-references.json")).icons.map(entry => entry.icon));
  for (const { item } of data.entries) {
    assert.ok(item.saleUnit.trim(), item.id);
    assert.ok(item.tags.length > 0, item.id);
    assert.ok(item.price.value > 0 && item.weight.value > 0, item.id);
    if (item.icon.startsWith("icons/")) assert.ok(icons.has(item.icon), `Unreviewed core path: ${item.icon}`);
    else {
      const path = new URL(item.icon.replace("modules/devils-table/", ""), root);
      await access(path);
      if (item.icon.endsWith(".webp")) {
        const bytes = await readFile(path);
        assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
        assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
        assert.ok(bytes.length <= 50 * 1024, item.icon);
      }
    }
  }
});

test("name uniqueness ignores case, extra spaces and Unicode compatibility forms", async () => {
  for (const name of ["  bAcKpAcK ", "Ｂａｃｋｐａｃｋ"]) {
    const data = await production();
    data.entries[1].item.name = name;
    assert.ok(validateCatalogue(data).errors.some(error => /Duplicate display name/.test(error.message)));
  }
});

test("four General Store profiles partition their own tiers and share canonical UUIDs", async () => {
  const data = await production();
  const before = structuredClone(data.entries);
  const profiles = stockProfiles(data).filter(profile => profile.shop === "general-store");
  assert.deepEqual(profiles.map(profile => profile.name), ["Village General Store", "Town General Store", "City General Store", "Merchant Wagon"]);
  const tables = stockTableDocuments(data, { shopId: "general-store" });
  assert.equal(tables.length, 16);
  const soapUuids = new Set();
  for (const profile of profiles) {
    const groups = stockGroups(data, profile);
    const ids = Object.values(groups).flat().map(item => item.id);
    assert.equal(ids.length, profile.isVariant && profile.name === "Merchant Wagon" ? 133 : 144);
    assert.equal(new Set(ids).size, ids.length);
    const docs = stockTableDocuments(data, { shopId: "general-store", profileId: profile.id });
    assert.equal(docs.length, 4);
    for (const table of docs) for (const row of table.results) {
      if (row.flags["devils-table"].itemId === "DT_ITEM_GS_SOAP") soapUuids.add(row.documentUuid);
      assert.ok(!profile.excludedItems.includes(row.flags["devils-table"].itemId));
    }
  }
  assert.equal(soapUuids.size, 1);
  assert.deepEqual(data.entries, before);
});

test("variant overrides take precedence over inherited policy without changing source", async () => {
  const data = await production();
  general(data).overrides.push({ itemId: "DT_ITEM_GS_SOAP", tier: "often" });
  general(data).variants[0].overrides.push({ itemId: "DT_ITEM_GS_SOAP", tier: "always" });
  const before = structuredClone(data);
  const profiles = stockProfiles(data);
  assert.ok(stockGroups(data, profiles.find(p => p.id === "DT_TABLE_GS")).often.some(i => i.id === "DT_ITEM_GS_SOAP"));
  assert.ok(stockGroups(data, profiles.find(p => p.id === "DT_TABLE_GS_TOWN")).always.some(i => i.id === "DT_ITEM_GS_SOAP"));
  assert.deepEqual(data, before);
});

test("variant Merchant Notes and guidance descriptions never enter generated tables", async () => {
  const data = await production();
  const before = stockTableDocuments(data);
  for (const variant of general(data).variants) {
    variant.description = "PRIVATE_GUIDANCE_SENTINEL";
    variant.merchantNotes.alwaysStocks.push("PRIVATE_GUIDANCE_SENTINEL");
  }
  assert.deepEqual(stockTableDocuments(data), before);
});

test("profile builds preserve existing sets and invalid profile scopes fail before writes", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createStockTableBuilder({ load: () => data, adapter });
  await assert.rejects(build({ dryRun: false, shopId: "tavern", profileId: "DT_TABLE_GS_CITY" }), /Unknown stock profile/);
  assert.equal(state.pack, null);
  assert.deepEqual(state.writes, []);
  assert.equal((await build({ dryRun: false, shopId: "general-store", profileId: "DT_TABLE_GS_CITY" })).create, 4);
  assert.equal((await build({ dryRun: false, shopId: "general-store" })).create, 12);
  assert.equal((await build({ dryRun: false })).create, 16);
  assert.equal((await build({ dryRun: false })).unchanged, 32);
});

test("variant category rolls use effective tiers for quantities without writing inventory", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ existing: stockTableDocuments(data) });
  const run = async (profileId, tierRoll) => {
    const rolls = [tierRoll, 1, ...Array(8).fill(95)];
    return rollStockList({ load: () => data, adapter, profileId, categoryId: "travel", draws: 1, rollDie: async () => rolls.shift() });
  };
  const village = (await run("DT_TABLE_GS", 81)).items.find(i => i.id === "DT_ITEM_GS_COMPASS");
  const city = (await run("DT_TABLE_GS_CITY", 1)).items.find(i => i.id === "DT_ITEM_GS_COMPASS");
  assert.equal(village.uuid, city.uuid);
  assert.deepEqual(village.price, city.price);
  assert.deepEqual([village.tier, village.quantity], ["rarely", 1]);
  assert.deepEqual([city.tier, city.quantity], ["often", 2]);
  await assert.rejects(rollStockList({ load: () => data, adapter, shopId: "tavern", profileId: "DT_TABLE_GS_CITY" }), /Unknown stock profile/);
  assert.deepEqual(state.writes, []);
});

const invalidVariants = {
  "duplicate identity": variant => { variant.id = "DT_TABLE_GS"; },
  "duplicate display name": variant => { variant.name = "  village general store  "; },
  "unknown excluded product": variant => { variant.excludedItems.push("DT_ITEM_MISSING_GOOD"); },
  "excluded overridden product": variant => { variant.excludedItems.push(variant.overrides[0].itemId); },
  "repeated override": variant => { variant.overrides.push(structuredClone(variant.overrides[0])); },
  "missing notes": variant => { delete variant.merchantNotes; },
  "conflicting notes": variant => { variant.merchantNotes.rarelyStocks.push(variant.merchantNotes.alwaysStocks[0].toUpperCase()); },
  "excessive draws": variant => { variant.draws = 51; },
  "unknown field": variant => { variant.items = []; }
};
for (const [name, mutate] of Object.entries(invalidVariants)) test(`variant validation rejects ${name}`, async () => {
  const data = await production();
  mutate(general(data).variants[0]);
  assert.equal(validateStockCatalogue(data).valid, false);
});

async function alpha6Catalogue() {
  const data = await production();
  const ids = new Set((await readJson("tests/fixtures/general-store-alpha6-hashes.json")).items.map(item => item.id));
  data.entries = data.entries.filter(({ item }) => ids.has(item.id));
  delete general(data).variants;
  general(data).categories = general(data).categories.filter(id => !["tools", "trade-goods"].includes(id));
  for (const definition of data.categoryDefinitions) {
    if (definition.id === "fire-lighting") definition.name = "Fire & Lighting";
    if (definition.id === "animal") definition.name = "Animal";
  }
  return data;
}

test("alpha.6 table upgrade retains all 20 identities and converges to 32 active tables", async () => {
  const data = await production();
  const existing = stockTableDocuments(await alpha6Catalogue());
  assert.equal(existing.length, 20);
  const { adapter, state } = fakeAdapter({ existing });
  const build = createStockTableBuilder({ load: () => data, adapter });
  const preview = await build();
  assert.deepEqual([preview.create, preview.update, preview.unchanged], [12, 3, 17]);
  assert.deepEqual(state.writes, []);
  await build({ dryRun: false });
  assert.ok(existing.every(old => state.docs.some(doc => doc._id === old._id)));
  assert.equal((await build({ dryRun: false })).unchanged, 32);
});

test("historical category tables with older membership are protected during cleanup", async () => {
  const { planLegacyCleanup } = await import("../scripts/builders/legacy-table-cleanup.js");
  const data = await production();
  const old = await alpha6Catalogue();
  const legacy = stockTableDocuments(old, {}, { legacyCategories: true });
  const docs = [...stockTableDocuments(data), ...legacy];
  const before = structuredClone(docs);
  const plan = planLegacyCleanup(data, docs, []);
  const oldTravel = legacy.filter(doc => doc.flags["devils-table"].shop === "general-store" && doc.flags["devils-table"].category === "travel");
  assert.equal(oldTravel.length, 4);
  assert.ok(oldTravel.every(doc => plan.preserved.some(entry => entry.id === doc._id)));
  assert.ok(plan.removable.length < 100);
  assert.deepEqual(docs, before);
});
