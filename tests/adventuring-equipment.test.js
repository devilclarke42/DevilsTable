import test from "node:test";
import assert from "node:assert/strict";
import {readJson} from "./helpers.js";
import {catalogueEntryToItem} from "../scripts/builders/item-factory.js";
import {loadStockCatalogue} from "../scripts/data/stock-loader.js";
import {stockProfiles,stockGroups} from "../scripts/data/stock-catalogue.js";
const rows=await readJson("data/items/general-store/adventuring-equipment.json"),data=await loadStockCatalogue({readJson});
test("all audited adventuring source units are covered without replacing useful original variants",async()=>{
 const c=await readJson("docs/content/CATALOGUE_COVERAGE.json");assert.equal(c.equipment.filter(r=>r.group==="adventuring-gear"&&!r.represented).length,0);
 assert.equal(rows.length,34);assert.equal(new Set(rows.map(i=>i.id)).size,34);
 for(const [a,b] of [["DT_ITEM_ALC_VIAL","DT_ITEM_GS_VIAL_STANDARD"],["DT_ITEM_GS_POT_COOKING","DT_ITEM_GS_POT_IRON_GALLON"],["DT_ITEM_GS_BOTTLE","DT_ITEM_GS_BOTTLE_STANDARD"],["DT_ITEM_GS_BOOK_BLANK","DT_ITEM_GS_BOOK_LORE"]]){
  const records=[a,b].map(id=>data.entries.find(e=>e.item.id===id).item);assert.notEqual(records[0].saleUnit,records[1].saleUnit);assert.notEqual(catalogueEntryToItem(records[0])._id,catalogueEntryToItem(records[1])._id);
 }
});
test("twelve focuses carry the native focus property and no armour or magical bonus",()=>{
 const focuses=rows.filter(i=>i.tags.includes("spellcasting-focus"));assert.equal(focuses.length,12);
 for(const i of focuses){const d=catalogueEntryToItem(i);assert.equal(d.type,"equipment");assert.equal(d.system.type.value,"trinket");assert.deepEqual(d.system.properties,["foc"]);assert.equal(Object.hasOwn(d.system,"armor"),false);assert.deepEqual(d.system.activities,{});}
 for(const i of rows.filter(i=>i.category==="clothing")){const d=catalogueEntryToItem(i);assert.equal(d.type,"equipment");assert.deepEqual(d.system.properties,[]);assert.equal(Object.hasOwn(d.system,"armor"),false);}
});
test("the medical kit has ten native uses and no automatic healing or stabilization effect",()=>{
 const d=catalogueEntryToItem(rows.find(i=>i.id.endsWith("HEALERS_KIT")));assert.equal(d.system.quantity,1);assert.equal(d.system.uses.max,"10");
 const a=Object.values(d.system.activities)[0];assert.equal(a.type,"utility");assert.equal(a.activation.type,"action");assert.equal(a.consumption.targets[0].value,"1");assert.deepEqual(a.effects,[]);assert.match(d.system.description.value,/zero hit points/);
});
test("single-dose hazards deploy the whole stated purchase unit; traps remain reusable",()=>{
 for(const suffix of ["ACID","ALCHEMISTS_FIRE","ANTITOXIN","BALL_BEARINGS","CALTROPS","HOLY_WATER"]){const d=catalogueEntryToItem(rows.find(i=>i.id.endsWith('_'+suffix)));assert.equal(d.system.quantity,1);assert.equal(d.system.uses.max,"1");assert.equal(d.system.uses.autoDestroy,true);assert.deepEqual(Object.values(d.system.activities)[0].effects,[]);}
 const trap=catalogueEntryToItem(rows.find(i=>i.id.endsWith("HUNTING_TRAP")));assert.equal(trap.system.uses.autoDestroy,false);assert.deepEqual(Object.values(trap.system.activities)[0].consumption.targets,[]);
});
test("no added adventuring good is guaranteed by every village shop; bulky goods stay out of travelling stock",()=>{
 const ids=new Set(rows.map(i=>i.id));for(const p of stockProfiles(data)){const g=stockGroups(data,p);assert.equal(g.always.filter(i=>ids.has(i.id)).length,0);if(p.id==="DT_TABLE_GS_WAGON")for(const i of Object.values(g).flat().filter(i=>ids.has(i.id)))assert.ok(i.weight.value<=5);if(p.id==="DT_TABLE_ALC_TRAVELLING")for(const i of Object.values(g).flat().filter(i=>ids.has(i.id)))assert.ok(i.weight.value<=.5&&i.availability!=="special-order");}
});
