import test from "node:test";
import assert from "node:assert/strict";
import { readJson, fakeAdapter } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { catalogueRegistry } from "../scripts/catalogues/registry.js";
import { serviceRegistry } from "../scripts/services/registry.js";
import { serviceOffers } from "../scripts/services/offers.js";
import { stockProfiles, stockGroups } from "../scripts/data/stock-catalogue.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { publicOffers } from "../scripts/merchant/model.js";
import { purchaseOffers, quoteTrade } from "../scripts/merchant/trade-model.js";
import { interactionQuote } from "../scripts/merchant/interactions.js";
import { executeTrade } from "../scripts/merchant/transaction.js";
import { visibleOffer, validateVisibility } from "../scripts/merchant/visibility.js";
import { stockVisibilitySnapshot, saveStockVisibility } from "../scripts/merchant/stock-visibility.js";
import { merchantSlots } from "../scripts/merchant/operation-guard.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";
import { rollStockList } from "../scripts/stock/stock-roller.js";
import { compileSchema } from "../scripts/validation/schema-validator.js";
import { Actor, setup, good, ledger } from "./support/trade-world.js";
const data=await loadStockCatalogue({readJson});
catalogueRegistry.register({catalogues:data.catalogueDefinitions,categories:data.categoryDefinitions});
serviceRegistry.register(await readJson("data/services.json"));
const rows=data.entries.map(e=>e.item).filter(i=>i.shops.includes("black-market"));
const world=()=>{setup();game.settings.get=(_ns,key)=>key==="serviceDefinitions"?{categories:[],services:[]}:key==="debugLogging"?false:"unlimited";};
const merchant=async(items=[])=>{const m=new Actor("merchant",0,items);await m.setFlag("devils-table","merchant.catalogueId","black-market");return m;};
test("Fence builds 48 canonical goods without duplicating shared equipment",async()=>{
 assert.equal(rows.length,48);assert.equal(rows.filter(i=>i.id.startsWith("DT_ITEM_BMK_")).length,35);
 const {adapter,state}=fakeAdapter(),build=createBuilder({load:()=>data,adapter});
 await build({dryRun:false});assert.equal(state.docs.length,440);
 assert.equal((await build({dryRun:false,shopId:"black-market"})).unchanged,48);
 const tools=rows.filter(i=>i.mechanics.type==="tool");assert.equal(tools.length,4);
 assert.deepEqual(tools.map(i=>i.mechanics.native.type.baseItem).sort(),["disg","forg","pois","thief"]);
});
test("all merchants use the same visibility policy and invalid policies fail closed",async()=>{
 world();const m=await merchant(),pc=new Actor("pc"),other=new Actor("other");
 const rule={mode:"relationship",minPurchases:3};
 assert.equal(visibleOffer(m,pc,rule),false);await m.setFlag("devils-table","merchant.relationships.pc",{successfulPurchases:3,visits:20});
 assert.equal(visibleOffer(m,pc,rule),true);assert.equal(visibleOffer(m,other,rule),false);assert.equal(visibleOffer(m,null,rule),false);
 await m.setFlag("devils-table","merchant.settings.restrictedOffers",true);
 assert.equal(visibleOffer(m,other,rule),true);assert.equal(visibleOffer(m,pc,{mode:"hidden"}),false);
 assert.equal(visibleOffer(m,pc,{mode:"hidden",revealed:true}),true);
 assert.equal(visibleOffer(m,pc,{mode:"unknown"}),false);
 for(const bad of [{mode:"relationship",minPurchases:-1},{mode:"hidden",revealed:"true"},{mode:"public",script:"true"}])assert.throws(()=>validateVisibility(bad));
 // Demonstrate policy reuse outside the Fence catalogue.
 await m.setFlag("devils-table","merchant.catalogueId","general-store");assert.equal(visibleOffer(m,pc,rule),true);
});
test("hidden stock is absent from projection, checkout and theft even with a forged known Item ID",async()=>{
 world();const doc=catalogueEntryToItem(rows.find(i=>i.id==="DT_ITEM_BMK_STOLEN_SIGNET"));doc.flags["devils-table"].offer={visibility:{mode:"hidden"}};
 const m=await merchant([doc]),pc=new Actor("pc",50000);
 assert.equal(publicOffers(m,pc).length,0);assert.equal(purchaseOffers(m,pc).length,0);
 const request={lines:[{id:doc._id,quantity:1}],sales:[]};assert.throws(()=>quoteTrade(m,pc,request),/Stock has changed/);
 assert.throws(()=>interactionQuote(m,pc,{kind:"theft",itemId:doc._id},{outcome:"success"}),/no longer available/);
 await m.updateEmbeddedDocuments("Item",[{_id:doc._id,"flags.devils-table.offer.visibility":{mode:"hidden",revealed:true}}]);
 const projected=publicOffers(m,pc);assert.equal(projected.length,1);assert.ok(!JSON.stringify(projected).includes('visibility'));
});
test("service default policies hide arrangements until explicitly revealed and preserve availability requirements",async()=>{
 world();const m=await merchant(),pc=new Actor("pc",50000);await m.setFlag("devils-table","merchant.economy",{profile:"fence-guild"});
 await m.setFlag("devils-table","merchant.services",{DT_SERVICE_BMK_ACQUIRE_CONTRABAND:{enabled:true}});
 assert.equal(serviceOffers(m,pc,{includeUnavailable:true}).length,0);
 await m.setFlag("devils-table","merchant.services.DT_SERVICE_BMK_ACQUIRE_CONTRABAND.visibility",{mode:"hidden",revealed:true});
 assert.equal(serviceOffers(m,pc).length,1);
 await m.setFlag("devils-table","merchant.services.DT_SERVICE_BMK_ACQUIRE_CONTRABAND.enabled",false);assert.equal(serviceOffers(m,pc).length,0);
 await m.setFlag("devils-table","merchant.services.DT_SERVICE_BMK_ACQUIRE_CONTRABAND.enabled",true);
 await m.setFlag("devils-table","merchant.economy",{profile:"fence-cautious"});assert.equal(serviceOffers(m,pc).length,0);
});
test("visibility editing preserves unrelated offers and obeys stale state, checkout and GM guards",async()=>{
 world();const doc=good("x");doc.flags["devils-table"].offer={unitPrice:77,publicDescription:"Approved"};
 const m=await merchant([doc]),snapshot=stockVisibilitySnapshot(m),rows=[{id:"x",visibility:{mode:"hidden"}}];
 merchantSlots.acquire(m.id,"pending");try{await assert.rejects(saveStockVisibility(m,rows,snapshot),/serving/);}finally{merchantSlots.release(m.id,"pending");}
 await saveStockVisibility(m,rows,snapshot);assert.equal(m.items.get("x").getFlag("devils-table","offer").unitPrice,77);
 await assert.rejects(saveStockVisibility(m,rows,snapshot),/changed/);
 game.user.isGM=false;await assert.rejects(saveStockVisibility(m,rows,stockVisibilitySnapshot(m)),/active GM/);
});
test("profile stock is sparse, distinct, and generated rules stay on merchant offers",async()=>{
 world();const profiles=stockProfiles(data).filter(p=>p.shop==="black-market");assert.equal(profiles.length,6);
 const cautious=profiles.find(p=>p.name==="Cautious Fence"),travelling=profiles.find(p=>p.name==="Travelling Fence");
 assert.ok(Object.values(stockGroups(data,cautious)).flat().every(i=>!i.tags.includes("restricted")));
 assert.ok(Object.values(stockGroups(data,travelling)).flat().every(i=>i.weight.value<=1));
 const tables=stockTableDocuments(data,{shopId:"black-market",profileId:"DT_TABLE_BMK_GUILD"});
 const {adapter}=fakeAdapter({existing:tables});
 const result=await rollStockList({shopId:"black-market",profileId:"DT_TABLE_BMK_GUILD",load:()=>data,adapter,rollDie:async()=>1});
 assert.ok(result.items.every(i=>i.quantity<=2));assert.ok(result.items.some(i=>i.visibility?.mode==="relationship"));
 const rotating=tables.find(t=>t.flags["devils-table"].tier==="rotating");assert.deepEqual(rotating.results.map(r=>r.range),[[1,40],[41,90],[91,100]]);
});
test("mixed Fence checkout uses one payment and receipt, and offer policies do not transfer to the buyer",async()=>{
 world();const doc=catalogueEntryToItem(rows.find(i=>i.id==="DT_ITEM_BMK_SEAL_BLANKS"));doc.flags["devils-table"].offer={visibility:{mode:"relationship",minPurchases:1}};
 const m=await merchant([doc]),pc=new Actor("pc",10000);game.actors=[m,pc];await m.setFlag("devils-table","merchant.relationships.pc",{successfulPurchases:1});
 await m.setFlag("devils-table","merchant.services",{DT_SERVICE_BMK_FORGERY:{enabled:true}});
 const request={id:"mixed-fence",userId:"player",lines:[{id:doc._id,quantity:1},{id:"service:DT_SERVICE_BMK_FORGERY",quantity:1}],sales:[]},log=ledger();
 await executeTrade({merchant:m,character:pc,request,quote:quoteTrade(m,pc,request),receiptAdapter:log});
 assert.equal(m.system.currency.cp,900);assert.equal(pc.system.currency.cp,9100);assert.equal(log.records.length,1);
 assert.equal([...pc.items][0].getFlag("devils-table","offer"),undefined);assert.equal(m.getFlag("devils-table","merchant.relationships.pc.successfulPurchases"),2);
});
test("failed transfer compensates funds and retains hidden merchant policy",async()=>{
 world();const doc=good("x");doc.flags["devils-table"].offer={visibility:{mode:"hidden",revealed:true}};
 const m=await merchant([doc]),pc=new Actor("pc",1000);game.actors=[m,pc];pc.createEmbeddedDocuments=async()=>{throw Error("transfer failed");};
 const request={id:"failed-fence",userId:"player",lines:[{id:"x",quantity:1}],sales:[]};
 await assert.rejects(executeTrade({merchant:m,character:pc,request,quote:quoteTrade(m,pc,request),receiptAdapter:ledger()}),/transfer failed/);
 assert.equal(pc.system.currency.cp,1000);assert.equal(m.system.currency.cp,0);assert.equal(m.items.get("x").system.quantity,1);assert.deepEqual(m.items.get("x").getFlag("devils-table","offer.visibility"),{mode:"hidden",revealed:true});
});
test("shared schema upper bounds reject oversized generation policies",()=>{
 const validate=compileSchema({type:"integer",minimum:1,maximum:100});assert.equal(validate(101).length,1);assert.equal(validate(100).length,0);
});

test("Merchant Builder guarantees four practical Fence products even when all rotating attempts miss",async()=>{
 const { generationSettings, estimateGeneration, generateStock }=await import("../scripts/merchant/builder/generation.js");
 const { loadBuilderPolicy }=await import("../scripts/merchant/builder/model.js");
 const context={catalogue:data,economy:await readJson("data/economy.json"),policy:await loadBuilderPolicy({readJson})};
 const templates=(await readJson("data/merchant-templates.json")).filter(t=>t.settings.catalogueId==="black-market");
 const signatures=new Set();
 for(const {settings:draft} of templates){
  const options=generationSettings(draft,context),groups=stockGroups(data,options.profile);
  assert.equal(groups.always.length,4,options.profile.name);assert.ok(groups.always.every(i=>!i.tags.some(t=>["restricted","contraband","stolen"].includes(t))));
  signatures.add(groups.always.map(i=>i.id).join(","));
  const {adapter}=fakeAdapter({existing:stockTableDocuments(data,{shopId:"black-market",profileId:options.profile.id})});
  const result=await generateStock(draft,context,{roll:args=>rollStockList({...args,adapter,rollDie:async sides=>sides})});
  assert.ok(result.items.length>=4);assert.ok(result.items.every(i=>i.quantity<=options.profile.quantityLimit));
  if(draft.stockProfileId==="DT_TABLE_BMK_CAUTIOUS"){
   assert.equal(options.draws,6);assert.deepEqual(options.tierChances,{often:50,rarely:15});
   assert.equal(result.items.length,4);assert.ok(estimateGeneration(draft,context).count>7.8);
  }
 }
 assert.ok(signatures.size>=4,"profiles retain different practical ranges");
});
