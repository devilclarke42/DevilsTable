import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateEconomy, resolveEconomy, floatAmount, floatCoins, previewInitialFloat, applyInitialFloat } from "../scripts/merchant/economy.js";
import { walletValue } from "../scripts/merchant/settlement.js";
import { emptyMerchantStock, merchantSummary } from "../scripts/merchant/administration.js";
import { merchantSlots, activeActorWrites } from "../scripts/merchant/operation-guard.js";
import { applyCompendiumNames, COMPENDIUM_NAMES } from "../scripts/core/compendium-names.js";
const policy = JSON.parse(readFileSync(new URL("../data/economy.json", import.meta.url)));
const copy = x => structuredClone(x);
function setup(t) {
  const old = globalThis.game;
  globalThis.game = { user: { id: "gm", isGM: true }, users: { activeGM: { id: "gm" } }, settings: { get: () => false } };
  t.after(() => { globalThis.game = old; activeActorWrites.clear(); merchantSlots.release("m", "checkout"); });
  const actor = { id: "m", type: "npc", system: { currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 } },
    flags: { "devils-table": { merchant: { enabled: true, notes: "keep", relationships: {} } } }, items: [],
    getFlag(scope, key) { return key.split(".").reduce((o,k) => o?.[k], this.flags[scope]); },
    async update(changes) { for (const [key,value] of Object.entries(changes)) { let target=this; const parts=key.split("."); for(const k of parts.slice(0,-1)) target=target[k] ??= {}; target[parts.at(-1)]=copy(value); } },
    async setFlag(scope,key,value) { await this.update({ [`flags.${scope}.${key}`]: value }); },
    async deleteEmbeddedDocuments(_type,ids) { this.items.splice(0,this.items.length,...this.items.filter(i=>!ids.includes(i.id))); }
  };
  actor.items.get = id => actor.items.find(i=>i.id===id);
  return actor;
}
function item(id,type="loot",quantity=2) { const data={_id:id,type,name:id,system:{quantity,price:{value:5,denomination:"sp"}}}; return {...data,id,getFlag:()=>null,toObject:()=>copy(data)}; }
const preview = (actor, options={}) => previewInitialFloat(actor,{policy,roll:async()=>1,...options});
test("economy policy validates ranges, identities, defaults and coin proportions",()=>{
  assert.equal(validateEconomy(policy),policy);
  for(const mutate of [p=>p.coinShares.gp=99,p=>p.settlements[0].maxCp=-1,p=>p.defaults.profile="missing",p=>p.profiles.push(p.profiles[0])]) {const p=copy(policy);mutate(p);assert.throws(()=>validateEconomy(p));}
});
test("float follows settlement, prosperity and profile data and conserves every coin",()=>{
  const values = ["village","town","city"].map(settlement=>floatAmount(policy,resolveEconomy(policy,{settlement}),1));
  assert.ok(values[0]<values[1] && values[1]<values[2]);
  assert.equal(floatAmount(policy,resolveEconomy(policy,{profile:"luxury"}),1),values[0]*3);
  for(const n of [0,1,99,2000,12345,50000]) assert.equal(walletValue(floatCoins(n,policy.coinShares)),n);
  assert.throws(()=>floatAmount(policy,resolveEconomy(policy),0));
});
test("planning is read-only and native cash plus one-time marker commit together",async t=>{
  const a=setup(t), before=copy(a.system), p=await preview(a);
  assert.deepEqual(a.system,before);assert.equal(p.status,"generated");
  await applyInitialFloat(a,p);assert.equal(walletValue(a.system.currency),p.amountCp);
  const second=await preview(a);assert.equal(second.status,"already-initialized");
  await applyInitialFloat(a,second);assert.equal(walletValue(a.system.currency),p.amountCp);
  await assert.rejects(applyInitialFloat(a,p),/changed/);
});
test("existing wallets, established stock and infinite merchants do not receive free cash",async t=>{
  const a=setup(t);a.system.currency.gp=17;assert.equal((await preview(a)).status,"preserved-wallet");
  a.system.currency.gp=0;a.items.push(item("old"));assert.equal((await preview(a)).status,"preserved-existing-merchant");
  a.items.length=0;a.flags["devils-table"].merchant.settings={walletMode:"infinite"};assert.equal((await preview(a)).status,"infinite-wallet");
});
test("stale float plans and player writes are rejected",async t=>{
  const a=setup(t),p=await preview(a);a.system.currency.cp=1;
  await assert.rejects(applyInitialFloat(a,p),/changed/);a.system.currency.cp=0;game.user.isGM=false;
  await assert.rejects(applyInitialFloat(a,p),/active GM/);
});
test("cancelled Empty Stock preserves everything; confirmed reset preserves non-stock and merchant records",async t=>{
  const a=setup(t);a.items.push(item("bag","container"),item("feat","feat"),item("spell","spell"));a.system.currency.gp=7;
  const before=copy(a.flags);assert.deepEqual(await emptyMerchantStock(a,{confirm:async()=>false}),{removed:0});assert.deepEqual(a.flags,before);
  assert.deepEqual(await emptyMerchantStock(a,{confirm:async()=>true}),{removed:1});assert.deepEqual(a.items.map(i=>i.id),["feat","spell"]);
  assert.equal(a.system.currency.gp,7);assert.equal(a.getFlag("devils-table","merchant.notes"),"keep");
  a.system.currency.gp=0;assert.equal((await preview(a)).status,"already-initialized");
});
test("administration cannot overlap checkout, transaction writes or pending recovery",async t=>{
  const a=setup(t);a.items.push(item("stock"));merchantSlots.acquire(a.id,"checkout");
  await assert.rejects(emptyMerchantStock(a,{confirm:async()=>true}),/serving/);merchantSlots.release(a.id,"checkout");
  activeActorWrites.add(a.id);await assert.rejects(emptyMerchantStock(a,{confirm:async()=>true}),/serving/);activeActorWrites.clear();
  a.flags["devils-table"].transactionPending={id:"recovery"};await assert.rejects(emptyMerchantStock(a,{confirm:async()=>true}),/recovery/);assert.equal(a.items.length,1);
});
test("inventory edits during confirmation abort without deletion",async t=>{
  const a=setup(t);a.items.push(item("stock"));await assert.rejects(emptyMerchantStock(a,{confirm:async()=>{a.items.push(item("new"));return true;}}),/changed/);assert.equal(a.items.length,2);
});
test("cancelled native deletion is reported instead of claiming success",async t=>{
  const a=setup(t);a.items.push(item("stock"));a.deleteEmbeddedDocuments=async()=>{};
  await assert.rejects(emptyMerchantStock(a,{confirm:async()=>true}),/partially/);assert.equal(a.items.length,1);
});
test("summary separates lifetime relationship totals from retained rejection counts and stays GM-only",async t=>{
  const a=setup(t);a.items.push(item("stock"));a.system.currency.gp=2;
  a.flags["devils-table"].merchant.relationships={pc:{spentMinor:400,receivedMinor:100,transactionCount:3}};
  const summary=await merchantSummary(a,{policy,rejected:async()=>2});const rows=Object.fromEntries(summary.rows.map(r=>[r.label,r.value]));
  assert.equal(rows["Inventory value"],"1 gp");assert.equal(rows["Merchant wealth (inventory + cash)"],"3 gp");assert.equal(rows["Successful transactions"],3);assert.equal(rows["Rejected transactions (retained history)"],2);
  game.user.isGM=false;await assert.rejects(merchantSummary(a,{policy}),/GM-only/);
});
test("compendium display names preserve metadata, collection identities and access",t=>{
  setup(t);const id="world.devils-table-items",pack={documentName:"Item",metadata:{packageType:"world",label:"Old"},title:"Old",ownership:{PLAYER:"NONE"}};
  game.packs=new Map([[id,pack]]);const metadata=copy(pack.metadata);applyCompendiumNames();
  assert.equal(game.packs.get(id),pack);assert.equal(pack.title,COMPENDIUM_NAMES[id].label);assert.deepEqual(pack.metadata,metadata);assert.equal(pack.ownership.PLAYER,"NONE");
});
test("native first-stock hooks initialize once, without storing cash on Items",async t=>{
  const a=setup(t), oldHooks=globalThis.Hooks, oldFetch=globalThis.fetch, oldRoll=globalThis.Roll;
  t.after(()=>{globalThis.Hooks=oldHooks;globalThis.fetch=oldFetch;globalThis.Roll=oldRoll;});
  const hooks={};globalThis.Hooks={on:(name,fn)=>hooks[name]=fn};globalThis.fetch=async()=>({ok:true,json:async()=>copy(policy)});
  globalThis.Roll=class {async evaluate(){return {total:1};}};
  const {registerInitialStockHooks}=await import("../scripts/merchant/initial-stock-hooks.js");registerInitialStockHooks();
  const first=item("first"), options={};first.parent=a;
  hooks.preCreateItem(first,{},options);assert.equal(options.devilsTableFirstStock,true);a.items.push(first);
  hooks.createItem(first,options);hooks.createItem(first,options);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(walletValue(a.system.currency),2000);assert.equal(a.getFlag("devils-table","merchant.initialFloat").status,"generated");
  hooks.createItem(first,options);await new Promise(resolve=>setImmediate(resolve));assert.equal(walletValue(a.system.currency),2000);
  assert.equal(first.system.currency,undefined);
});
