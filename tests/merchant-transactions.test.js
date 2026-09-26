import test from "node:test";
import assert from "node:assert/strict";
import { Actor, good, setup, ledger } from "./support/trade-world.js";
import { quoteTrade } from "../scripts/merchant/trade-model.js";
import { executeTrade } from "../scripts/merchant/transaction.js";
import { exactPayment, walletValue, planPayment } from "../scripts/merchant/settlement.js";

const req = (id = "one") => ({ id, userId: "player", lines: [{ id: "rope", quantity: 1 }], sales: [] });
async function trade(merchant, character, request = req(), receiptAdapter = ledger(), edits) {
  const quote = quoteTrade(merchant, character, request, edits);
  return executeTrade({ merchant, character, request, quote, receiptAdapter });
}
test("buy transfers value and goods, stacks identical state, records character memory", async () => {
  setup(); const m = new Actor("merchant", 0, [good("rope", 2)]), pc = new Actor("pc", 50, [good("owned", 1)]);
  const log = ledger(); await trade(m, pc, req(), log);
  assert.equal(walletValue(pc.system.currency), 40); assert.equal(walletValue(m.system.currency), 10);
  assert.equal(m.items.get("rope").system.quantity, 1); assert.equal(pc.items.get("owned").system.quantity, 2);
  assert.equal(pc.items.size, 1); assert.equal(log.records[0].status, "completed");
  assert.equal(m.getFlag("devils-table", "merchant.relationships.pc").spentMinor, 10);
});
test("sell and combined trade settle net, preserve state, and update earned totals", async () => {
  setup(); const m = new Actor("merchant", 100, [good("rope", 1, 10)]), pc = new Actor("pc", 0, [good("sale", 1, 30)]);
  pc.items.get("sale").data.flags.other = { custom: "retained" };
  await trade(m, pc, { ...req(), sales: [{ id: "sale", quantity: 1 }] });
  assert.equal(walletValue(pc.system.currency), 20); assert.equal(walletValue(m.system.currency), 80);
  const received = [...m.items].find(i => i.getFlag("other", "custom") === "retained"); assert.ok(received);
  assert.equal(pc.items.has("sale"), false);
  const memory = m.getFlag("devils-table", "merchant.relationships.pc"); assert.equal(memory.receivedMinor, 30); assert.equal(memory.visits, 1);
});
test("insufficient player or merchant money blocks before writes; infinite funds are explicit", async () => {
  setup(); const m = new Actor("merchant", 0, [good()]), pc = new Actor("pc", 0, [good("sale")]);
  assert.throws(() => quoteTrade(m, pc, req()), /enough money/);
  const sale = { id: "sale", lines: [], sales: [{ id: "sale", quantity: 1 }] };
  assert.throws(() => quoteTrade(m, pc, sale), /merchant does not/);
  await m.setFlag("devils-table", "merchant.settings.walletMode", "infinite");
  await trade(m, pc, sale); assert.equal(pc.system.currency.cp, 10); assert.equal(m.system.currency.cp, 0);
});
test("exact denomination solver permits change but does not invent coins", () => {
  setup(); const delta = exactPayment({ gp: 1 }, { sp: 3 }, 70); assert.equal(delta.gp, 1); assert.equal(delta.sp, -3);
  assert.throws(() => exactPayment({ gp: 1 }, {}, 70), /cannot settle/);
  assert.throws(() => exactPayment({ gp: 1 }, { sp: 3 }, 70, 1), /search limit/);
  const m = new Actor("merchant"), pc = new Actor("pc"); pc.system.currency.gp = 1; m.system.currency.sp = 3;
  const payment = planPayment(pc, m, 70, { exactChange: true, walletMode: "finite" });
  assert.equal(walletValue(payment.character), 30); assert.equal(walletValue(payment.merchant), 100);
});
for (const players of [2, 3, 5]) test(`${players} simultaneous buyers cannot duplicate the final item`, async () => {
  setup(); const m = new Actor("merchant", 0, [good()]);
  const pcs = Array.from({ length: players }, (_, i) => new Actor(`pc${i}`, 50));
  const result = await Promise.allSettled(pcs.map((pc, i) => trade(m, pc, req(`request${i}`))));
  assert.equal(result.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(m.items.get("rope").system.quantity, 0);
  assert.equal(pcs.reduce((n, pc) => n + [...pc.items].reduce((s, i) => s + i.system.quantity, 0), 0), 1);
  assert.equal(pcs.reduce((n, pc) => n + walletValue(pc.system.currency), 0) + walletValue(m.system.currency), players * 50);
});
test("failed item creation restores funds and stock; partial creation is also rolled back", async () => {
  for (const partial of [false, true]) {
    setup(); const m = new Actor("merchant", 0, [good()]), pc = new Actor("pc", 50); const log = ledger();
    const create = pc.createEmbeddedDocuments.bind(pc);
    pc.createEmbeddedDocuments = async (...args) => { if (partial) await create(...args); throw Error("injected failure"); };
    await assert.rejects(trade(m, pc, req(), log), /injected failure/);
    assert.equal(walletValue(pc.system.currency), 50); assert.equal(walletValue(m.system.currency), 0);
    assert.equal(m.items.get("rope").system.quantity, 1); assert.equal(pc.items.size, 0);
    assert.equal(log.records[0].status, "rolled-back"); assert.equal(m.getFlag("devils-table", "transactionPending"), undefined);
  }
});
test("external edits prevent destructive rollback and leave durable recovery block", async () => {
  setup(); const m = new Actor("merchant", 0, [good()]), pc = new Actor("pc", 50); const log = ledger();
  pc.createEmbeddedDocuments = async () => { m.items.get("rope").data.system.quantity = 7; throw Error("conflict"); };
  await assert.rejects(trade(m, pc, req(), log), /needs GM recovery/);
  assert.equal(m.items.get("rope").system.quantity, 7); assert.equal(log.records[0].status, "needs-recovery");
  assert.ok(m.getFlag("devils-table", "transactionPending"));
  await assert.rejects(trade(m, pc, req("retry")), /needs recovery/);
});
test("different mechanical state never merges; nested items fail before money moves", async () => {
  setup(); const m = new Actor("merchant", 0, [good()]), pc = new Actor("pc", 50, [good("different")]);
  pc.items.get("different").data.system.description.value = "Different mechanics";
  await trade(m, pc); assert.equal(pc.items.size, 2);
  m.items.get("rope").data.system.quantity = 1; m.items.get("rope").data.system.container = "bag";
  await assert.rejects(trade(m, pc, req("nested")), /container/); assert.equal(pc.system.currency.cp, 40);
});
test("a later failure restores a fully sold character Item with its original data", async () => {
  setup(); const m = new Actor("merchant", 100), pc = new Actor("pc", 0, [good("sale", 1, 30)]);
  const original = pc.items.get("sale").toObject(); const setFlag = m.setFlag.bind(m);
  m.setFlag = async (ns, key, value) => { if (key.startsWith("merchant.relationships.")) throw Error("memory failure"); return setFlag(ns, key, value); };
  await assert.rejects(trade(m, pc, { id: "sell-rollback", lines: [], sales: [{ id: "sale", quantity: 1 }] }), /memory failure/);
  assert.deepEqual(pc.items.get("sale").toObject(), original); assert.equal(m.items.size, 0);
  assert.equal(pc.system.currency.cp, 0); assert.equal(m.system.currency.cp, 100);
});
