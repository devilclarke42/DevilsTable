import test from "node:test";import assert from "node:assert/strict";
import {readJson} from "./helpers.js";import{catalogueEntryToItem}from"../scripts/builders/item-factory.js";
import{loadStockCatalogue}from"../scripts/data/stock-loader.js";import{stockProfiles,stockGroups}from"../scripts/data/stock-catalogue.js";
const rows=await readJson("data/items/general-store/artisan-tools-instruments.json");
test("all 35 audited tool units are represented while the two released gaming-set types remain untouched",async()=>{
 const c=await readJson("docs/content/CATALOGUE_COVERAGE.json"),data=await loadStockCatalogue({readJson});const toolrows=c.equipment.filter(r=>r.group==="tools");assert.equal(toolrows.length,35);assert.ok(toolrows.every(r=>r.represented));
 assert.equal(toolrows.filter(r=>data.entries.find(e=>e.item.id===r.canonicalIds[0]).item.mechanics.type==="tool").length,33);
 assert.equal(toolrows.filter(r=>r.status==="incomplete").length,2);assert.equal(rows.length,25);
});
test("new artisan and musical tools match pinned native bases and abilities without granting proficiency or crafting output",async()=>{
 const ref=await readJson("tests/fixtures/core-tool-native-references.json");assert.equal(ref.references.length,25);
 for(const r of ref.references){const d=catalogueEntryToItem(rows.find(i=>i.id===r.canonicalId));assert.equal(d.type,"tool");assert.deepEqual(d.system.type,r.type);assert.equal(d.system.ability,r.ability);assert.equal(Object.hasOwn(d.system,"proficient"),false);const a=Object.values(d.system.activities)[0];assert.equal(a.type,"check");assert.equal(a.check.ability,r.ability);assert.deepEqual(a.consumption.targets,[]);assert.deepEqual(a.effects,[]);}
 assert.equal(rows.filter(i=>i.mechanics.native.type.value==="art").length,15);assert.equal(rows.filter(i=>i.mechanics.native.type.value==="music").length,10);
});
test("village stock keeps specialist tools optional while city profiles broaden their pools",async()=>{
 const data=await loadStockCatalogue({readJson}),ps=stockProfiles(data),ids=new Set(rows.map(i=>i.id));const base=stockGroups(data,ps.find(p=>p.id==="DT_TABLE_GS")),city=stockGroups(data,ps.find(p=>p.id==="DT_TABLE_GS_CITY"));
 assert.equal(base.always.filter(i=>ids.has(i.id)).length,0);assert.equal(base.rarely.filter(i=>ids.has(i.id)).length,16);assert.equal(city.often.filter(i=>ids.has(i.id)).length,25);
});
