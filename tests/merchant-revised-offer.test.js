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

test("room time revisions display both old and new terms without private integration settings",async()=>{
 let content;
 globalThis.foundry={applications:{api:{DialogV2:{confirm:async data=>{content=data.content;return true;}}}}};
 const quote={total:10,basket:[{id:"service:room",direction:"buy",name:"Room",quantity:1,copper:10,accommodation:true,nights:3,checkoutTime:"10:00",actions:[{secret:true}]}]};
 const previous=offerTerms(quote);quote.basket[0].checkoutTime="11:30";const revised=offerTerms(quote);
 assert.equal(await confirmRevisedOffer({merchant:"Inn",previous,revised}),true);
 assert.match(content,/3 night\(s\), checkout 10:00/);assert.match(content,/checkout 11:30/);
 assert.equal(JSON.stringify(revised).includes("secret"),false);
});
