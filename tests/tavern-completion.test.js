import test from "node:test";
import assert from "node:assert/strict";
import { readJson, fakeAdapter } from "./helpers.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { stockProfiles, stockGroups } from "../scripts/data/stock-catalogue.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { createStockTableBuilder } from "../scripts/builders/roll-table-builder.js";
import { matchesOffer } from "../scripts/catalogues/registry.js";
const additions=new Set(["soups","fish","imported-drinks","tavern-supplies"]);
const shared=new Set(["DT_ITEM_GS_WATERSKIN","DT_ITEM_GS_RATIONS_TRAVEL","DT_ITEM_GS_FIREWOOD","DT_ITEM_GS_BEDROLL","DT_ITEM_GS_MESS_KIT","DT_ITEM_GS_FLINT_STEEL"]);
test("alpha.12 upgrades add only sixteen Items and six memberships; repeated builds converge",async()=>{
 const data=await loadStockCatalogue({readJson});
 const old=data.entries.filter(e=>!additions.has(e.item.category)).map(({item})=>{
  const r=structuredClone(item);if(shared.has(r.id))r.shops=r.shops.filter(s=>s!=="tavern");return catalogueEntryToItem(r);
 });
 assert.equal(old.length,296);
 const {adapter,state}=fakeAdapter({existing:old}),build=createBuilder({load:()=>data,adapter});
 const p=await build();assert.deepEqual([p.create,p.update,p.unchanged],[16,6,290]);assert.equal(state.writes.length,0);
 await build({dryRun:false});assert.equal(state.docs.length,312);assert.equal((await build()).unchanged,312);
});
test("new stock profiles add twenty tables while preserving every pre-existing identity",async()=>{
 const data=await loadStockCatalogue({readJson}),previous=structuredClone(data);
 previous.entries=previous.entries.filter(e=>!additions.has(e.item.category));
 for(const {item} of previous.entries)if(shared.has(item.id))item.shops=item.shops.filter(s=>s!=="tavern");
 const p=previous.stock.profiles.find(p=>p.shop==="tavern");delete p.variants;p.overrides=p.overrides.filter(r=>!shared.has(r.itemId));
 const old=stockTableDocuments(previous);assert.equal(old.length,32);
 const {adapter,state}=fakeAdapter({existing:old}),build=createStockTableBuilder({load:()=>data,adapter});
 const plan=await build();assert.deepEqual([plan.create,plan.update,plan.unchanged],[20,2,30]);
 await build({dryRun:false});assert.equal(state.docs.length,52);assert.ok(old.every(r=>state.docs.some(n=>n._id===r._id)));
 assert.equal((await build()).unchanged,52);
});
test("six Tavern profiles curate distinct menus and never copy a canonical item",async()=>{
 const data=await loadStockCatalogue({readJson}),profiles=stockProfiles(data).filter(p=>p.shop==="tavern"),signatures=[];
 assert.equal(profiles.length,6);
 for(const profile of profiles){
  const groups=stockGroups(data,profile),rows=Object.values(groups).flat();
  assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);assert.ok(groups.always.length>=4);
  assert.ok(rows.some(r=>r.name==="Drinking Water"));signatures.push(rows.map(r=>r.id).sort().join(','));
 }
 assert.equal(new Set(signatures).size,6);
 const luxury=stockGroups(data,profiles.find(p=>p.id==="DT_TABLE_TAV_LUXURY"));
 assert.ok(luxury.often.some(r=>r.category==="luxury-meals"));assert.ok(!Object.values(luxury).flat().some(r=>r.name==="Small Ale"));
 const dock=stockGroups(data,profiles.find(p=>p.id==="DT_TABLE_TAV_DOCKSIDE"));assert.ok(dock.always.some(r=>r.name==="Grilled Sardines"));
});
test("new categories contain complete unique products and search finds flavour, tags and categories",async()=>{
 const data=await loadStockCatalogue({readJson});
 for(const category of additions){
  const rows=data.entries.filter(e=>e.item.category===category);assert.equal(rows.length,4);
  assert.deepEqual(rows.map(e=>e.item.name),data.categoryDefinitions.find(c=>c.id===category).plannedItems);
  for(const {item} of rows){assert.ok(item.saleUnit&&item.description&&item.weight.notes);assert.ok(item.tags.length>=4);assert.ok(item.shops.includes('tavern'));}
 }
 const row=data.entries.find(e=>e.item.name==="Spiced Pomegranate Drink").item;
 for(const query of ['cinnamon','non-alcoholic','imported-drinks'])assert.ok(matchesOffer(row,query));
 for(const {item} of data.entries.filter(e=>e.item.category==='tavern-supplies'))assert.equal(catalogueEntryToItem(item).type,'loot');
});
test("Tavern presets contain editable stories, varied prices, and safe merchant-only configuration",async()=>{
 const rows=(await readJson('data/merchant-templates.json')).filter(t=>t.settings.catalogueId==='tavern');assert.equal(rows.length,9);
 for(const row of rows){for(const part of ['Personality:','Suggested greeting:','Specialities:','Known For:','Optional Stories'])assert.ok(row.settings.notes.includes(part),row.id);assert.equal(row.settings.checkoutTime,'10:00');assert.ok(!('actorId' in row.settings));}
 assert.ok(new Set(rows.map(r=>r.settings.pricingModifier)).size>=6);
 assert.ok(new Set(rows.map(r=>r.settings.stockProfileId)).size===6);
});
