import test from "node:test";
import assert from "node:assert/strict";
import { Actor, Item, good, setup, ledger } from "./support/trade-world.js";
import { executeTrade, makeSteps, recoverTrade } from "../scripts/merchant/transaction.js";
import { quoteTrade } from "../scripts/merchant/trade-model.js";

// Reproduce PhysicalItemTemplate.preCreateGear from D&D5e 5.3.3.
class NativeItem extends Item {
  constructor(data, { parent } = {}) {
    // Foundry constructors may clean/default their input object in place.
    data.sort ??= 0;
    data._stats ??= { modifiedTime: 123 };
    data.system.unidentified ??= {};
    data.system.unidentified.name ??= undefined;
    super(data); this.parent = parent;
  }
  get system() {
    const system = super.system;
    Object.defineProperty(system, "preCreateGear", { configurable: true, enumerable: false, value: () => {
      const properties = this.data.system.properties ?? [];
      this.data.system.properties = this.parent.type === "npc" && system.type?.value !== "natural"
        ? [...properties, "gear"] : properties.filter(p => p !== "gear");
    } });
    return system;
  }
}
function world() {
  setup(); CONFIG.Item.documentClass = NativeItem;
  const bag = { ...good("bag", 1, 80), type: "container" }; bag.system.properties = ["gear"]; bag.system.unidentified = {}; bag.ownership = { default: 0, gm: 3 };
  const strap = good("strap", 1, 4); strap.system.properties = ["gear"]; strap.system.unidentified = {}; strap.ownership = { default: 0, gm: 3 };
  const m = new Actor("merchant", 0, [bag, strap]), pc = new Actor("pc", 100);
  for (const actor of [m, pc]) actor.createEmbeddedDocuments = async (_type, rows) => rows.map(row => {
    const item = new NativeItem(row, { parent: actor }); item.system.preCreateGear();
    item.data.ownership ??= { default: 0 }; item.data.ownership[game.user.id] ??= 3;
    actor.items.set(item.id, item); return item;
  });
  const request = { id: "gear", userId: "player", lines: [{ id: "bag", quantity: 1 }, { id: "strap", quantity: 1 }], sales: [] };
  return { m, pc, request };
}
test("backpack and strap purchase predicts native gear removal and selling predicts its addition", async () => {
  const { m, pc, request } = world();
  await executeTrade({ merchant: m, character: pc, request, quote: quoteTrade(m, pc, request), receiptAdapter: ledger() });
  assert.equal(pc.system.currency.cp, 16); assert.equal(m.system.currency.cp, 84);
  assert.equal(pc.items.size, 2); assert.equal(m.items.has("bag"), false);
  assert.ok([...pc.items].every(i => i.system.properties.length === 0));
  const bag = [...pc.items].find(i => i.type === "container");
  const sale = { id: "sell", userId: "player", lines: [], sales: [{ id: bag.id, quantity: 1 }] };
  await executeTrade({ merchant: m, character: pc, request: sale, quote: quoteTrade(m, pc, sale), receiptAdapter: ledger() });
  assert.deepEqual([...new Set([...m.items].find(i => i.type === "container").system.properties)], ["gear"]);
});
for (const conflict of [false, true, "property", "restored", "name", "ownership"]) test(`legacy gear recovery ${conflict ? "preserves genuine edits" : "restores inventory and balances, then is idempotent"}`, async () => {
  const { m, pc, request } = world();
  const steps = makeSteps(m, pc, quoteTrade(m, pc, request));
  const index = steps.findIndex(s => s.kind === "item" && s.actorId === pc.id);
  const target = steps[index]; target.after.ownership = { default: 0 }; target.after.system.properties = ["gear"]; // alpha.18 receipt
  await pc.createEmbeddedDocuments("Item", [target.after]);
  m.items.delete("bag"); // observed partial transfer, wallets already at original balances
  if (conflict === true) pc.items.get(target.itemId).data.system.description.value = "Player edit";
  if (conflict === "property") pc.items.get(target.itemId).data.system.properties.push("mgc");
  if (conflict === "ownership") pc.items.get(target.itemId).data.ownership.player = 3;
  if (conflict === "name") pc.items.get(target.itemId).data.system.unidentified.name = "Real disguise name";
  if (conflict === "restored") {
    pc.items.delete(target.itemId);
    const source = steps.find(s => s.kind === "item" && s.actorId === m.id);
    await m.createEmbeddedDocuments("Item", [source.before]);
    m.items.get("bag").data.system.properties = ["gear", "gear"];
  }
  let record = { gmId: "gm", id: request.id, date: "test", merchantId: m.id, characterId: pc.id,
    status: "needs-recovery", steps, attempted: index };
  const doc = { uuid: "Receipt.gear", pages: [], getFlag: () => structuredClone(record),
    async update(data) { record = structuredClone(data["flags.devils-table.transaction"]); } };
  globalThis.fromUuid = async () => doc; game.actors = new Map([[m.id, m], [pc.id, pc]]);
  for (const a of [m, pc]) await a.setFlag("devils-table", "transactionPending", doc.uuid);
  if (conflict === true || conflict === "property" || conflict === "name" || conflict === "ownership") {
    await assert.rejects(recoverTrade(m), /Conflicting edit/);
    assert.equal(pc.items.size, 1); assert.equal(m.items.has("bag"), false);
    assert.equal(m.getFlag("devils-table", "transactionPending"), doc.uuid);
  } else {
    assert.equal(await recoverTrade(m), "Recovery checked: rolled-back.");
    assert.equal(pc.items.size, 0); assert.equal(m.items.get("bag").system.quantity, 1);
    assert.equal(m.items.get("strap").system.quantity, 1);
    assert.equal(pc.system.currency.cp, 100); assert.equal(m.system.currency.cp, 0);
    assert.equal(await recoverTrade(m), "No pending recovery.");
  }
});
