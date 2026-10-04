import test from "node:test";
import assert from "node:assert/strict";
import {readJson} from "./helpers.js";
import {setup,Actor,ledger} from "./support/trade-world.js";
import {serviceRegistry,ServiceRegistry} from "../scripts/services/registry.js";
import {catalogueRegistry} from "../scripts/catalogues/registry.js";
import {serviceOffers} from "../scripts/services/offers.js";
import {saveConfiguration} from "../scripts/merchant/builder/service.js";
import {configurationSnapshot,loadBuilderPolicy} from "../scripts/merchant/builder/model.js";
import {loadEconomy} from "../scripts/merchant/economy.js";
import {loadStockCatalogue} from "../scripts/data/stock-loader.js";
import {catalogueEntryToItem} from "../scripts/builders/item-factory.js";
import {quoteTrade} from "../scripts/merchant/trade-model.js";
import {executeTrade} from "../scripts/merchant/transaction.js";
import {coinValue} from "../scripts/merchant/model.js";
const data=await readJson("data/services.json"),templates=await readJson("data/merchant-templates.json");
serviceRegistry.register(data);
const context={economy:await loadEconomy({readJson}),policy:await loadBuilderPolicy({readJson}),catalogue:await loadStockCatalogue({readJson}),registry:catalogueRegistry};
catalogueRegistry.register({catalogues:context.catalogue.catalogueDefinitions,categories:context.catalogue.categoryDefinitions});
function world(){setup();game.settings.get=(_ns,key)=>key==="serviceDefinitions"?{categories:[],services:[]}:key==="debugLogging"?false:"unlimited";const m=new Actor("merchant"),pc=new Actor("pc",1000);game.actors=[m,pc];game.scenes=[];return {m,pc};}
async function configure(m,id){await saveConfiguration(m,structuredClone(templates.find(r=>r.id===id).settings),context,configurationSnapshot(m));}
const suffixes=(m,pc)=>serviceOffers(m,pc).map(r=>r.serviceId.replace("DT_SERVICE_TAV_","")).sort();
test("sixteen production services use known icons, complete ranges, durations and stable distinct IDs",async()=>{
 assert.equal(data.services.length,16);assert.equal(data.categories.length,6);
 const icons=new Set((await readJson("tests/fixtures/core-icon-references.json")).icons.map(r=>r.icon));
 for(const row of data.services){assert.match(row.id,/^DT_SERVICE_TAV_/);assert.ok(icons.has(row.icon));assert.ok(row.saleUnit&&row.duration);assert.ok(coinValue(row.recommendedRange.min)<=coinValue(row.price));assert.ok(coinValue(row.price)<=coinValue(row.recommendedRange.max));assert.deepEqual(row.execution,{});}
 assert.equal(new Set(data.services.map(r=>r.name)).size,16);
 for(const bad of [{duration:""},{saleUnit:""},{recommendedRange:{min:{value:99,denomination:"gp"},max:{value:1,denomination:"cp"}}}]){const copy=structuredClone(data);Object.assign(copy.services[0],bad);assert.throws(()=>new ServiceRegistry().register(copy));}
});
test("Builder saves seed data-driven poor, roadside, town and luxury selections",async()=>{
 for(const [id,count] of [["poor-hamlet-tavern",5],["roadside-tavern",12],["town-inn",15],["luxury-city-inn",15]]){
  const {m,pc}=world();await configure(m,id);const offers=suffixes(m,pc);assert.equal(offers.length,count,id);assert.ok(offers.includes("BREAKFAST")&&offers.includes("FEED_HORSE"));
  assert.equal(offers.includes("LUXURY_ROOM"),id==="luxury-city-inn");assert.equal(m.items.size,0);assert.equal(m.system.currency.cp,0);
 }
});
test("repeat saves preserve disabled, repriced and removed defaults; upgrades add newly eligible services",async()=>{
 const {m,pc}=world();await configure(m,"roadside-tavern");
 await m.setFlag("devils-table","merchant.services.DT_SERVICE_TAV_BATH",{enabled:false,price:{value:7,denomination:"sp"}});
 await m.unsetFlag("devils-table","merchant.services.DT_SERVICE_TAV_LAUNDRY");
 await configure(m,"roadside-tavern");assert.equal(m.getFlag("devils-table","merchant.services.DT_SERVICE_TAV_LAUNDRY"),undefined);
 assert.deepEqual(m.getFlag("devils-table","merchant.services.DT_SERVICE_TAV_BATH"),{enabled:false,price:{value:7,denomination:"sp"}});
 await configure(m,"luxury-city-inn");assert.ok(suffixes(m,pc).includes("LUXURY_ROOM"));assert.ok(!suffixes(m,pc).includes("COMMON_ROOM"));assert.ok(!suffixes(m,pc).includes("LAUNDRY"));
});
test("real Tavern bread, ale and lodging settle in one checkout without creating service Items",async()=>{
 const {m,pc}=world();await configure(m,"roadside-tavern");
 const sourceIds=["DT_ITEM_TAV_SMALL_ALE","DT_ITEM_TAV_RYE_BREAD"];
 const docs=sourceIds.map(id=>catalogueEntryToItem(context.catalogue.entries.find(e=>e.item.id===id).item));
 await m.createEmbeddedDocuments("Item",docs);
 const req={id:"mixed-tavern",userId:"player",lines:[...docs.map(d=>({id:d._id,quantity:1})),{id:"service:DT_SERVICE_TAV_PRIVATE_ROOM",quantity:1}],sales:[]};
 const quote=quoteTrade(m,pc,req);assert.equal(quote.total,60+docs.reduce((n,d)=>n+coinValue(d.system.price),0));
 assert.match(quote.basket.find(r=>r.kind==="service").saleUnit,/two guests/);
 const log=ledger();await executeTrade({merchant:m,character:pc,request:req,quote,receiptAdapter:log});
 assert.equal(log.records[0].status,"completed");assert.equal(pc.items.size,2);assert.equal(pc.system.currency.cp,1000-quote.total);
 assert.equal(m.getFlag("devils-table","merchant.serviceStats.DT_SERVICE_TAV_PRIVATE_ROOM").purchased,1);
});
test("service catalogue stays out of Item builds; active Tavern food and drink preserve their identities",()=>{
 assert.equal(context.catalogue.entries.length,312);assert.equal(context.catalogue.entries.filter(e=>e.item.id.startsWith("DT_ITEM_TAV_")).length,168);
 assert.equal(context.catalogue.entries.some(e=>e.item.id.startsWith("DT_SERVICE_")),false);
});

test("accommodation definitions distinguish nightly and weekly terms without integrations",async()=>{
 const {m,pc}=world();await configure(m,"town-inn");
 const rooms=serviceOffers(m,pc).filter(row=>row.accommodation);
 assert.ok(rooms.length>0);
 for(const row of rooms){assert.equal(row.checkoutTime,"10:00");assert.equal(row.nights,row.serviceId==="DT_SERVICE_TAV_WEEKLY_LODGING"?7:1);}
 const copy=structuredClone(data);copy.services[0].nights=0;assert.throws(()=>new ServiceRegistry().register(copy),/nights/);
});
