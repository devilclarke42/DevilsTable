import test from "node:test";
import assert from "node:assert/strict";
import { setup, Actor, good } from "./support/trade-world.js";
import { readJson } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { loadBuilderPolicy, readConfiguration, configurationSnapshot } from "../scripts/merchant/builder/model.js";
import { loadEconomy } from "../scripts/merchant/economy.js";
import { catalogueRegistry } from "../scripts/catalogues/registry.js";
import { saveNpcConfiguration } from "../scripts/ux/npc-configuration.js";
import { merchantSlots } from "../scripts/merchant/operation-guard.js";
import { generationSummary } from "../scripts/ux/builder-summary.js";
import { IntegrationManager } from "../scripts/integrations/manager.js";
import { diceSoNiceAdapter } from "../scripts/integrations/dice-so-nice.js";
const ns="devils-table";
const catalogue=await loadStockCatalogue({readJson});
catalogueRegistry.register({catalogues:catalogue.catalogueDefinitions,categories:catalogue.categoryDefinitions});
const context={catalogue,policy:await loadBuilderPolicy({readJson}),economy:await loadEconomy({readJson})};
function world(){setup();const actor=new Actor("merchant",123,[good()]);game.actors=[actor];game.scenes=[];
 game.settings.get=(_ns,key)=>key==="serviceDefinitions"?{categories:[],services:[]}:false;
 return actor;}
const state=actor=>({context,draft:readConfiguration(actor,context),expected:configurationSnapshot(actor)});
test("NPC tab conversion and disabling preserve native data and merchant history",async()=>{
 const actor=world();await actor.setFlag(ns,"merchant.history",["existing"]);await actor.setFlag(ns,"merchant.relationships.pc",{state:"Trusted"});
 const before=structuredClone({system:actor.system,items:[...actor.items].map(i=>i.toObject())});
 await saveNpcConfiguration(actor,state(actor),{pricingModifier:10},true);
 assert.equal(actor.getFlag(ns,"merchant.settings.merchantModifier"),10);
 assert.deepEqual({system:actor.system,items:[...actor.items].map(i=>i.toObject())},before);
 let tokenUpdates;game.scenes=[{tokens:[{id:"token",actorLink:true,actorId:actor.id}],updateEmbeddedDocuments:async(_type,rows)=>{tokenUpdates=rows;}}];
 await saveNpcConfiguration(actor,state(actor),{},false);
 assert.equal(actor.getFlag(ns,"merchant.enabled"),false);assert.equal(tokenUpdates[0][`flags.${ns}.merchantEntry`],false);
 assert.deepEqual(actor.getFlag(ns,"merchant.history"),["existing"]);
 assert.equal(actor.getFlag(ns,"merchant.relationships.pc.state"),"Trusted");
});
test("NPC configuration rejects players, synthetic actors, stale drafts and active checkouts",async()=>{
 const actor=world(),draft=state(actor);game.user.isGM=false;await assert.rejects(saveNpcConfiguration(actor,draft,{},true));game.user.isGM=true;
 actor.isToken=true;await assert.rejects(saveNpcConfiguration(actor,draft,{},true));actor.isToken=false;
 await actor.setFlag(ns,"merchant.notes","changed");await assert.rejects(saveNpcConfiguration(actor,draft,{},true),/changed/);
 merchantSlots.acquire(actor.id,"checkout");try{await assert.rejects(saveNpcConfiguration(actor,state(actor),{},false),/serving/);}finally{merchantSlots.release(actor.id,"checkout");}
});
test("summary counts unique Items across catalogues and treats services as references",async()=>{
 const services=(await readJson("data/services.json")).services;
 const all=generationSummary(catalogue,{shopId:null},services,68);
 assert.equal(all.products,370);assert.equal(all.services,25);assert.equal(all.tables,68);
 const tavern=generationSummary(catalogue,{shopId:"tavern"},services);
 assert.equal(tavern.products,205);assert.equal(tavern.catalogues,1);assert.equal(tavern.services,16);
 assert.ok(all.products<catalogue.index.shops.reduce((n,shopId)=>n+generationSummary(catalogue,{shopId},services).products,0));
});
test("Dice So Nice presentation is local, optional and unable to invoke GM service actions",async()=>{
 world();game.user.isGM=false;game.modules=new Map();const manager=new IntegrationManager();manager.register(diceSoNiceAdapter);
 const roll={total:17},calls=[];game.dice3d={showForRoll:async(...args)=>{calls.push(args);}};
 assert.equal(await manager.present("dice-so-nice","roll",{roll}),false);
 game.modules.set("dice-so-nice",{active:true});assert.equal(await manager.present("dice-so-nice","roll",{roll}),true);
 assert.deepEqual(calls[0],[roll,game.user,false,[game.user.id],false]);
 manager.register({id:"private",name:"Private",moduleId:"dice-so-nice",available:()=>true,actions:{write:()=>{throw Error("must not run");}}});
 assert.equal(await manager.present("private","write",{}),false);await assert.rejects(manager.execute("private","write",{}),/GM/);
 game.dice3d.showForRoll=async()=>{throw Error("animation failed");};assert.equal(await manager.present("dice-so-nice","roll",{roll}),false);
 game.settings.get=()=>({"dice-so-nice":false});assert.equal(await manager.present("dice-so-nice","roll",{roll}),false);
});

test("Actor entry is GM-only, excludes compendiums/unlinked tokens and uses the existing Builder",async()=>{
 world();globalThis.foundry={applications:{api:{ApplicationV2:class{constructor(options){this.options=options;}render(){return this;}},HandlebarsApplicationMixin:Base=>Base}}};
 const {supportedNpc,addActorContext,openNpcBuilder}=await import("../scripts/ux/actor-entry.js");
 const actor=new Actor("merchant"),actors=new Map([[actor.id,actor]]);game.actors=actors;
 assert.equal(supportedNpc(actor),true);assert.equal(supportedNpc({...actor,isToken:true}),false);assert.equal(supportedNpc({...actor,pack:"world.test"}),false);
 const menu=[];addActorContext(null,menu);assert.equal(menu.length,2);assert.equal(menu[1].condition({dataset:{entryId:actor.id}}),true);
 assert.equal(menu[1].label,"Open Merchant Builder");
 assert.equal(menu[1].visible({dataset:{entryId:actor.id}}),true);
 assert.equal((await menu[1].onClick({}, {dataset:{entryId:actor.id}})).actor,actor);
 addActorContext(null,menu);assert.equal(menu.length,2);
 assert.equal(menu[0].visible({dataset:{entryId:"missing"}}),false);
 assert.equal(menu[0].condition({dataset:{entryId:"missing"}}),false);assert.ok(openNpcBuilder(actor));
 game.user.isGM=false;assert.equal(openNpcBuilder(actor),undefined);const playerMenu=[];addActorContext(null,playerMenu);assert.deepEqual(playerMenu,[]);
});

test("native sheet menu exposes one Make Merchant action for the correct Actor",async()=>{
 world();
 const {addMerchantHeaderControl,entryActor}=await import("../scripts/ux/actor-entry.js");
 const actor=new Actor("merchant");actor.documentName="Actor";game.actors=new Map([[actor.id,actor]]);
 const controls=[];addMerchantHeaderControl({document:actor},controls);addMerchantHeaderControl({document:actor},controls);
 assert.equal(controls.length,1);assert.equal(controls[0].name,"Open Merchant Builder");
 assert.equal((await controls[0].callback()).actor,actor);
 assert.equal(controls[0].label,"Open Merchant Builder");
 const legacy=[{label:"Existing",action:"existing"}];addMerchantHeaderControl({document:actor},legacy);
 assert.equal(legacy[1].icon,"fa-solid fa-store");assert.equal((await legacy[1].onClick()).actor,actor);
 for(const key of ["entryId","documentId","actorId"]) assert.equal(entryActor({dataset:{[key]:actor.id}}),actor);
 globalThis.canvas={scene:{tokens:new Map([["linked",{actor}]])}};
 assert.equal(entryActor({dataset:{tokenId:"linked"}}),actor);
 const tokenControls=[];addMerchantHeaderControl({document:{documentName:"Token",actor}},tokenControls);
 assert.equal((await tokenControls[0].callback()).actor,actor);
 game.user.isGM=false;assert.equal(controls[0].condition(),false);
 const denied=[];addMerchantHeaderControl({document:actor},denied);assert.deepEqual(denied,[]);
});

test("canvas merchant marker is GM-local, idempotent and removed when disabled",async()=>{
 const actor=world();await actor.setFlag(ns,"merchant.enabled",true);
 const {updateMerchantTokenMarker}=await import("../scripts/ux/token-marker.js");
 globalThis.PIXI={Text:class{
  constructor(text){this.text=text;this.anchor={set(){}};this.position={set(){}};this.scale={set(){}};}
  destroy(){this.destroyed=true;}
 }};
 const token={actor,document:{actorLink:true},w:100,children:[],
  addChild(child){child.parent=this;this.children.push(child);},
  removeChild(child){this.children=this.children.filter(c=>c!==child);child.parent=null;}};
 updateMerchantTokenMarker(token);updateMerchantTokenMarker(token);
 assert.equal(token.children.length,1);assert.equal(token.children[0].text,"SHOP");
 const marker=token.children[0];game.user.isGM=false;updateMerchantTokenMarker(token);
 assert.equal(token.children.length,0);assert.equal(marker.destroyed,true);
 game.user.isGM=true;updateMerchantTokenMarker(token);
 await actor.setFlag(ns,"merchant.enabled",false);updateMerchantTokenMarker(token);assert.equal(token.children.length,0);
 token.document.actorLink=false;await actor.setFlag(ns,"merchant.enabled",true);updateMerchantTokenMarker(token);
 assert.equal(token.children.length,0);
});


test("directory conversion preserves native data and private history, then switches menu action", async()=>{
 const actor=world();
 actor.img="portrait.webp";actor.prototypeToken={name:"Existing token"};actor.ownership={default:0};
 await actor.setFlag(ns,"merchant.enabled",false);
 await actor.setFlag(ns,"merchant.history",["kept"]);
 await actor.setFlag(ns,"merchant.relationships.pc",{state:"Trusted"});
 game.actors.get=id=>game.actors.find(row=>row.id===id);
 globalThis.ui={notifications:{error:message=>{throw Error(message);}}};
 const {addActorContext}=await import("../scripts/ux/actor-entry.js");
 const menu=[];addActorContext(null,menu);const target={dataset:{entryId:actor.id}};
 const native=()=>structuredClone({system:actor.system,img:actor.img,token:actor.prototypeToken,ownership:actor.ownership,items:[...actor.items].map(i=>i.toObject())});
 const before=native();
 assert.deepEqual(menu.filter(row=>row.visible(target)).map(row=>row.label),["Convert to Merchant"]);
 assert.equal((await menu[0].onClick({},target)).actor,actor);
 assert.equal(actor.getFlag(ns,"merchant.enabled"),true);
 assert.deepEqual(native(),before);
 assert.deepEqual(actor.getFlag(ns,"merchant.history"),["kept"]);
 assert.equal(actor.getFlag(ns,"merchant.relationships.pc.state"),"Trusted");
 assert.deepEqual(menu.filter(row=>row.visible(target)).map(row=>row.label),["Open Merchant Builder"]);
 const flags=structuredClone(actor.flags);await menu[1].onClick({},target);assert.deepEqual(actor.flags,flags);
 game.user.isGM=false;assert.equal(menu.some(row=>row.visible(target)),false);
 await menu[0].onClick({},target);assert.deepEqual(actor.flags,flags);
});


test("Actors sidebar hook supplies context-aware actions without duplicating document-hook entries", async()=>{
 const actor=world();game.actors.get=id=>game.actors.find(row=>row.id===id);
 const handlers=new Map();globalThis.Hooks={on:(name,handler)=>handlers.set(name,handler)};
 const {registerActorEntry}=await import("../scripts/ux/actor-entry.js");registerActorEntry();
 const menu=[];handlers.get("getActorDirectoryEntryContext")({},menu);
 handlers.get("getActorContextOptions")({},menu);
 assert.equal(menu.length,2);
 const row={dataset:{documentId:actor.id}};
 assert.deepEqual(menu.filter(entry=>entry.condition(row)).map(entry=>entry.name),["Open Merchant Builder"]);
 await actor.setFlag(ns,"merchant.enabled",false);
 assert.deepEqual(menu.filter(entry=>entry.condition(row)).map(entry=>entry.name),["Convert to Merchant"]);
 game.user.isGM=false;const denied=[];handlers.get("getActorDirectoryEntryContext")({},denied);assert.deepEqual(denied,[]);
});
