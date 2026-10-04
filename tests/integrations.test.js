import test from "node:test";
import assert from "node:assert/strict";
import { setup,Actor,Item,ledger } from "./support/trade-world.js";
import { IntegrationManager,integrationManager } from "../scripts/integrations/manager.js";
import { registerBuiltInIntegrations,checkoutBooking,expireBookings } from "../scripts/integrations/lifecycle.js";
import { bookingData,bookings,ensureBooking } from "../scripts/integrations/bookings.js";
import { validateRoom } from "../scripts/integrations/room.js";
import { validateActions } from "../scripts/services/actions.js";
import { prepareServiceExecution,executeServiceJobs } from "../scripts/services/execution.js";
import { catalogueRegistry } from "../scripts/catalogues/registry.js";
import { quoteTrade } from "../scripts/merchant/trade-model.js";
import { executeTrade } from "../scripts/merchant/transaction.js";
const ns="devils-table",icon="icons/svg/bed.svg";
registerBuiltInIntegrations();
catalogueRegistry.register({catalogues:[{id:"integration-test",name:"Inn",icon,sort:1,categories:[],fallbackCategory:{id:"other",name:"Other",icon}}],categories:[]});
const room=()=>({name:"Willow Room",keyName:"",doors:["Scene.inn.Wall.first","Scene.inn.Wall.second"],days:3,expiry:"checkout",key:true,calendar:true});
async function world({enabled=true}={}) {
 setup();let sequence=0;const documents=new Map(),warnings=[],notes=[];
 globalThis.ui={notifications:{warn:msg=>warnings.push(msg),error:msg=>warnings.push(msg)}};
 game.modules=new Map();game.journal=[];game.time={worldTime:100,components:{hour:1,minute:1,second:10},calendar:{days:{hoursPerDay:10,minutesPerHour:2,secondsPerMinute:30}}};
 const settings={integrations:{},serviceDefinitions:{categories:[{id:"room",name:"Rooms",catalogues:["integration-test"]}],services:[{id:"DT_SERVICE_TEST_ROOM",name:"Room rental",description:"Three nights.",icon,category:"room",catalogues:["integration-test"],price:{value:2,denomination:"sp"},tags:["room"],maxQuantity:3,accommodation:true}]}};
 game.settings.get=(_ns,key)=>settings[key]??(key==="debugLogging"?false:"unlimited");game.settings.set=async(_ns,key,value)=>settings[key]=value;
 const doc=(uuid,extra={})=>({uuid,...extra,flags:extra.flags??{},getFlag(n,k){return this.flags[n]?.[k];},async setFlag(n,k,v){(this.flags[n]??={})[k]=structuredClone(v);return this;},async delete(){documents.delete(uuid);}});
 for(const uuid of room().doors)documents.set(uuid,doc(uuid,{documentName:"Wall",door:1,flags:{LocknKey:{IDKeysFlag:"existing-access",LockableFlag:true}}}));
 if(enabled)game.modules.set("LocknKey",{active:true,api:{LnKFlags:{KeyIDs:d=>d.getFlag("LocknKey","IDKeysFlag")??"",isLockable:d=>d.getFlag("LocknKey","LockableFlag")===true}}});
 if(enabled)game.modules.set("calendaria",{active:true});
 globalThis.CALENDARIA={api:{timestampToDate:time=>({year:100,month:1,day:1,hour:Math.floor(time/60),minute:time%60}),createNote:async data=>{notes.push(data);const note=doc(`JournalEntry.calendar.JournalEntryPage.n${++sequence}`);documents.set(note.uuid,note);return note;}}};
 globalThis.JournalEntry={create:async data=>{assert.equal(data.ownership.default,0);const journal=doc(`JournalEntry.booking${++sequence}`,data);game.journal.push(journal);documents.set(journal.uuid,journal);return journal;}};
 globalThis.fromUuid=async uuid=>documents.get(uuid);
 const merchant=new Actor("merchant"),character=new Actor("pc",100);merchant.uuid="Actor.merchant";character.uuid="Actor.pc";game.actors=[merchant,character];
 await merchant.setFlag(ns,"merchant.settings.checkoutTime","09:00");
 await merchant.setFlag(ns,"merchant.catalogueId","integration-test");await merchant.setFlag(ns,"merchant.services",{DT_SERVICE_TEST_ROOM:{enabled:true,room:room()}});
 character.createEmbeddedDocuments=async(type,rows)=>rows.map(data=>{const id=`item${++sequence}`,item=doc(`Actor.pc.Item.${id}`,{...data,id,documentName:type});item.delete=async()=>{documents.delete(item.uuid);character.items.delete(id);};documents.set(item.uuid,item);character.items.set(id,item);return item;});
 const request={id:"room-request",userId:"player",lines:[{id:"service:DT_SERVICE_TEST_ROOM",quantity:1}],sales:[]};
 return {merchant,character,request,settings,documents,warnings,notes};
}
test("manager reports missing, inactive, disabled and incompatible modules and isolates thrown failures",async()=>{
 await world({enabled:false});const manager=new IntegrationManager();let calls=0;
 manager.register({id:"test",name:"Test",moduleId:"Test",available:()=>true,actions:{run:async()=>{calls++;throw Error("adapter failed");}}});
 assert.equal(manager.status("test").installed,false);assert.equal((await manager.execute("test","run",{})).status,"skipped");
 game.modules.set("Test",{active:false});assert.equal(manager.status("test").active,false);
 game.modules.get("Test").active=true;await game.settings.set(ns,"integrations",{test:false});assert.equal(manager.status("test").enabled,false);
 await game.settings.set(ns,"integrations",{});const result=await manager.execute("test","run",{});assert.equal(result.status,"needs-attention");assert.equal(calls,1);
 game.user.isGM=false;await assert.rejects(manager.execute("test","run",{}),/GM/);
});
test("both integrations absent: payment and receipt finish without keys, bookings or errors",async()=>{
 const w=await world({enabled:false}),log=ledger();
 const record=await executeTrade({...w,quote:quoteTrade(w.merchant,w.character,w.request),receiptAdapter:log});
 assert.equal(record.status,"completed");assert.equal(w.character.system.currency.cp,80);assert.equal(w.merchant.system.currency.cp,20);
 assert.deepEqual(record.serviceExecution.map(j=>j.status),["skipped","skipped"]);assert.equal(bookings().length,0);assert.equal(w.character.items.size,0);
});
test("paid rental grants one multi-door key and two private calendar notes exactly once",async()=>{
 const w=await world(),log=ledger();
 const record=await executeTrade({...w,quote:quoteTrade(w.merchant,w.character,w.request),receiptAdapter:log});
 assert.ok(record.serviceExecution.every(j=>j.status==="completed"));assert.equal(w.character.items.size,1);assert.equal(w.notes.length,2);
 const journal=bookings()[0],data=bookingData(journal);assert.equal(data.end,2340);assert.equal(data.start,100);
 const key=await fromUuid(data.key.itemUuid);assert.equal(key.name,"Willow Room Key");
 for(const uuid of room().doors){const ids=w.documents.get(uuid).getFlag("LocknKey","IDKeysFlag");assert.ok(ids.includes("existing-access"));assert.ok(ids.includes(data.key.code));}
 assert.ok(w.notes.every(n=>n.visibility==="secret"&&n.openSheet===false));assert.equal(w.notes[1].startDate.hour,39);
 await executeServiceJobs(record,{uuid:"Receipt.1"},w.character,w.merchant,log.save.bind(log));assert.equal(w.notes.length,2);assert.equal(w.character.items.size,1);assert.equal(w.character.system.currency.cp,80);
 game.time.worldTime=2340;await expireBookings();assert.equal(bookingData(journal).state,"closed");assert.equal(w.character.items.size,0);
 for(const uuid of room().doors)assert.equal(w.documents.get(uuid).getFlag("LocknKey","IDKeysFlag"),"existing-access");
});
test("persistent keys survive checkout; manual recovery waits for explicit GM action",async()=>{
 for(const expiry of ["persistent","manual"]){const w=await world();w.merchant.flags[ns].merchant.services.DT_SERVICE_TEST_ROOM.room.expiry=expiry;
 await executeTrade({...w,quote:quoteTrade(w.merchant,w.character,w.request),receiptAdapter:ledger()});
 const journal=bookings()[0];game.time.worldTime=5000;await expireBookings();assert.equal(bookingData(journal).state,"active");assert.equal(w.character.items.size,1);
 await checkoutBooking(journal,{manual:true});assert.equal(bookingData(journal).state,"closed");assert.equal(w.character.items.size,expiry==="persistent"?1:0);
 }
});
test("disabled expiry becomes recoverable without losing payment or touching unrelated door codes",async()=>{
 const w=await world();await executeTrade({...w,quote:quoteTrade(w.merchant,w.character,w.request),receiptAdapter:ledger()});
 const journal=bookings()[0];game.modules.get("LocknKey").active=false;game.time.worldTime=5000;await expireBookings();
 assert.equal(bookingData(journal).state,"needs-attention");assert.equal(w.character.system.currency.cp,80);
 game.modules.get("LocknKey").active=true;await checkoutBooking(journal,{manual:true});assert.equal(bookingData(journal).state,"closed");
});
test("one failed optional action does not block the next; stop policy prevents remaining jobs and no replay",async()=>{
 const w=await world(),events=[];globalThis.fromUuid=async uuid=>uuid==="Macro.good"?{documentName:"Macro",canExecute:true,execute:async()=>events.push("good")}:null;
 for(const onFailure of ["continue","stop"]){events.length=0;const jobs=await prepareServiceExecution({basket:[{kind:"service",serviceId:"test",quantity:1,name:"Test",actions:[{kind:"macro",uuid:"Macro.bad",onFailure},{kind:"macro",uuid:"Macro.good"}]}]});
 const record={serviceExecution:jobs.map(j=>({...j,status:"pending"}))};await executeServiceJobs(record,{},w.character,w.merchant,async()=>{});
 assert.equal(record.serviceExecution[0].status,"needs-attention");assert.equal(events.length,onFailure==="continue"?1:0);
 await executeServiceJobs(record,{},w.character,w.merchant,async()=>{});assert.equal(events.length,onFailure==="continue"?1:0);
 }
});
test("a key failure still schedules calendar notes and records partial access for manual recovery",async()=>{
 const w=await world();w.character.createEmbeddedDocuments=async()=>{throw Error("Item creation failed");};
 const record=await executeTrade({...w,quote:quoteTrade(w.merchant,w.character,w.request),receiptAdapter:ledger()});
 assert.deepEqual(record.serviceExecution.map(j=>j.status),["needs-attention","completed"]);assert.equal(w.notes.length,2);
 const journal=bookings()[0];assert.equal(bookingData(journal).key.status,"attempted");await checkoutBooking(journal,{manual:true});
 for(const uuid of room().doors)assert.equal(w.documents.get(uuid).getFlag("LocknKey","IDKeysFlag"),"existing-access");
});
test("action and room validation reject currency replay, invalid doors, unknown policies and excessive durations",()=>{
 for(const kind of ['deductCurrency','recordTransaction','script'])assert.throws(()=>validateActions([{kind}]));
 for(const change of [{days:0},{days:366},{expiry:"magic"},{doors:["Actor.pc"]}])assert.throws(()=>validateRoom({...room(),...change}));
 assert.equal(validateActions([{kind:"integration",integration:"future-module",action:"perform",config:{value:1}}]).length,1);
});
test("concurrent grants sharing doors retain both rental codes and expiry revokes only its own lease",async()=>{
 const w=await world(),job={serviceId:"DT_SERVICE_TEST_ROOM",quantity:1,name:"Room",config:room()};
 const context={job,record:{id:"one"},receipt:{uuid:"Receipt.one"},merchant:w.merchant,character:w.character};
 const results=await Promise.all([integrationManager.execute("locknkey","room-key",context),integrationManager.execute("locknkey","room-key",{...context,record:{id:"two"}})]);
 assert.ok(results.every(r=>r.status==="completed"));assert.equal(bookings().length,2);
 const [first,second]=bookings(),a=bookingData(first).key.code,b=bookingData(second).key.code;assert.notEqual(a,b);
 for(const uuid of room().doors){const codes=w.documents.get(uuid).getFlag("LocknKey","IDKeysFlag").split(';');assert.deepEqual(codes,["existing-access",a,b]);}
 await checkoutBooking(first,{manual:true});for(const uuid of room().doors)assert.deepEqual(w.documents.get(uuid).getFlag("LocknKey","IDKeysFlag").split(';'),["existing-access",b]);
});
test("native grant action preserves Item data, grants the purchased quantity and runs after payment",async()=>{
 const w=await world({enabled:false}),source={_id:"original",name:"Receipt token",type:"loot",system:{quantity:99,container:"old",description:{value:"Keep this token."},price:{value:0,denomination:"cp"}},flags:{custom:{purpose:"entry"}}};
 globalThis.fromUuid=async uuid=>uuid==="Item.token"?{documentName:"Item",toObject:()=>structuredClone(source)}:null;
 const jobs=await prepareServiceExecution({basket:[{kind:"service",serviceId:"test",name:"Entry",quantity:2,actions:[{kind:"grantItem",uuid:"Item.token"}]}]});
 const record={serviceExecution:jobs.map(j=>({...j,status:"pending"}))};await executeServiceJobs(record,{},w.character,w.merchant,async()=>{});
 const [item]=[...w.character.items];assert.equal(item.system.quantity,2);assert.equal(item.system.container,null);assert.equal(item.flags.custom.purpose,"entry");assert.equal(record.serviceExecution[0].status,"completed");
});

test("GM checkout override is confirmed in public terms, used by both adapters and frozen for existing bookings",async()=>{
 const w=await world();
 const {offerTerms}=await import("../scripts/merchant/revised-offer.js");
 const original=quoteTrade(w.merchant,w.character,w.request);
 const revised=quoteTrade(w.merchant,w.character,w.request,{checkoutTime:"08:01"});
 assert.notDeepEqual(offerTerms(original),offerTerms(revised));
 assert.equal(offerTerms(revised).basket[0].checkoutTime,"08:01");
 assert.equal(JSON.stringify(offerTerms(revised)).includes("Scene.inn"),false);
 const record=await executeTrade({...w,quote:revised,receiptAdapter:ledger()});
 const journal=bookings()[0],before=bookingData(journal);
 assert.equal(before.end,2310);assert.equal(before.checkoutTime,"08:01");
 assert.equal(w.merchant.getFlag(ns,"merchant.settings.checkoutTime"),"09:00");
 await w.merchant.setFlag(ns,"merchant.settings.checkoutTime","07:00");
 game.time.worldTime=200;
 assert.equal(await ensureBooking({record,receipt:{uuid:"Receipt.1"},job:record.serviceExecution[0],...w}),journal);
 assert.deepEqual(bookingData(journal),before);
 assert.throws(()=>quoteTrade(w.merchant,w.character,w.request,{checkoutTime:"10:00"}),/outside/);
});

test("new room configuration offers available integrations automatically and preserves explicit opt-outs",async()=>{
 const w=await world();
 const {ServicePanel}=await import('../scripts/services/panel.js');
 w.merchant.flags[ns].merchant.services.DT_SERVICE_TEST_ROOM={enabled:true};
 let row=new ServicePanel(w.merchant).context().groups.flatMap(g=>g.services)[0];
 assert.equal(row.roomConfigured,false);assert.equal(row.room.key,true);assert.equal(row.room.calendar,true);
 assert.equal(w.merchant.flags[ns].merchant.services.DT_SERVICE_TEST_ROOM.room,undefined);
 w.merchant.flags[ns].merchant.services.DT_SERVICE_TEST_ROOM.room={...room(),key:false,calendar:false};
 row=new ServicePanel(w.merchant).context().groups.flatMap(g=>g.services)[0];
 assert.equal(row.room.key,false);assert.equal(row.room.calendar,false);
 await world({enabled:false});w.merchant.flags[ns].merchant.services.DT_SERVICE_TEST_ROOM={enabled:true};
 row=new ServicePanel(w.merchant).context().groups.flatMap(g=>g.services)[0];
 assert.equal(row.room.key,false);assert.equal(row.room.calendar,false);
});
