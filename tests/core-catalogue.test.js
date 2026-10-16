import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readJson, fakeAdapter } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { createStockTableBuilder } from "../scripts/builders/roll-table-builder.js";
import { stockProfiles, stockGroups } from "../scripts/data/stock-catalogue.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";
import { rollStockFromTables } from "../scripts/stock/stock-roller.js";
import { estimateGeneration } from "../scripts/merchant/builder/generation.js";
import { quoteTrade } from "../scripts/merchant/trade-model.js";
import { executeTrade } from "../scripts/merchant/transaction.js";
import { Actor, setup, ledger } from "./support/trade-world.js";
import { MODULE_ID } from "../scripts/constants.js";

const data = await loadStockCatalogue({ readJson });
const essentials = await readJson("data/items/general-store/core-equipment.json");
const ids = new Set(essentials.map(i => i.id));

test("all 440 released canonical records remain byte-equivalent after JSON parsing", async () => {
  const baseline = await readJson("tests/fixtures/core-catalogue-baseline-hashes.json");
  assert.equal(baseline.items.length, 440);
  for (const { id, sha256 } of baseline.items) {
    const item = data.entries.find(e => e.item.id === id)?.item;
    assert.ok(item, id);
    assert.equal(createHash("sha256").update(JSON.stringify(item)).digest("hex"), sha256, id);
  }
});

test("essential tool checks retain pinned proficiency bases without granting proficiency", () => {
  for (const [id, base, ability] of [["HERBALISM_KIT", "herb", "wis"], ["NAVIGATORS_TOOLS", "navg", "int"]]) {
    const d = catalogueEntryToItem(essentials.find(i => i.id === `DT_ITEM_GS_${id}`));
    assert.equal(d.type, "tool"); assert.deepEqual(d.system.type, { value: "", baseItem: base });
    assert.equal(Object.hasOwn(d.system, "proficient"), false);
    const [a] = Object.values(d.system.activities);
    assert.equal(a.type, "check"); assert.equal(a.check.ability, ability);
    assert.deepEqual(a.consumption.targets, []); assert.equal(a.range.units, "self");
    assert.equal(a.duration.units, "inst"); assert.equal(a.target.template.units, "ft");
    assert.equal(Object.hasOwn(a.activation, "value"), false);
  }
});

test("projectile containers hold a standard source bundle without free ammunition or weightless contents", () => {
  for (const [code, weight] of [["QUIVER", 1], ["CROSSBOW_BOLT_CASE", 1.5]]) {
    const d = catalogueEntryToItem(essentials.find(i => i.id === `DT_ITEM_GS_${code}`));
    assert.equal(d.type, "container"); assert.equal(d.system.capacity.weight.value, weight);
    assert.equal(d.system.capacity.count, 0); assert.ok(d.system.capacity.volume.value > 0);
    assert.ok(!d.system.properties.includes("weightlessContents")); assert.equal(d.system.quantity, 1);
    assert.equal(Object.hasOwn(d, "items"), false);
    assert.match(d.system.description.value, /sold separately|purchased separately/);
  }
  const pouch = essentials.find(i => i.id.endsWith("COMPONENT_POUCH"));
  assert.equal(catalogueEntryToItem(pouch).type, "container");
  assert.match(pouch.description, /specific price/); assert.match(pouch.description, /free hand/);
  const book = essentials.find(i => i.id.endsWith("SPELLBOOK"));
  assert.match(book.description, /hundred blank vellum/); assert.match(book.description, /No spells/);
});

test("upgrading the released 440 Item pack creates only newly added documents; repeated and cross-merchant builds converge", async () => {
  const originalIds = new Set((await readJson("tests/fixtures/core-catalogue-baseline-hashes.json")).items.map(i => i.id));
  const old = data.entries.filter(e => originalIds.has(e.item.id)).map(e => catalogueEntryToItem(e.item));
  assert.equal(old.length, 440);
  const { adapter, state } = fakeAdapter({ existing: old });
  const build = createBuilder({ load: () => data, adapter });
  const preview = await build(); assert.deepEqual([preview.create, preview.update, preview.unchanged], [42, 0, 440]);
  assert.deepEqual(state.writes, []);
  await build({ dryRun: false }); assert.equal(state.docs.length, 482);
  assert.equal(new Set(state.docs.map(d => d._id)).size, 482);
  assert.equal((await build({ dryRun: false })).unchanged, 482);
  assert.equal((await build({ dryRun: false, shopId: "alchemist" })).unchanged, 61);
  assert.equal((await build({ dryRun: false, shopId: "blacksmith" })).unchanged, 75);
  assert.equal(state.docs.filter(d => d.flags[MODULE_ID].sourceId === "DT_ITEM_GS_HERBALISM_KIT").length, 1);
});

test("all updated stock tables rebuild twice without new table identities or duplicate results", async () => {
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createStockTableBuilder({ load: () => data, adapter });
  assert.equal((await build({ dryRun: false })).create, 100);
  assert.equal((await build({ dryRun: false })).unchanged, 100);
  assert.equal(new Set(state.docs.map(d => d._id)).size, 100);
  for (const t of state.docs) assert.equal(new Set(t.results.map(r => r._id)).size, t.results.length);
});

test("essentials remain optional stock and specialist/travelling exclusions are respected", async () => {
  const profiles = stockProfiles(data);
  const gs = profiles.find(p => p.id === "DT_TABLE_GS");
  const groups = stockGroups(data, gs);
  assert.equal(groups.always.filter(i => ids.has(i.id)).length, 0);
  assert.equal(groups.rarely.filter(i => ids.has(i.id)).length, 1);
  const tables = stockTableDocuments(data, { profileId: gs.id });
  let calls = 0;
  const rolled = await rollStockFromTables(tables, { eligibleIds: ids, draws: 8, rollDie: async sides => {
    if (sides === 100) return ++calls === 8 ? 81 : 1;
    return 1;
  }});
  assert.deepEqual(new Set(rolled.selected.map(r => r.row.flags[MODULE_ID].itemId)), ids);
  for (const [profileId, missing] of [["DT_TABLE_GS_WAGON", ["LADDER_RIGID", "POLE"]], ["DT_TABLE_ALC_TRAVELLING", ["HERBALISM_KIT"]], ["DT_TABLE_BSM_MASTER", ["QUIVER", "CROSSBOW_BOLT_CASE"]]]) {
    const pool = Object.values(stockGroups(data, profiles.find(p => p.id === profileId))).flat();
    for (const id of missing) assert.ok(!pool.some(i => i.id === `DT_ITEM_GS_${id}`));
  }
  const context = { catalogue: data, economy: await readJson("data/economy.json"), policy: await readJson("data/merchant-builder.json") };
  const draft = { ...context.economy.defaults, stockProfileId: gs.id, catalogueId: "general-store", prosperity: "average" };
  const estimates = ["village", "town", "city"].map(settlement => estimateGeneration({ ...draft, settlement }, context));
  assert.ok(estimates[0].count < estimates[1].count && estimates[1].count < estimates[2].count);
});

test("SRD progress preserves all 241 source identities and covers the approved additions", async () => {
  const baseline = await readJson("docs/audits/CATALOGUE_COVERAGE.json");
  const next = await readJson("docs/content/CATALOGUE_COVERAGE.json");
  assert.equal(next.equipment.length, 241);
  assert.deepEqual(next.equipment.map(r => r.sourceId), baseline.equipment.map(r => r.sourceId));
  const additions = next.equipment.filter((r, i) => r.represented && !baseline.equipment[i].represented);
  assert.equal(additions.length, 42);
  assert.deepEqual(new Set(additions.flatMap(r => r.canonicalIds)), new Set(data.entries.filter(e => e.item.tags.includes("core-expansion") || ids.has(e.item.id)).map(e => e.item.id)));
  assert.equal(next.equipment.filter(r => r.represented).length, 167);
  assert.equal(next.denominator.representedPercent, 69.29);
});

test("a purchased native container retains capacity and transfers once through the existing transaction pipeline", async () => {
  setup(); const d = catalogueEntryToItem(essentials.find(i => i.id.endsWith("QUIVER")));
  const merchant = new Actor("merchant", 0, [d]), pc = new Actor("pc", 1000);
  const request = { id: "core-quiver", userId: "player", sales: [], lines: [{ id: d._id, quantity: 1 }] };
  const quote = quoteTrade(merchant, pc, request);
  await executeTrade({ merchant, character: pc, request, quote, receiptAdapter: ledger() });
  assert.equal(merchant.items.size, 0); assert.equal(pc.items.size, 1);
  const bought = [...pc.items][0]; assert.deepEqual(bought.system.capacity, d.system.capacity);
  assert.equal(bought.system.quantity, 1); assert.equal(pc.system.currency.cp, 930);
});
