import test from "node:test";
import assert from "node:assert/strict";
import {readJson,fakeAdapter} from "./helpers.js";
import {Actor,setup,ledger} from "./support/trade-world.js";
import {loadStockCatalogue} from "../scripts/data/stock-loader.js";
import {catalogueEntryToItem} from "../scripts/builders/item-factory.js";
import {createBuilder} from "../scripts/builders/compendium-builder.js";
import {ServiceRegistry,serviceRegistry} from "../scripts/services/registry.js";
import {catalogueRegistry} from "../scripts/catalogues/registry.js";
import {serviceOffers} from "../scripts/services/offers.js";
import {serviceItemChoices,resolveServiceItem} from "../scripts/services/requirements.js";
import {quoteTrade} from "../scripts/merchant/trade-model.js";
import {executeTrade} from "../scripts/merchant/transaction.js";
import {stockProfiles,stockGroups} from "../scripts/data/stock-catalogue.js";
const catalogue=await loadStockCatalogue({readJson}), bundle=await readJson("data/services.json");
serviceRegistry.register(bundle);
catalogueRegistry.register({catalogues:catalogue.catalogueDefinitions,categories:catalogue.categoryDefinitions});
const source=name=>catalogue.entries.find(({item})=>item.name===name).item;
async function world(){
 setup();game.settings.get=(_ns,key)=>key==="serviceDefinitions"?{categories:[],services:[]}:key==="debugLogging"?false:"unlimited";
 const blade=catalogueEntryToItem(source("Longsword"));
 const pc=new Actor("pc",1000,[blade]),m=new Actor("merchant",0);
 await m.setFlag("devils-table","merchant.catalogueId","blacksmith");
 await m.setFlag("devils-table","merchant.economy",{settlement:"town",prosperity:"average",profile:"smith-town"});
 await m.setFlag("devils-table","merchant.services",{DT_SERVICE_BSM_REPAIR_WEAPON:{enabled:true}});
 game.actors=[m,pc];return {m,pc,blade,request:{id:"smith-test",userId:"player",sales:[],lines:[{id:"service:DT_SERVICE_BSM_REPAIR_WEAPON",quantity:1,targetItemId:blade._id}]}};
}
test("native smith equipment preserves 2014 attacks, versatile dice, armour and ammunition",()=>{
 const sword=catalogueEntryToItem(source("Longsword"));assert.equal(sword.type,"weapon");assert.equal(sword.system.damage.base.denomination,8);assert.equal(sword.system.damage.versatile.denomination,10);assert.ok(Object.values(sword.system.activities).some(a=>a.type==="attack"));
 const plate=catalogueEntryToItem(source("Plate Armour"));assert.equal(plate.system.armor.value,18);assert.equal(plate.system.strength,15);assert.ok(plate.system.properties.includes("stealthDisadvantage"));
 const arrow=catalogueEntryToItem(source("Arrow"));assert.equal(arrow.system.quantity,1);assert.equal(arrow.system.type.value,"ammo");assert.equal(arrow.system.type.subtype,"arrow");
 assert.equal(catalogueEntryToItem(source("Smith's Tools")).type,"tool");
});
test("five smith profiles have distinct stock pools and compatible templates",async()=>{
 const profiles=stockProfiles(catalogue).filter(p=>p.shop==="blacksmith");assert.equal(profiles.length,5);
 const signatures=new Set(profiles.map(p=>JSON.stringify(stockGroups(catalogue,p))));assert.equal(signatures.size,5);
 const templates=(await readJson("data/merchant-templates.json")).filter(t=>t.settings.catalogueId==="blacksmith");assert.equal(templates.length,5);
 const master=profiles.find(p=>p.name==="Master Armorer");assert.ok(!Object.values(stockGroups(catalogue,master)).flat().some(r=>r.category==="ammunition"));
});
test("smith builds converge without duplicating shared products",async()=>{
 const {adapter,state}=fakeAdapter();const build=createBuilder({load:()=>catalogue,adapter});
 const result=await build({dryRun:false,shopId:"blacksmith"});assert.equal(result.create,73);
 assert.equal((await build({dryRun:false,shopId:"blacksmith"})).unchanged,73);
 assert.equal(new Set(state.docs.map(d=>d.flags["devils-table"].sourceId)).size,73);
});
test("requirements reject missing, wrong, sold and other-character item identities",async()=>{
 const {m,pc,request,blade}=await world();const req={types:["weapon"]};
 assert.equal(serviceItemChoices(pc,req)[0].id,blade._id);
 assert.throws(()=>resolveServiceItem(pc,req,"other"),/missing/);
 assert.throws(()=>resolveServiceItem(pc,{types:["equipment"]},blade._id),/eligible/);
 assert.throws(()=>quoteTrade(m,pc,{...request,lines:[{...request.lines[0],targetItemId:""}]}),/Select/);
 assert.throws(()=>quoteTrade(m,pc,{...request,sales:[{id:blade._id,quantity:1}]}),/also be sold/);
 const other=new Actor("other",1000);assert.throws(()=>quoteTrade(m,other,request),/eligible/);
});
test("service payment records the selected item without altering it and rejects stale targets",async()=>{
 const {m,pc,request,blade}=await world(),quote=quoteTrade(m,pc,request);
 const before=pc.items.get(blade._id).toObject(),log=ledger();
 assert.equal(quote.basket[0].targetItemName,"Longsword");
 await executeTrade({merchant:m,character:pc,request,quote,receiptAdapter:log});
 assert.deepEqual(pc.items.get(blade._id).toObject(),before);assert.equal(m.system.currency.cp,50);assert.equal(pc.system.currency.cp,950);
 assert.equal(log.records[0].quote.basket[0].targetItemId,blade._id);
 pc.items.delete(blade._id);
 await assert.rejects(executeTrade({merchant:m,character:pc,request:{...request,id:"stale"},quote,receiptAdapter:log}),/eligible/);
 assert.equal(log.records.length,1);
});
test("requirements are data-driven and fail closed for unsupported predicates or multiple targets",()=>{
 const b=structuredClone(bundle),row=b.services.find(r=>r.id==="DT_SERVICE_BSM_REPAIR_WEAPON");row.requirements.item.script="true";
 assert.throws(()=>new ServiceRegistry().register(b),/requirement/);
 delete row.requirements.item.script;row.maxQuantity=2;assert.throws(()=>new ServiceRegistry().register(b),/one target/);
});

test("native read-back tolerates omitted unset source fields without weakening populated mechanics",async()=>{
 const {matchesGenerated,generatedDifferences}=await import("../scripts/builders/generated-fields.js");
 const {planBuild}=await import("../scripts/builders/build-plan.js");
 const docs=catalogue.entries.filter(({item})=>item.mechanics.native).map(({item})=>catalogueEntryToItem(item));
 const stripNulls=value=>Array.isArray(value)?value.map(stripNulls):value&&typeof value==="object"?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==null).map(([k,v])=>[k,stripNulls(v)])):value;
 const saved=docs.map(stripNulls);
 assert.equal(planBuild(docs,saved).unchanged,docs.length);
 const plate=docs.find(d=>d.name==="Plate Armour");
 assert.equal(Object.hasOwn(plate.system.armor,"magicalBonus"),false);
 const legacy=structuredClone(plate);legacy.system.armor.magicalBonus=null;
 assert.equal(matchesGenerated(plate,legacy),false);
 assert.equal(generatedDifferences(plate,legacy)[0].path,"system.armor.magicalBonus");
 const bad=structuredClone(plate);bad.system.armor.value=17;assert.equal(matchesGenerated(bad,plate),false);
 const sword=docs.find(d=>d.name==="Longsword"),damaged=structuredClone(sword);
 damaged.system.damage.base.denomination=6;assert.equal(matchesGenerated(damaged,sword),false);
 const smith=docs.find(d=>d.name==="Smith's Tools");assert.equal(Object.values(smith.system.activities)[0].range.units,"self");
});
