import { FLAG_SCOPE } from "../constants.js";
import { loadStockCatalogue } from "../data/stock-loader.js";
import { requireValidStock } from "../builders/roll-table-builder.js";
import { stockTableDocuments } from "../builders/roll-table-factory.js";
import { createRollTableAdapter } from "../builders/roll-table-adapter.js";
import { planRollTables } from "../builders/roll-table-plan.js";

async function checkedRoll(rollDie, sides) {
  const value = await rollDie(sides);
  if (!Number.isSafeInteger(value) || value < 1 || value > sides) throw new Error(`Invalid d${sides} result: ${value}.`);
  return value;
}

/** Read-only sampling of built table ranges. Exhausted tiers never promote rare goods. */
export async function rollStockFromTables(tables, { draws, rollDie }) {
  if (!Number.isSafeInteger(draws) || draws < 0 || draws > 50) throw new Error("Draw count must be an integer from 0 to 50.");
  const byTier = new Map(tables.map(table => [table.flags[FLAG_SCOPE].tier, table]));
  for (const tier of ["always", "often", "rarely", "rotating"]) if (!byTier.has(tier)) throw new Error(`Missing ${tier} stock table.`);
  const rows = tier => byTier.get(tier).results.filter(row => row.flags[FLAG_SCOPE].itemId).map(row => structuredClone(row));
  const selected = rows("always").map(row => ({ row, tier: "always" }));
  const pools = { often: rows("often"), rarely: rows("rarely") };
  const seen = new Set(selected.map(({ row }) => row.flags[FLAG_SCOPE].itemId));
  const outcomes = [];
  for (let attempt = 0; attempt < draws; attempt++) {
    if (!pools.often.length && !pools.rarely.length) break;
    const roll = await checkedRoll(rollDie, 100);
    const match = byTier.get("rotating").results.find(row => roll >= row.range[0] && roll <= row.range[1]);
    if (!match) throw new Error(`Rotating table has no result for ${roll}. Rebuild the tables.`);
    const tier = ["often", "rarely"].find(key => match.documentUuid?.endsWith(`.RollTable.${byTier.get(key)._id}`));
    if (!tier || !pools[tier].length) { outcomes.push({ roll, itemId: null, reason: "No extra stock or this tier is exhausted." }); continue; }
    const index = (await checkedRoll(rollDie, pools[tier].length)) - 1;
    const [row] = pools[tier].splice(index, 1);
    const itemId = row.flags[FLAG_SCOPE].itemId;
    if (!seen.has(itemId)) { selected.push({ row, tier }); seen.add(itemId); }
    outcomes.push({ roll, tier, itemId });
  }
  return { selected, outcomes };
}

/** No chat, pack updates, drawn-state writes, stock quantities or actor transfers. */
export async function rollStockList({ shopId = "general-store", categoryId = null, draws = null,
  load = loadStockCatalogue, adapter = null, rollDie = async sides => (await new Roll(`1d${sides}`).evaluate()).total } = {}) {
  const io = adapter ?? createRollTableAdapter();
  io.assertCanBuild();
  if (!shopId) throw new Error("Select one shop before rolling stock.");
  const catalogue = await load();
  requireValidStock(catalogue);
  const expected = stockTableDocuments(catalogue, { shopId, categoryId }).filter(table => table.flags[FLAG_SCOPE].category === (categoryId ?? "all"));
  if (expected.length !== 4) throw new Error("This shop has no authored stock category matching the selection.");
  await io.validateDocuments(expected);
  const pack = await io.getPack();
  const actual = pack ? await io.readPack(pack) : [];
  const plan = planRollTables(expected, actual);
  if (plan.create.length || plan.update.length) throw new Error("Build/Rebuild Stock RollTables for this selection before rolling; its tables are missing or outdated.");
  const ids = new Set(expected.map(table => table._id));
  const tables = actual.filter(table => ids.has(table._id));
  const count = draws ?? expected[0].flags[FLAG_SCOPE].draws;
  const rolled = await rollStockFromTables(tables, { draws: count, rollDie });
  const items = new Map(catalogue.entries.map(({ item }) => [item.id, item]));
  return {
    shopId, categoryId, draws: count, outcomes: rolled.outcomes,
    items: rolled.selected.map(({ row, tier }) => {
      const item = items.get(row.flags[FLAG_SCOPE].itemId);
      return { id: item.id, name: item.name, uuid: row.documentUuid, tier,
        price: { ...item.price }, saleUnit: item.saleUnit ?? "one empty container" };
    })
  };
}
