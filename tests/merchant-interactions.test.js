import test from "node:test";
import assert from "node:assert/strict";
import { Actor, good, setup, ledger } from "./support/trade-world.js";
import { combinedPercent, percent, priced, pricingTerms } from "../scripts/merchant/pricing.js";
import { quoteTrade, purchaseOffers } from "../scripts/merchant/trade-model.js";
import { confidence, interactionSuggestion, interactionQuote, nextMemory } from "../scripts/merchant/interactions.js";
import { executeTrade } from "../scripts/merchant/transaction.js";

const ns = "devils-table";
const request = { id: "trade", userId: "player", lines: [{ id: "rope", quantity: 1 }], sales: [] };
test("signed pricing supports additive and compound rules, bounded values and per-unit rounding", () => {
  assert.equal(combinedPercent([-10, -20]), -30);
  assert.equal(combinedPercent([-10, -20], "compound"), -28);
  assert.equal(combinedPercent([-100, -10]), -100);
  assert.equal(priced(84, -10), 76);
  assert.equal(priced(84, 20), 101);
  for (const value of [NaN, Infinity, -101, 501, 1.111]) assert.throws(() => percent(value));
  assert.throws(() => combinedPercent([500, 500, 500], "compound"), /limit/);
});
test("character pricing remains isolated and native catalogue prices never change", async () => {
  setup(); const m = new Actor("merchant", 0, [good("rope", 2, 100)]), a = new Actor("a", 1000), b = new Actor("b", 1000);
  await m.setFlag(ns, "merchant.settings", { merchantModifier: -10, stacking: "compound" });
  await m.setFlag(ns, "merchant.relationships.a", { pricingModifier: -20, negotiationModifier: -10 });
  assert.equal(purchaseOffers(m, a)[0].copper, 65);
  assert.equal(purchaseOffers(m, b)[0].copper, 90);
  assert.equal(m.items.get("rope").system.price.value, 100);
  const q = quoteTrade(m, a, request);
  assert.equal(q.originalTotal, 100); assert.equal(q.total, 65); assert.equal(q.discount, 35);
  assert.equal(q.adjustment, -35);
  await executeTrade({ merchant: m, character: a, request, quote: q, receiptAdapter: ledger() });
  assert.equal(m.getFlag(ns, "merchant.relationships.a.lifetimeDiscountMinor"), 35);
  assert.equal(m.getFlag(ns, "merchant.relationships.a.negotiationModifier"), 0);
  assert.equal(m.getFlag(ns, "merchant.relationships.b"), undefined);
});
test("legacy multipliers retain their ordinary price and GM previews do not require settlement", async () => {
  setup(); const m = new Actor("merchant", 0, [good()]), pc = new Actor("pc");
  await m.setFlag(ns, "merchant.settings", { sellModifier: 1.2 });
  assert.equal(pricingTerms(m, pc).merchant, 20);
  assert.throws(() => quoteTrade(m, pc, request), /enough money/);
  const q = quoteTrade(m, pc, request, { pricing: { review: -10 }, lines: [{ id: "rope", direction: "buy", quantity: 1, percent: 0 }] }, { settlement: false });
  assert.equal(q.total, 11); assert.equal(q.payment, null);
});
test("interaction suggestions scale by margin but GM-selected outcomes and modifiers prevail", () => {
  assert.equal(interactionSuggestion("negotiation", 15, 15).modifier, -5);
  assert.equal(interactionSuggestion("negotiation", 25, 15).modifier, -15);
  assert.equal(interactionSuggestion("negotiation", 60, 15).modifier, -25);
  assert.equal(interactionSuggestion("theft", 14, 15).outcome, "failure-unnoticed");
  assert.equal(interactionSuggestion("theft", 10, 15).outcome, "failure-noticed");
  assert.equal(interactionSuggestion("theft", 5, 15).outcome, "caught");
  const memory = nextMemory({ state: "Trusted" }, { interaction: { kind: "negotiation", outcome: "failure", modifier: -10 } }, "pc", "now");
  assert.equal(memory.failedNegotiations, 1); assert.equal(memory.negotiationModifier, -10); assert.equal(memory.state, "Trusted");
});
for (const outcome of ["success", "failure-unnoticed", "failure-noticed", "caught"]) {
  test(`theft ${outcome} uses the recoverable pipeline and never changes coins`, async () => {
    setup(); const m = new Actor("merchant", 20, [good("rope", 2, 100)]), pc = new Actor("pc", 30), log = ledger();
    const req = { id: "theft", kind: "theft", itemId: "rope" };
    const quote = interactionQuote(m, pc, req, { outcome, total: 10, dc: 15 });
    await executeTrade({ merchant: m, character: pc, request: req, quote, receiptAdapter: log });
    assert.equal(m.system.currency.cp, 20); assert.equal(pc.system.currency.cp, 30);
    assert.equal(m.items.get("rope").system.quantity, outcome === "success" ? 1 : 2);
    assert.equal(pc.items.size, outcome === "success" ? 1 : 0);
    const memory = m.getFlag(ns, "merchant.relationships.pc");
    assert.equal(memory.successfulThefts ?? 0, outcome === "success" ? 1 : 0);
    assert.equal(memory.caughtStealing ?? 0, ["caught", "failure-noticed"].includes(outcome) ? 1 : 0);
    assert.equal(memory.successfulPurchases, undefined); assert.equal(memory.spentMinor, undefined);
    assert.equal(log.records[0].quote.interaction.dc, 15);
  });
}
test("failed theft creation restores stock and leaves no successful theft memory", async () => {
  setup(); const m = new Actor("merchant", 20, [good()]), pc = new Actor("pc", 30), log = ledger();
  pc.createEmbeddedDocuments = async () => { throw Error("injected theft failure"); };
  const req = { id: "theft", kind: "theft", itemId: "rope" };
  await assert.rejects(executeTrade({ merchant: m, character: pc, request: req,
    quote: interactionQuote(m, pc, req, { outcome: "success" }), receiptAdapter: log }), /injected theft failure/);
  assert.equal(m.items.get("rope").system.quantity, 1); assert.equal(pc.items.size, 0);
  assert.equal(m.getFlag(ns, "merchant.relationships.pc"), undefined);
  assert.equal(log.records[0].status, "rolled-back");
});
test("approved negotiation stores a one-purchase offer and private bounded confidence", async () => {
  setup(); const m = new Actor("merchant", 0, [good()]), pc = new Actor("pc", 50);
  const req = { id: "negotiation", kind: "negotiation" };
  await executeTrade({ merchant: m, character: pc, request: req,
    quote: interactionQuote(m, pc, req, { outcome: "success", modifier: -20 }), receiptAdapter: ledger() });
  assert.equal(confidence(m), 1); assert.equal(m.getFlag(ns, "merchant.relationships.pc.successfulNegotiations"), 1);
  assert.equal(quoteTrade(m, pc, request).total, 8);
  assert.equal(m.system.currency.cp, 0); assert.equal(pc.system.currency.cp, 50); assert.equal(pc.items.size, 0);
});
