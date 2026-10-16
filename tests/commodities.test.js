import test from "node:test";
import assert from "node:assert/strict";
import {readJson} from "./helpers.js";
import {catalogueEntryToItem} from "../scripts/builders/item-factory.js";
import {loadStockCatalogue} from "../scripts/data/stock-loader.js";
import {stockProfiles,stockGroups} from "../scripts/data/stock-catalogue.js";
import {stockTableDocuments,itemUuid} from "../scripts/builders/roll-table-factory.js";
import {rollStockQuantity} from "../scripts/stock/stock-quantities.js";
const rows=await readJson("data/items/general-store/commodities.json");
test("commodity quantities retain the stated whole purchase unit and full bullion mass/value",()=>{
 assert.equal(rows.length,11);
 for(const i of rows){const doc=catalogueEntryToItem(i);assert.equal(doc.type,"loot");assert.equal(doc.system.quantity,1);assert.equal(i.mechanics.subtype,"trade");assert.match(i.saleUnit,/^One (pound|square yard)/);assert.equal(doc.system.activities,undefined);}
 for(const [metal,gp] of [["SILVER",5],["GOLD",50],["PLATINUM",500]]){const i=rows.find(i=>i.id===`DT_ITEM_GS_BAR_${metal}`);assert.deepEqual(i.price,{value:gp,denomination:"gp"});assert.equal(i.weight.value,1);assert.deepEqual(i.shops,["general-store","blacksmith","black-market"]);}
 assert.deepEqual(rows.find(i=>i.id==="DT_ITEM_GS_CLOTH_COTTON").price,{value:5,denomination:"cp"});
});
test("shared bullion resolves to one canonical UUID across three merchant pools",async()=>{
 const data=await loadStockCatalogue({readJson}),tables=stockTableDocuments(data);
 for(const metal of ["SILVER","GOLD","PLATINUM"]){const id=`DT_ITEM_GS_BAR_${metal}`;assert.equal(data.entries.filter(e=>e.item.id===id).length,1);const matched=tables.flatMap(t=>t.results).filter(r=>r.flags["devils-table-merchants"]?.itemId===id);assert.ok(matched.length>=3);assert.ok(matched.every(r=>r.documentUuid===itemUuid(id)));}
});
test("valuable bullion retains rare low-volume stock and reuses the Crime Boss visibility rule",async()=>{
 const data=await loadStockCatalogue({readJson}),profiles=stockProfiles(data),city=stockGroups(data,profiles.find(p=>p.id==="DT_TABLE_GS_CITY"));
 for(const metal of ["GOLD","PLATINUM"]){const item=rows.find(i=>i.id===`DT_ITEM_GS_BAR_${metal}`);assert.ok(city.rarely.some(i=>i.id===item.id));for(const roll of [1,95,96,100]){const result=await rollStockQuantity(data.quantities,item,"rarely",async()=>roll);assert.equal(result.quantity,roll<=95?1:2);}}
 const boss=profiles.find(p=>p.name==="Crime Boss");assert.ok(boss);assert.ok(boss.offerRules.some(r=>r.tag==="valuable"&&r.visibility.mode==="relationship"&&r.visibility.minPurchases===5));assert.ok(rows.filter(i=>i.id.includes("_BAR_")).every(i=>i.tags.includes("valuable")));
});
