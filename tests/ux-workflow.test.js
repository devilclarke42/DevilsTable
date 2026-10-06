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
 const all=generationSummary(catalogue,{shopId:null},services,52);
 assert.equal(all.products,312);assert.equal(all.services,16);assert.equal(all.tables,52);
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
 const menu=[];addActorContext(null,menu);assert.equal(menu.length,1);assert.equal(menu[0].condition({dataset:{entryId:actor.id}}),true);
 assert.equal(menu[0].condition({dataset:{entryId:"missing"}}),false);assert.ok(openNpcBuilder(actor));
 game.user.isGM=false;assert.equal(openNpcBuilder(actor),undefined);const playerMenu=[];addActorContext(null,playerMenu);assert.deepEqual(playerMenu,[]);
});
