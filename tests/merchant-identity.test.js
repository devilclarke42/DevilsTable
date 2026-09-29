import test from "node:test";
import assert from "node:assert/strict";
import { setup, Actor } from "./support/trade-world.js";
import { actorIdentity, readMerchantIdentity, validateMerchantIdentity, identitySnapshot, saveMerchantIdentity, subscribeActorIdentity } from "../scripts/merchant/identity.js";
import { merchantPresentation, receivePresentation, subscribePresentation, registerPresentationUpdates } from "../scripts/merchant/presentation.js";
import { merchantSlots } from "../scripts/merchant/operation-guard.js";

test("identity derives native race documents, classes and localized labels without flags or native writes",()=>{
 setup();const actor=new Actor("merchant",100,[{_id:"race",name:"Dwarf",type:"race",system:{}},{_id:"class",name:"Cleric",type:"class",system:{levels:2}}]);
 actor.system.details={race:"race",type:{value:"humanoid"},alignment:"Lawful Good",biography:{value:"<p>Private biography.</p>"}};
 actor.system.traits={size:"med"};actor.prototypeToken={name:"Old Nan",texture:{src:"nan.webp"}};
 CONFIG.DND5E={creatureTypes:{humanoid:"Humanoid"},actorSizes:{med:{label:"Medium"}}};game.i18n={localize:key=>key};
 const before=structuredClone(actor.flags),native=JSON.stringify(actor.system);
 const result=actorIdentity(actor,{scenes:[{name:"Village",tokens:[{actorId:"merchant",name:"Nan",actorLink:true}]}]});
 assert.equal(result.species,"Dwarf");assert.equal(result.classes,"Cleric 2");assert.equal(result.size,"Medium");assert.equal(result.tokens,"Village: Nan");
 assert.equal(result.biography,"Private biography.");assert.ok(result.systemTags.some(t=>t.id==="system:creature:humanoid"));
 actor.system.details.race=actor.items.get("race");assert.equal(actorIdentity(actor).species,"Dwarf");
 actor.system.details.race="Human";assert.equal(actorIdentity(actor).species,"Human");
 assert.deepEqual(actor.flags,before);actor.system.details.race="race";assert.equal(JSON.stringify(actor.system),native);
 const bare=actorIdentity(null);assert.equal(bare.species,"");assert.deepEqual(bare.systemTags,[]);
});
test("merchant-only identity validates namespaces, preserves native data and uses stale/checkout guards",async()=>{
 setup();const actor=new Actor("merchant",250);actor.img="portrait.webp";
 const before=JSON.stringify({system:actor.system,name:actor.name,img:actor.img});
 const draft={...readMerchantIdentity(actor),businessName:" The Copper Kettle ",merchantTags:["Local Produce","local-produce","Rural"],publicDescription:"Welcome."};
 const expected=identitySnapshot(actor);await saveMerchantIdentity(actor,draft,expected);
 assert.deepEqual(readMerchantIdentity(actor).merchantTags,["local-produce","rural"]);
 assert.equal(readMerchantIdentity(actor).businessName,"The Copper Kettle");
 assert.equal(JSON.stringify({system:actor.system,name:actor.name,img:actor.img}),before);
 await assert.rejects(saveMerchantIdentity(actor,draft,expected),/changed/);
 assert.throws(()=>validateMerchantIdentity({...draft,race:"Elf"}),/read-only/);
 assert.throws(()=>validateMerchantIdentity({...draft,merchantTags:["system:species:elf"]}),/read-only/);
 assert.throws(()=>validateMerchantIdentity({...draft,shopDescription:"<script>bad</script>"}),/plain text/);
 merchantSlots.acquire(actor.id,"checkout");try{await assert.rejects(saveMerchantIdentity(actor,draft,identitySnapshot(actor)),/serving/);}finally{merchantSlots.release(actor.id,"checkout");}
 game.user.isGM=false;await assert.rejects(saveMerchantIdentity(actor,draft,identitySnapshot(actor)),/active GM/);
});
test("native identity hooks refresh matching documents and detach all listeners",()=>{
 const registrations=new Map();let count=0,refreshes=0;
 globalThis.Hooks={on:(event,fn)=>{const id=++count;registrations.set(id,{event,fn});return id;},off:(_event,id)=>registrations.delete(id)};
 const unsubscribe=subscribeActorIdentity(()=>"merchant",()=>refreshes++);
 const emit=(event,doc)=>{for(const r of registrations.values())if(r.event===event)r.fn(doc);};
 emit("updateActor",{id:"other"});assert.equal(refreshes,0);
 emit("updateActor",{id:"merchant"});emit("updateItem",{parent:{id:"merchant"}});emit("updateToken",{actorId:"merchant"});
 emit("updateActiveEffect",{parent:{documentName:"Item",parent:{id:"merchant"}}});assert.equal(refreshes,4);
 unsubscribe();assert.equal(registrations.size,0);
});
test("public identity projection never exposes Merchant Tags, System Tags, biography or private notes",async()=>{
 setup();const actor=new Actor("merchant");actor.system.details={biography:{value:"SECRET BIO"},alignment:"SECRET"};
 await actor.setFlag("devils-table","merchant.identity",{...readMerchantIdentity(actor),businessName:"Copper Kettle",merchantTags:["greedy"],publicDescription:"Come in."});
 const packet=merchantPresentation(actor);assert.equal(packet.business.businessName,"Copper Kettle");
 const serialized=JSON.stringify(packet);for(const secret of ["greedy","SECRET","biography","systemTags","merchantTags"])assert.ok(!serialized.includes(secret));
 let seen;const unsubscribe=subscribePresentation(actor.id,value=>{seen=value;});
 receivePresentation({actorId:actor.id,presentation:{...packet,business:{...packet.business,merchantTags:["SECRET"]}}});
 assert.equal(seen.business.merchantTags,undefined);unsubscribe();
 const hooks=new Map();globalThis.Hooks={on:(event,fn)=>hooks.set(event,fn)};let published;
 registerPresentationUpdates(()=>true,packet=>published=packet);
 hooks.get("updateActor")(actor,{"flags.devils-table.merchant.identity.businessName":"Copper Kettle"});
 assert.equal(published.presentation.business.businessName,"Copper Kettle");
});
