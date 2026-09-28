import test from "node:test";
import assert from "node:assert/strict";
import { Actor, good, setup } from "./support/trade-world.js";
import { markOfferGroups, groupedOffers, groupedBasket, basketMember } from "../scripts/merchant/offer-groups.js";
import { publicOffers } from "../scripts/merchant/model.js";

test("identical empty containers display one quantity while basket retains concrete Item IDs", () => {
  setup();
  const actor=new Actor("merchant",0,["a","b","c"].map(id=>({...good(id),type:"container"})));
  const before=[...actor.items].map(i=>i.toObject());
  const offers=markOfferGroups(actor,publicOffers(actor));
  assert.equal(groupedOffers(offers).length,1);assert.equal(groupedOffers(offers)[0].quantity,3);
  const basket=new Map();
  for(let n=0;n<3;n++){const next=basketMember(offers,basket,"a",true);basket.set(next.id,1);}
  assert.deepEqual([...basket.keys()],["a","b","c"]);assert.equal(basketMember(offers,basket,"a",true),undefined);
  assert.equal(groupedBasket(offers,basket)[0].count,3);assert.equal(groupedBasket(offers,basket)[0].subtotal,30);
  basket.delete(basketMember(offers,basket,"a",false).id);assert.equal(groupedBasket(offers,basket)[0].count,2);
  assert.deepEqual([...actor.items].map(i=>i.toObject()),before);
});
test("different mechanics, prices, contents and ordinary Items are not combined", () => {
  setup();
  const actor=new Actor("merchant",0,["a","b","c","d"].map(id=>({...good(id),type:"container"})));
  actor.items.get("b").data.system.capacity={weight:99};
  actor.items.get("c").data.system.price.value=20;
  actor.items.get("d").data.system.container="a";
  assert.equal(groupedOffers(markOfferGroups(actor,publicOffers(actor))).length,4);
  const ordinary=new Actor("merchant",0,[good("a"),good("b")]);
  assert.equal(groupedOffers(markOfferGroups(ordinary,publicOffers(ordinary))).length,2);
});
