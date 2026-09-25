import test from "node:test";
import assert from "node:assert/strict";
import { readJson, fakeAdapter } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { validateStockCatalogue } from "../scripts/validation/stock-validator.js";
import { rollStockQuantity } from "../scripts/stock/stock-quantities.js";
import { rollStockList } from "../scripts/stock/stock-roller.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";

const production = () => loadStockCatalogue({ readJson });

test("quantity distributions exhaustively match their stated percentages", async () => {
  const data = await production();
  for (const rule of data.quantities.rules) {
    const price = { Everyday: { value: 1, denomination: "cp" }, Common: { value: 1, denomination: "sp" },
      Equipment: { value: 1, denomination: "gp" }, Specialist: { value: 25, denomination: "gp" } }[rule.priceBand];
    const counts = new Map();
    for (let roll = 1; roll <= 100; roll++) {
      const result = await rollStockQuantity(data.quantities, { price }, rule.tier, async sides => { assert.equal(sides, 100); return roll; });
      counts.set(result.quantity, (counts.get(result.quantity) ?? 0) + 1);
    }
    const profile = data.quantities.profiles.find(profile => profile.id === rule.profile);
    assert.deepEqual(counts, new Map(profile.results.map(row => [row.quantity, row.weight])));
    if (rule.tier === "rarely") assert.deepEqual(counts, new Map([[1, 95], [2, 5]]));
  }
});

test("price bands and effective shop tiers lower expected quantities without changing source", async () => {
  const data = await production();
  const before = structuredClone(data);
  const item = { price: { value: 2, denomination: "cp" } };
  assert.equal((await rollStockQuantity(data.quantities, item, "always", async () => 70)).quantity, 12);
  assert.equal((await rollStockQuantity(data.quantities, item, "often", async () => 70)).quantity, 6);
  assert.equal((await rollStockQuantity(data.quantities, item, "rarely", async () => 70)).quantity, 1);
  item.price = { value: 25, denomination: "gp" };
  assert.equal((await rollStockQuantity(data.quantities, item, "always", async () => 70)).quantity, 2);
  assert.deepEqual(data, before);
});

test("category rolls use four whole-shop tables and count complete bundles, not components", async () => {
  const data = await production();
  const { adapter, state } = fakeAdapter({ existing: stockTableDocuments(data) });
  const stock = await rollStockList({ load: () => data, adapter, categoryId: "rope-climbing", rollDie: async sides => sides === 100 ? 1 : sides });
  assert.equal(stock.draws, 3);
  const eligible = new Set(data.entries.filter(({ item }) => item.category === "rope-climbing").map(({ item }) => item.id));
  assert.ok(stock.items.every(item => eligible.has(item.id)));
  const pitons = stock.items.find(item => item.id === "DT_ITEM_GS_PITONS");
  assert.ok(pitons);
  assert.match(pitons.saleUnit, /10|ten/i);
  assert.equal(pitons.quantity, 1); // One complete ten-piton bundle, not ten independently rolled goods.
  assert.deepEqual(state.writes, []);
});

test("empty category pools never force rare stock and quantity rolls follow selection", async () => {
  const data = await production();
  for (const { item } of data.entries) if (item.category === "travel" && item.availability === "variable") item.availability = "special-order";
  const { adapter } = fakeAdapter({ existing: stockTableDocuments(data) });
  let rolls = [80, 80, 80, ...Array(7).fill(100)];
  const stock = await rollStockList({ load: () => data, adapter, categoryId: "travel", rollDie: async () => rolls.shift() });
  assert.equal(stock.items.length, 7);
  assert.ok(stock.items.every(item => item.tier === "always"));
  assert.equal(rolls.length, 0);
});

test("invalid quantity die results and missing policy mappings fail clearly", async () => {
  const { quantities } = await production();
  const item = { price: { value: 1, denomination: "cp" } };
  for (const value of [0, 101, NaN, 1.5]) await assert.rejects(rollStockQuantity(quantities, item, "always", async () => value), /Invalid quantity/);
  await assert.rejects(rollStockQuantity(quantities, item, "missing", async () => 1), /Missing quantity/);
});

const invalid = {
  "incomplete percent coverage": data => { data.quantities.profiles[0].results[0].weight = 9; },
  "zero quantity": data => { data.quantities.profiles[0].results[0].quantity = 0; },
  "fractional quantity": data => { data.quantities.profiles[0].results[0].quantity = 1.5; },
  "unbounded quantity": data => { data.quantities.profiles[0].results[0].quantity = 100000; },
  "duplicate outcome": data => { data.quantities.profiles[0].results[0].quantity = 6; },
  "duplicate profile": data => { data.quantities.profiles.push(structuredClone(data.quantities.profiles[0])); },
  "missing rule": data => { data.quantities.rules.pop(); },
  "duplicate rule": data => { data.quantities.rules.push(structuredClone(data.quantities.rules[0])); },
  "unknown profile": data => { data.quantities.rules[0].profile = "missing"; },
  "higher stock for expensive goods": data => { data.quantities.rules[3].profile = "abundant"; },
  "higher stock for scarcer goods": data => { data.quantities.rules[4].profile = "abundant"; data.quantities.rules[0].profile = "common"; },
  "frequent rare doubles": data => { data.quantities.profiles[4].results[0].weight = 85; data.quantities.profiles[4].results[1].weight = 15; },
  "rare bulk stock": data => { data.quantities.profiles[4].results[1].quantity = 3; },
  "unknown field": data => { data.quantities.profiles[0].supply = "unlimited"; }
};
for (const [label, mutate] of Object.entries(invalid)) test(`quantity validation rejects ${label}`, async () => {
  const data = await production();
  mutate(data);
  assert.equal(validateStockCatalogue(data).valid, false);
});
