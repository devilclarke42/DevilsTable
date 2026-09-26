import test from "node:test";
import assert from "node:assert/strict";
import { offerTerms, confirmRevisedOffer } from "../scripts/merchant/revised-offer.js";

test("revised offer projects public terms and shows escaped old/new prices and quantities", async () => {
  let dialog;
  globalThis.foundry = { applications: { api: { DialogV2: { confirm: async data => { dialog = data; return false; } } } } };
  const previous = offerTerms({ total: 84, payment: { private: true }, basket: [{ id: "a", name: "<Backpack>", direction: "buy", quantity: 1, copper: 84, private: true }] });
  const revised = offerTerms({ total: 90, basket: [{ ...previous.basket[0], copper: 90 }] });
  assert.equal(previous.payment, undefined); assert.equal(previous.basket[0].private, undefined);
  assert.equal(await confirmRevisedOffer({ merchant: "<Merchant>", previous, revised }), false);
  assert.match(dialog.content, /8 sp 4 cp/); assert.match(dialog.content, /9 sp/);
  assert.match(dialog.content, /&lt;Backpack&gt;/); assert.match(dialog.content, /&lt;Merchant&gt;/);
  assert.equal(dialog.rejectClose, false);
});
