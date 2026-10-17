import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readJson, catalogue } from "./helpers.js";
import { loadCatalogue } from "../scripts/data/catalogue-loader.js";
import { validateCatalogue } from "../scripts/validation/catalogue-validator.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { consumeItemUses } from "./support/native-item-uses.js";

const baseline = await readJson("tests/fixtures/core-generated-baseline-hashes.json");
test("generic mapping extensions leave every pre-existing generated Item unchanged", async () => {
 const c = await loadCatalogue({readJson});assert.equal(baseline.items.length,448);
 for (const {id,sha256} of baseline.items) {
  const i=c.entries.find(e=>e.item.id===id).item;
  assert.equal(createHash("sha256").update(JSON.stringify(catalogueEntryToItem(i))).digest("hex"),sha256,id);
 }
});
const kit=()=>({id:"DT_ITEM_TEST_CHARGES",name:"Limited-use kit",mechanics:{type:"consumable",subtype:"trinket",use:{name:"Spend a charge",mode:"consume",activation:"action",condition:"GM resolves effect",maxUses:10}}});
async function source(){const c=await catalogue();Object.assign(c.entries[0].item,{mechanics:kit().mechanics});return c;}
test("limited-use contract accepts bounded charges and rejects incompatible consumption",async()=>{
 for(const maxUses of [1,10,1000]){const c=await source();c.entries[0].item.mechanics.use.maxUses=maxUses;assert.equal(validateCatalogue(c).valid,true);}
 for(const maxUses of [0,-1,1.5,1001,"10",null]){const c=await source();c.entries[0].item.mechanics.use.maxUses=maxUses;assert.equal(validateCatalogue(c).valid,false);}
 for(const patch of [{subtype:"food"},{subtype:"potion"},{use:{...kit().mechanics.use,mode:"reusable"}}]){const c=await source();Object.assign(c.entries[0].item.mechanics,patch);assert.equal(validateCatalogue(c).valid,false);}
});
test("one native charge per activation is independent of the kit's purchase quantity",()=>{
 const fields=catalogueEntryToItem({...kit(),description:"Supplies",source:{title:"Test",license:"Test"},price:{value:1,denomination:"sp"},weight:{value:1},tags:[],shops:[]}).system;
 assert.deepEqual(fields.uses,{spent:0,max:"10",recovery:[],autoDestroy:true});
 assert.equal(fields.quantity,1);
 assert.deepEqual(Object.values(fields.activities)[0].consumption.targets,[{type:"itemUses",target:"",value:"1",scaling:{mode:"",formula:""}}]);
});
test("pinned native consumption helper exhausts one ten-charge kit and resets the next stacked kit",async()=>{
 globalThis.game={i18n:{format:k=>k}};
 globalThis.foundry={utils:{mergeObject:Object.assign}};
 for(const quantity of [1,2]){
  const item={id:"kit",name:"Kit",system:{quantity,uses:{spent:0,max:10,autoDestroy:true}}};
  for(let n=1;n<=10;n++){
   const updates={item:[],delete:[],rolls:[]};
   await consumeItemUses.call({item,target:"",_usesConsumption:async(_config,{uses})=>({spent:uses.spent+1})},{},updates);
   if(n<10){assert.deepEqual(updates.delete,[]);assert.equal(item.system.quantity,quantity);assert.equal(updates.item[0]["system.uses.spent"],n);item.system.uses.spent=n;}
   else if(quantity===1){assert.deepEqual(updates.delete,["kit"]);assert.deepEqual(updates.item,[]);}
   else {assert.deepEqual(updates.delete,[]);assert.equal(updates.item[0]["system.quantity"],1);assert.equal(updates.item[0]["system.uses.spent"],0);}
  }
 }
});
test("native focus equipment is allowed without granting armour while armour remains strict",async()=>{
 const c=await catalogue(),item=c.entries[0].item;
 item.category="tools";item.shops=["general-store"];item.tags=["mundane","focus"];item.mechanics={type:"equipment",native:{type:{value:"trinket",baseItem:""},properties:["foc"],activities:{}}};
 assert.equal(validateCatalogue(c).valid,true);
 const d=catalogueEntryToItem(item);assert.equal(d.system.type.value,"trinket");assert.deepEqual(d.system.properties,["foc"]);assert.equal(Object.hasOwn(d.system,"armor"),false);
 item.mechanics.native.armor={value:15};assert.equal(validateCatalogue(c).valid,false);
 delete item.mechanics.native.armor;item.mechanics.native.type.value="heavy";assert.equal(validateCatalogue(c).valid,false);
 item.mechanics.native.type.value="unsupported";assert.equal(validateCatalogue(c).valid,false);
});
