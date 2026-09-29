import test from "node:test";
import assert from "node:assert/strict";
import {Actor,good,setup,ledger} from "./support/trade-world.js";
import {ServiceRegistry} from "../scripts/services/registry.js";
import {catalogueRegistry} from "../scripts/catalogues/registry.js";
import {serviceOffers} from "../scripts/services/offers.js";
import {quoteTrade,purchaseOffers} from "../scripts/merchant/trade-model.js";
import {executeTrade} from "../scripts/merchant/transaction.js";
import {executeServiceJobs} from "../scripts/services/execution.js";
import {generatedServiceOffers,saveServiceOffers,saveWorldServices} from "../scripts/services/administration.js";
import {merchantSlots} from "../scripts/merchant/operation-guard.js";
const icon="icons/svg/book.svg";
catalogueRegistry.register({catalogues:[{id:"test",name:"Test",icon,sort:1,categories:[],fallbackCategory:{id:"other",name:"Other",icon}}],categories:[]});
const service={id:"DT_SERVICE_TEST",name:"Consultation",description:"Discuss a problem with a specialist.",icon,category:"expertise",catalogues:["test"],price:{value:1,denomination:"sp"},tags:["advice"],maxQuantity:3};
const bundle=()=>({categories:[{id:"expertise",name:"Expertise",catalogues:["test"]}],services:[structuredClone(service)]});
async function world(){setup();const data=bundle();game.settings.get=(_ns,key)=>key==="serviceDefinitions"?data:key==="debugLogging"?false:"unlimited";
 const m=new Actor("merchant",0,[good()]),pc=new Actor("pc",100);await m.setFlag("devils-table","merchant.catalogueId","test");await m.setFlag("devils-table","merchant.services",{DT_SERVICE_TEST:{enabled:true}});game.actors=[m,pc];return {m,pc,data};}
const request=(lines=[{id:"service:DT_SERVICE_TEST",quantity:2}])=>({id:"service-test",userId:"player",lines,sales:[]});
test("data registration is atomic and rejects duplicate IDs, unknown rules and invalid prices",()=>{
 const r=new ServiceRegistry();r.register(bundle());assert.throws(()=>r.register(bundle()),/duplicate/);
 for(const change of [{price:{value:-1,denomination:"gp"}},{maxQuantity:0},{requirements:{script:"true"}},{execution:{macro:"alert(1)"}},{surprise:true}]){
 const b=bundle();Object.assign(b.services[0],change);assert.throws(()=>new ServiceRegistry().register(b));}
 assert.equal(r.list().length,1);assert.throws(()=>r.register("bad"));
});
test("service-only purchases transfer native currency and memory with zero Item writes",async()=>{
 const {m,pc}=await world(),req=request(),log=ledger();
 for(const actor of [m,pc])for(const key of ["createEmbeddedDocuments","updateEmbeddedDocuments","deleteEmbeddedDocuments"])actor[key]=()=>{throw Error("Unexpected Item mutation");};
 const record=await executeTrade({merchant:m,character:pc,request:req,quote:quoteTrade(m,pc,req),receiptAdapter:log});
 assert.equal(record.status,"completed");assert.equal(pc.system.currency.cp,80);assert.equal(m.system.currency.cp,20);
 assert.equal(m.getFlag("devils-table","merchant.serviceStats.DT_SERVICE_TEST").purchased,2);assert.equal(m.items.get("rope").system.quantity,1);
});
test("mixed products and services use existing discounts and only products transfer",async()=>{
 const {m,pc}=await world();await m.setFlag("devils-table","merchant.settings.merchantModifier",-10);
 const req=request([{id:"rope",quantity:1},{id:"service:DT_SERVICE_TEST",quantity:1}]);const q=quoteTrade(m,pc,req);
 assert.equal(q.total,18);assert.equal(purchaseOffers(m,pc).find(r=>r.kind==="service").copper,9);
 await executeTrade({merchant:m,character:pc,request:req,quote:q,receiptAdapter:ledger()});
 assert.equal(pc.items.size,1);assert.equal(pc.system.currency.cp,82);assert.equal(m.getFlag("devils-table","merchant.serviceStats.DT_SERVICE_TEST").revenue,9);
});
test("unavailable, disabled, excessive quantities and insufficient funds are rejected authoritatively",async()=>{
 const {m,pc,data}=await world();data.services[0].requirements={minLevel:5};assert.equal(serviceOffers(m,pc).length,0);assert.equal(serviceOffers(m,pc,{includeUnavailable:true})[0].quantity,0);
 assert.throws(()=>quoteTrade(m,pc,request()),/Stock/);data.services[0].requirements={};
 assert.throws(()=>quoteTrade(m,pc,request([{id:"service:DT_SERVICE_TEST",quantity:4}])),/Stock/);
 pc.system.currency.cp=0;assert.throws(()=>quoteTrade(m,pc,request()),/money/);
 await m.setFlag("devils-table","merchant.services.DT_SERVICE_TEST.enabled",false);assert.equal(serviceOffers(m,pc).length,0);
});
test("statistics and currency compensate if a later memory write fails",async()=>{
 const {m,pc}=await world(),req=request(),q=quoteTrade(m,pc,req),set=m.setFlag.bind(m);
 m.setFlag=async(ns,k,v)=>{if(k.startsWith("merchant.relationships."))throw Error("memory failed");return set(ns,k,v);};
 await assert.rejects(executeTrade({merchant:m,character:pc,request:req,quote:q,receiptAdapter:ledger()}),/memory failed/);
 assert.equal(pc.system.currency.cp,100);assert.equal(m.system.currency.cp,0);assert.equal(m.getFlag("devils-table","merchant.serviceStats"),undefined);
});
test("execution validates before payment and failed external actions never refund or replay",async()=>{
 const {m,pc,data}=await world();data.services[0].execution={macro:"Macro.test"};globalThis.fromUuid=async()=>null;
 const req=request();await assert.rejects(executeTrade({merchant:m,character:pc,request:req,quote:quoteTrade(m,pc,req),receiptAdapter:ledger()}),/missing/);assert.equal(pc.system.currency.cp,100);
 let calls=0;globalThis.fromUuid=async()=>({documentName:"Macro",canExecute:true,execute:async()=>{calls++;throw Error("macro failed");}});
 const log=ledger();const record=await executeTrade({merchant:m,character:pc,request:req,quote:quoteTrade(m,pc,req),receiptAdapter:log});
 assert.equal(record.status,"completed");assert.equal(record.serviceExecution[0].status,"needs-attention");assert.equal(pc.system.currency.cp,80);assert.equal(calls,1);
 await executeServiceJobs(record,{index:0},pc,m,log.save);assert.equal(calls,1);
});
test("category generation respects economy and preserves disabled offers; administration respects checkout locks",async()=>{
 const {m,data}=await world();data.services[0].availability={settlements:["town"]};
 await m.setFlag("devils-table","merchant.services",{});assert.equal(generatedServiceOffers(m,["expertise"]).length,0);
 await m.setFlag("devils-table","merchant.economy",{settlement:"town"});assert.equal(generatedServiceOffers(m,["expertise"]).length,1);
 await m.setFlag("devils-table","merchant.services",{DT_SERVICE_TEST:{enabled:false,price:{value:2,denomination:"gp"}}});assert.equal(generatedServiceOffers(m,["expertise"])[0].enabled,false);
 merchantSlots.acquire(m.id,"busy");try{await assert.rejects(saveServiceOffers(m,[]),/serving/);await assert.rejects(saveWorldServices(bundle()),/checkouts/);}finally{merchantSlots.release(m.id,"busy");}
});
for(const count of [2,3,5])test(`${count} concurrent mixed checkouts cannot duplicate the final product`,async()=>{
 const {m}=await world();const pcs=Array.from({length:count},(_,n)=>new Actor(`pc${n}`,100));
 const results=await Promise.allSettled(pcs.map((pc,n)=>{const req={...request([{id:"rope",quantity:1},{id:"service:DT_SERVICE_TEST",quantity:1}]),id:`multi${n}`};return executeTrade({merchant:m,character:pc,request:req,quote:quoteTrade(m,pc,req),receiptAdapter:ledger()});}));
 assert.equal(results.filter(r=>r.status==="fulfilled").length,1);assert.equal(m.getFlag("devils-table","merchant.serviceStats.DT_SERVICE_TEST").purchased,1);
});
test("removing and clearing overrides uses Foundry deletion keys rather than leaving merged offers",async()=>{
 const {m}=await world();const original=m.setFlag.bind(m);
 // Model Foundry's recursive merge and -= deletion semantics.
 const merge=(a,b)=>{for(const [k,v] of Object.entries(b)){if(k.startsWith("-="))delete a[k.slice(2)];else if(v&&typeof v==="object"&&!Array.isArray(v))merge(a[k]??={},v);else a[k]=v;}return a;};
 m.setFlag=async(ns,key,value)=>original(ns,key,merge(structuredClone(m.getFlag(ns,key)??{}),value));
 await saveServiceOffers(m,[{id:service.id,enabled:false,price:{value:5,denomination:"sp"}}]);
 assert.equal(m.getFlag("devils-table","merchant.services.DT_SERVICE_TEST.price.value"),5);
 await saveServiceOffers(m,[{id:service.id,enabled:true}]);assert.equal(m.getFlag("devils-table","merchant.services.DT_SERVICE_TEST.price"),undefined);
 await saveServiceOffers(m,[]);assert.deepEqual(m.getFlag("devils-table","merchant.services"),{});
});
test("optional integrations execute once per paid line and capture private results",async()=>{
 const {m,pc,data}=await world();data.services[0].execution={macro:"Macro.x",journal:"JournalEntry.x",rollTable:"RollTable.x",activeEffect:"Actor.x.ActiveEffect.x"};
 const calls=[];globalThis.fromUuid=async uuid=>({
  "Macro.x":{documentName:"Macro",canExecute:true,execute:async scope=>calls.push(["macro",scope.service.quantity])},
  "JournalEntry.x":{documentName:"JournalEntry",sheet:{render:async()=>calls.push(["journal"])}},
  "RollTable.x":{documentName:"RollTable",draw:async options=>{assert.equal(options.displayChat,false);calls.push(["table"]);return {results:[{description:"Private result"}]};}},
  "Actor.x.ActiveEffect.x":{documentName:"ActiveEffect",toObject:()=>({_id:"original",name:"Benefit",changes:[]})}
 }[uuid]);
 pc.createEmbeddedDocuments=async(type,rows)=>{assert.equal(type,"ActiveEffect");assert.equal(rows[0]._id,undefined);calls.push(["effect"]);return [{uuid:"Actor.pc.ActiveEffect.new"}];};
 const req=request();const record=await executeTrade({merchant:m,character:pc,request:req,quote:quoteTrade(m,pc,req),receiptAdapter:ledger()});
 assert.deepEqual(calls,[["macro",2],["journal"],["table"],["effect"]]);assert.ok(record.serviceExecution.every(j=>j.status==="completed"));assert.equal(record.serviceExecution.find(j=>j.kind==="rollTable").result,"Private result");
});

test("manual service availability is authoritative, visible without purchase access and preserves native inventory",async()=>{
 const {m,pc}=await world();
 await saveServiceOffers(m,[{id:service.id,enabled:true,available:false}]);
 const visible=serviceOffers(m,pc,{includeUnavailable:true});
 assert.equal(visible[0].quantity,0);assert.equal(visible[0].availability,"Temporarily unavailable");
 assert.equal(serviceOffers(m,pc).length,0);assert.throws(()=>quoteTrade(m,pc,request()),/Stock/);
 assert.equal(m.items.size,1);assert.equal(pc.system.currency.cp,100);
 await saveServiceOffers(m,[{id:service.id,enabled:true,available:true}]);assert.equal(serviceOffers(m,pc).length,1);
});
test("service editor rejects stale saves and groups authored services without duplicating their definitions",async()=>{
 const {m}=await world();const {ServicePanel}=await import('../scripts/services/panel.js');
 const panel=new ServicePanel(m),context=panel.context();assert.equal(context.groups[0].name,"Expertise");
 assert.equal(context.groups[0].services[0].purchased,0);
 panel.draft.set(service.id,{offered:true,enabled:true,available:false,price:{value:"2",denomination:"sp"}});
 assert.equal(panel.context().groups[0].services[0].price.value,"2");
 await panel.save();assert.equal(m.getFlag("devils-table","merchant.services.DT_SERVICE_TEST.available"),false);
 assert.equal(m.getFlag("devils-table","merchant.services.DT_SERVICE_TEST.price.value"),2);
 assert.equal(panel.dirty,false);
 await m.setFlag("devils-table","merchant.services.DT_SERVICE_TEST.price.value",3);
 await assert.rejects(panel.save(),/changed/);
 assert.equal(m.getFlag("devils-table","merchant.services.DT_SERVICE_TEST.price.value"),3);
});
test("service search/category filters hide rows without discarding edited prices",async()=>{
 const {m}=await world();const {ServicePanel}=await import('../scripts/services/panel.js');const panel=new ServicePanel(m);
 const controls={offered:{checked:true},enabled:{checked:true},available:{checked:true},price:{value:"7"},denomination:{value:"sp"}};
 const row={dataset:{serviceRow:service.id,search:"consultation advice expertise",category:"expertise",eligible:"true"},hidden:false,
   querySelector:selector=>controls[selector.match(/name=(\w+)/)[1]],addEventListener(event,fn){this[event]=fn;}};
 const query={dataset:{serviceFilter:"query"},value:"",addEventListener(event,fn){this[event]=fn;}}, category={dataset:{serviceFilter:"category"},value:"",addEventListener(event,fn){this[event]=fn;}};
 const group={querySelectorAll:()=>[row],hidden:false};
 const root={querySelector:()=>null,querySelectorAll:selector=>selector==='[data-service-row]'?[row]:selector==='[data-service-group]'?[group]:selector==='[data-service-filter]'?[query,category]:[]};
 panel.bind(root);row.input();query.value="no match";query.input();assert.equal(row.hidden,true);assert.equal(group.hidden,true);
 assert.equal(panel.context().groups[0].services[0].price.value,"7");
 query.value="advice";query.input();assert.equal(row.hidden,false);category.value="other";category.input();assert.equal(row.hidden,true);
 await panel.save();assert.equal(m.getFlag("devils-table","merchant.services.DT_SERVICE_TEST.price.value"),7);
});
