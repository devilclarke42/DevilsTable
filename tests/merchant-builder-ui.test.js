import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "./helpers.js";
import { setup, Actor } from "./support/trade-world.js";
import { catalogueRegistry } from "../scripts/catalogues/registry.js";

test("single-panel configuration updates estimates locally, saves explicitly and previews editable cash", async () => {
  setup();
  const actor = new Actor("merchant",0);delete actor.flags["devils-table"].merchant;
  game.actors=[actor];game.actors.get=id=>game.actors.find(a=>a.id===id);game.scenes=[];game.packs=new Map();
  game.user.isGM=true;
  globalThis.fetch=async url=>({ok:true,json:()=>readJson(String(url).replace("modules/devils-table/",""))});
  globalThis.Roll=class {async evaluate(){return {total:1};}};
  const errors=[];globalThis.ui={notifications:{error:msg=>errors.push(msg)}};
  let renders=0,closed=0;
  foundry.applications={api:{ApplicationV2:class {async _prepareContext(){return {};} async render(){renders++;return this;} async close(){closed++;return this;}},
    HandlebarsApplicationMixin:Base=>Base,DialogV2:{confirm:async()=>true}}};
  catalogueRegistry.register({catalogues:await readJson("data/catalogues.json"),categories:await readJson("data/categories.json")});
  const {MerchantBuilderApplication:App}=await import("../scripts/merchant/builder/app.js");
  const app=new App({actorId:actor.id});let context=await app._prepareContext({});
  assert.equal(context.generationBlocked,true);assert.equal(context.actorName,"merchant");assert.ok(context.summary.rows.length>0);
  const nodes=new Map(), fields=[];
  function node(name,value,type="select-one") {const n={name,value,type,checked:false,addEventListener(event,fn){this[event]=fn;}};nodes.set(`[name=${name}]`,n);return n;}
  node("builderNpc",actor.id);fields.push(node("settlement","village"));fields.push(node("prosperity","average"));
  const closeButton={disabled:false};
  app.element={querySelector(selector){if(!nodes.has(selector))nodes.set(selector,{});return nodes.get(selector);},querySelectorAll(selector){return selector==="[data-config]"?fields:selector==="input, select, textarea, button"?[closeButton]:[];}};
  app._onRender({},{});fields[0].value="city";fields[0].input({target:fields[0]});
  assert.equal(nodes.get('[data-estimate="settlement"]').textContent,"city");assert.match(nodes.get('[data-estimate="dirty"]').textContent,/Unsaved/);
  assert.equal(actor.getFlag("devils-table","merchant"),undefined);assert.equal(actor.system.currency.cp,0);
  await App.DEFAULT_OPTIONS.actions.save.call(app);assert.equal(actor.getFlag("devils-table","merchant.economy").settlement,"city");assert.equal(actor.system.currency.cp,0);
  context=await app._prepareContext({});assert.equal(context.generationBlocked,false);
  nodes.get("[name=replaceCash]") ?? nodes.set("[name=replaceCash]",{checked:false});
  await App.DEFAULT_OPTIONS.actions.generateFloat.call(app);context=await app._prepareContext({});assert.equal(context.float.generated,true);assert.equal(context.float.label,"250 gp");assert.equal(actor.system.currency.cp,0);
  node("floatValue","12.34","number");node("floatDenomination","gp");
  await App.DEFAULT_OPTIONS.actions.editFloat.call(app);context=await app._prepareContext({});assert.equal(context.float.label,"12 gp 3 sp 4 cp");
  await App.DEFAULT_OPTIONS.actions.applyFloat.call(app);assert.equal(actor.system.currency.gp*100+actor.system.currency.sp*10+actor.system.currency.cp,1234);
  assert.equal(closeButton.disabled,false);
  let finishRoll;
  globalThis.Roll=class {async evaluate(){return new Promise(resolve=>{finishRoll=resolve;});}};
  nodes.set("[name=replaceCash]",{checked:true});
  const pending=App.DEFAULT_OPTIONS.actions.generateFloat.call(app);
  await new Promise(resolve=>setImmediate(resolve));
  const beforeClose=renders;
  await app.close();assert.equal(closed,1);assert.equal(closeButton.disabled,false);
  finishRoll({total:1});await pending;assert.equal(renders,beforeClose);
  assert.deepEqual(errors,[]);game.user.isGM=false;await assert.rejects(app._prepareContext({}),/GM-only/);
});
