import test from "node:test";
import assert from "node:assert/strict";
import {readJson,fakeAdapter} from "./helpers.js";
import {loadStockCatalogue} from "../scripts/data/stock-loader.js";
import {catalogueEntryToItem} from "../scripts/builders/item-factory.js";
import {createBuilder} from "../scripts/builders/compendium-builder.js";
import {validateItemRules} from "../scripts/validation/item-rules.js";
import {stockProfiles,stockGroups} from "../scripts/data/stock-catalogue.js";
import {serviceRegistry,ServiceRegistry} from "../scripts/services/registry.js";
import {eligibleService} from "../scripts/services/offers.js";
import {catalogueRegistry} from "../scripts/catalogues/registry.js";
import {Actor,setup,ledger} from "./support/trade-world.js";
import {quoteTrade} from "../scripts/merchant/trade-model.js";
import {executeTrade} from "../scripts/merchant/transaction.js";
const data=await loadStockCatalogue({readJson});
const rows=data.entries.map(e=>e.item).filter(i=>i.shops.includes("alchemist"));
const services=await readJson("data/services.json");
serviceRegistry.register(services);
catalogueRegistry.register({catalogues:data.catalogueDefinitions,categories:data.categoryDefinitions});
test("Alchemist shares six goods and adds 35 permanent, fully described records",async()=>{
 assert.equal(rows.length,41);assert.equal(rows.filter(i=>i.id.startsWith("DT_ITEM_ALC_")).length,35);
 const icons=new Set((await readJson("tests/fixtures/core-icon-references.json")).icons.map(i=>i.icon));
 for(const i of rows){assert.ok(i.icon.startsWith("modules/devils-table/")||icons.has(i.icon),i.name);assert.ok(i.saleUnit&&i.weight.notes&&i.description);}
});
test("healing doses use native healing dice, 2014 actions and self consumption",()=>{
 const formulas=[];
 for(const i of rows.filter(i=>i.mechanics.healing)){
  const doc=catalogueEntryToItem(i),a=Object.values(doc.system.activities)[0];
  assert.equal(a.type,"heal");assert.equal(a.activation.type,"action");assert.equal(a.consumption.targets[0].target,"");
  assert.equal(doc.system.uses.autoDestroy,true);assert.deepEqual(a.healing.types,["healing"]);
  formulas.push(`${a.healing.number}d${a.healing.denomination}+${a.healing.bonus}`);
 }
 assert.deepEqual(formulas,["2d4+2","4d4+4","8d4+8","10d4+20"]);
 const potion=rows.find(i=>i.id==="DT_ITEM_ALC_CLIMBING_POTION");
 assert.equal(Object.values(catalogueEntryToItem(potion).system.activities)[0].type,"utility");
 for(const patch of [{subtype:"food"},{use:{mode:"reusable",activation:"bonus"}},{healing:{number:21,denomination:4,bonus:2}}]){
  const bad=structuredClone(rows.find(i=>i.mechanics.healing));Object.assign(bad.mechanics,patch);assert.ok(validateItemRules(bad,"item").length);
 }
});
test("Alchemist scoped builds converge and never duplicate shared Item identities",async()=>{
 const {adapter,state}=fakeAdapter();const build=createBuilder({load:()=>data,adapter});
 await build({dryRun:false,shopId:"general-store"});
 const r=await build({dryRun:false,shopId:"alchemist"});assert.equal(r.create,35);assert.equal(r.unchanged,6);
 assert.equal((await build({dryRun:false,shopId:"alchemist"})).unchanged,41);
 assert.equal(new Set(state.docs.map(d=>d.flags["devils-table"].sourceId)).size,state.docs.length);
});
test("four presets select distinct generation scales and workshop services",async()=>{
 const profiles=stockProfiles(data).filter(p=>p.shop==="alchemist");assert.equal(profiles.length,4);
 const templates=(await readJson("data/merchant-templates.json")).filter(t=>t.settings.catalogueId==="alchemist");assert.equal(templates.length,4);
 const travelling=profiles.find(p=>p.id==="DT_TABLE_ALC_TRAVELLING");
 assert.ok(Object.values(stockGroups(data,travelling)).flat().every(i=>i.weight.value<=0.5&&i.availability!=="special-order"));
 const distill=services.services.find(s=>s.id==="DT_SERVICE_ALC_DISTILL_ALCOHOL");
 for(const t of templates){
  const m=new Actor("merchant");await m.setFlag("devils-table","merchant.economy",{profile:t.settings.profile});
  assert.equal(eligibleService(distill,m,{catalogueId:"alchemist"}),["alchemist-town","alchemist-master"].includes(t.id));
 }
 assert.doesNotThrow(()=>new ServiceRegistry().register(services));
 assert.ok(!services.services.some(s=>s.id.startsWith("DT_SERVICE_ALC_")&&/brew/i.test(s.name)));
});
test("mixed potion and preparation checkout pays once and preserves the selected herbs",async()=>{
 setup();game.settings.get=(_ns,key)=>key==="serviceDefinitions"?{categories:[],services:[]}:key==="debugLogging"?false:"unlimited";
 const mint=catalogueEntryToItem(rows.find(i=>i.id==="DT_ITEM_ALC_MINT"));
 const potion=catalogueEntryToItem(rows.find(i=>i.id==="DT_ITEM_ALC_HEALING_POTION"));
 const pc=new Actor("pc",5000,[mint]),m=new Actor("merchant",0,[potion]);game.actors=[m,pc];
 await m.setFlag("devils-table","merchant.catalogueId","alchemist");
 await m.setFlag("devils-table","merchant.economy",{profile:"herbalist"});
 await m.setFlag("devils-table","merchant.services",{DT_SERVICE_ALC_GRIND_HERBS:{enabled:true}});
 const request={id:"alchemist-mixed",userId:"player",sales:[],lines:[{id:potion._id,quantity:1},{id:"service:DT_SERVICE_ALC_GRIND_HERBS",quantity:1,targetItemId:mint._id}]};
 const before=pc.items.get(mint._id).toObject(),log=ledger();
 await executeTrade({merchant:m,character:pc,request,quote:quoteTrade(m,pc,request),receiptAdapter:log});
 assert.equal(m.system.currency.cp,4003);assert.equal(pc.system.currency.cp,997);assert.equal(m.items.get(potion._id)?.system.quantity??0,0);
 assert.deepEqual(pc.items.get(mint._id).toObject(),before);assert.equal(pc.items.size,2);assert.equal(log.records.length,1);
});
