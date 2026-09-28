import test from "node:test";
import assert from "node:assert/strict";
import { setup, Actor, good } from "./support/trade-world.js";
import { resetMerchant } from "../scripts/merchant/reset-merchant.js";
import { merchantSlots } from "../scripts/merchant/operation-guard.js";
import { editStockQuantities } from "../scripts/merchant/builder/service.js";
function world() {
  setup();const actor=new Actor("merchant",123,[good()]);const pc=new Actor("pc");game.actors=[actor,pc];
  actor.flags.other={keep:true};actor.flags["devils-table"].merchant.relationships={pc:{visits:3}};
  let entry=true;const token={actorId:actor.id,getFlag:()=>entry,unsetFlag:async()=>{entry=undefined;}};game.scenes=[{tokens:[token]}];
  const records=new Map();for(const [id,status] of [["trade","completed"],["reject","rejected"]])records.set(id,{id,uuid:`Receipt.${id}`,getFlag:()=>({merchantId:actor.id,status})});
  const pack={locked:true,configure:async options=>{pack.locked=options.locked;},getDocument:async id=>records.get(id)};
  const io={confirm:async()=>true,readReceipts:async()=>({pack,docs:[...records.values()]}),deleteReceipts:async(_pack,ids)=>{ids.forEach(id=>records.delete(id));}};
  return {actor,pc,token,records,pack,io};
}
test("reset removes shop and history but preserves ordinary NPC data, goods and cash",async()=>{
  const {actor,token,records,pack,io}=world();const before=structuredClone(actor.system);const goods=[...actor.items].map(i=>i.toObject());
  assert.equal(await resetMerchant(actor,io),true);assert.equal(actor.getFlag("devils-table","merchant"),undefined);assert.equal(token.getFlag(),undefined);assert.equal(records.size,0);assert.equal(pack.locked,true);
  assert.deepEqual(actor.system,before);assert.deepEqual([...actor.items].map(i=>i.toObject()),goods);assert.deepEqual(actor.flags.other,{keep:true});
});
test("cancel leaves merchant, history and token unchanged",async()=>{
  const {actor,token,records,io}=world();assert.equal(await resetMerchant(actor,{...io,confirm:async()=>false}),false);
  assert.equal(actor.getFlag("devils-table","merchant.enabled"),true);assert.equal(token.getFlag(),true);assert.equal(records.size,2);
});
test("checkout locks and unresolved receipts prevent destructive reset",async()=>{
  const {actor,pc,records,io}=world();merchantSlots.acquire(actor.id,"busy");try{await assert.rejects(resetMerchant(actor,io),/serving/);}finally{merchantSlots.release(actor.id,"busy");}
  await pc.setFlag("devils-table","transactionPending","Receipt.trade");await assert.rejects(resetMerchant(actor,io),/Resolve interrupted/);assert.equal(records.size,2);
  await pc.unsetFlag("devils-table","transactionPending");records.set("pending",{id:"pending",uuid:"Receipt.pending",getFlag:()=>({status:"needs-recovery"})});await assert.rejects(resetMerchant(actor,io),/Resolve interrupted/);
});
test("partial deletion fails closed and can be retried without restoring deleted history",async()=>{
  const {actor,records,pack,io}=world();await assert.rejects(resetMerchant(actor,{...io,deleteReceipts:async()=>{records.delete("trade");throw Error("interrupted");}}),/Reset incomplete/);
  assert.equal(actor.getFlag("devils-table","merchant.enabled"),false);assert.equal(pack.locked,true);assert.equal(records.size,1);
  await resetMerchant(actor,io);assert.equal(records.size,0);assert.equal(actor.getFlag("devils-table","merchant"),undefined);
});
test("stale merchant confirmation and non-GM requests cannot reset",async()=>{
  const {actor,io}=world();await assert.rejects(resetMerchant(actor,{...io,confirm:async()=>{await actor.setFlag("devils-table","merchant.notes","changed");return true;}}),/changed/);
  game.user.isGM=false;await assert.rejects(resetMerchant(actor,io),/active GM/);
});
test("manual stock quantities only alter proposed additions and zero omits a row",()=>{
  const preview={items:[{id:"new",quantity:3},{id:"old",quantity:7,skip:true}]};
  assert.deepEqual(editStockQuantities(preview,[{id:"new",quantity:0}],100).items,[preview.items[1]]);assert.equal(preview.items[0].quantity,3);
  assert.throws(()=>editStockQuantities(preview,[{id:"old",quantity:2}],100),/existing/);assert.throws(()=>editStockQuantities(preview,[{id:"new",quantity:101}],100),/whole/);
});
test("real receipt selection preserves other merchants and strips only offer controls from Items",async()=>{
  const {actor,records,pack,io}=world();
  const other={id:"other",uuid:"Receipt.other",getFlag:()=>({merchantId:"another",status:"completed"})};records.set(other.id,other);
  pack.documentName="JournalEntry";pack.metadata={packageType:"world"};pack.collection="world.devils-table-transactions";
  pack.getIndex=async()=>new Map([...records.values()].map(doc=>[doc.id,{_id:doc.id,flags:{"devils-table":{transaction:doc.getFlag()}}}]));
  game.packs=new Map([[pack.collection,pack]]);
  const item=actor.items.get("rope");item.data.flags["devils-table"].offer={unitPrice:99};item.data.flags["devils-table"].sourceId="permanent";
  item.unsetFlag=async(ns,key)=>{delete item.data.flags[ns][key];};
  await resetMerchant(actor,{confirm:io.confirm,deleteReceipts:io.deleteReceipts});
  assert.equal(records.size,1);assert.equal(records.get("other"),other);assert.equal(item.getFlag("devils-table","offer"),undefined);assert.equal(item.getFlag("devils-table","sourceId"),"permanent");
});
