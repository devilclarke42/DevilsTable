import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "./helpers.js";
import { Actor, good, setup, ledger } from "./support/trade-world.js";
import { loadStockCatalogue } from "../scripts/data/stock-loader.js";
import { CatalogueRegistry } from "../scripts/catalogues/registry.js";
import { loadEconomy, previewInitialFloat } from "../scripts/merchant/economy.js";
import { loadBuilderPolicy, readConfiguration, validateConfiguration, configurationSnapshot } from "../scripts/merchant/builder/model.js";
import { builtInTemplates, validateTemplate, saveTemplate, customTemplates } from "../scripts/merchant/builder/templates.js";
import { estimateGeneration, generationSettings, generateStock, generateNotes } from "../scripts/merchant/builder/generation.js";
import { saveConfiguration, editFloat, applyBuilderFloat, planBuilderStock, applyBuilderStock } from "../scripts/merchant/builder/service.js";
import { scaledQuantity } from "../scripts/stock/stock-quantities.js";
import { merchantSlots } from "../scripts/merchant/operation-guard.js";
import { quoteTrade } from "../scripts/merchant/trade-model.js";
import { executeTrade } from "../scripts/merchant/transaction.js";
import { stockTableDocuments } from "../scripts/builders/roll-table-factory.js";
import { rollStockFromTables } from "../scripts/stock/stock-roller.js";
const [economy,policy,catalogue,builtins]=await Promise.all([loadEconomy({readJson}),loadBuilderPolicy({readJson}),loadStockCatalogue({readJson}),builtInTemplates({readJson})]);
const registry=new CatalogueRegistry();registry.register({catalogues:catalogue.catalogueDefinitions,categories:catalogue.categoryDefinitions});
const context={economy,policy,catalogue,registry};
function world(){setup();const a=new Actor("merchant",123,[good()]);game.actors=[a];game.scenes=[];game.packs=new Map();return a;}
const draft=()=>structuredClone(builtins[0].settings);
const nativeSnapshot=a=>structuredClone({system:a.system,img:a.img,ownership:a.ownership,prototypeToken:a.prototypeToken,items:[...a.items].map(i=>i.toObject())});

test("all built-in presets validate and contain only portable editable configuration",()=>{
 assert.equal(builtins.length,13);for(const r of builtins)assert.deepEqual(validateTemplate(r,context).settings,{...r.settings,checkoutTime:"10:00"});
 assert.throws(()=>validateTemplate({...builtins[0],settings:{...draft(),inventory:[]}},context),/Unknown/);
 assert.throws(()=>validateTemplate({...builtins[0],actorId:"secret"},context),/Invalid/);
});
test("NPC conversion preserves biography, portrait, ownership, tokens, cash and inventory",async()=>{
 const a=world();a.flags={other:{kept:true}};a.img="portrait.webp";a.ownership={default:0,player:2};a.prototypeToken={name:"Old Nan",texture:{src:"token.webp"}};a.system.details={biography:{value:"Biography"}};
 const before=nativeSnapshot(a);const token={id:"t",actorLink:true,actorId:a.id,name:"Old Nan",texture:{src:"token.webp"}};
 game.scenes=[{tokens:[token],async updateEmbeddedDocuments(type,rows){assert.equal(type,"Token");assert.deepEqual(Object.keys(rows[0]),["_id","flags.devils-table.merchantEntry"]);}}];
 await saveConfiguration(a,draft(),context,configurationSnapshot(a));assert.deepEqual(nativeSnapshot(a),before);assert.deepEqual(a.flags.other,{kept:true});assert.equal(a.getFlag("devils-table","merchant.enabled"),true);
 assert.equal(a.getFlag("devils-table","merchant.notes"),draft().notes);
});
test("configuration preserves customer records, history and unrelated settings",async()=>{
 const a=world();await a.setFlag("devils-table","merchant.relationships.pc",{state:"Friend",spentMinor:100});await a.setFlag("devils-table","merchant.history",["old"]);await a.setFlag("devils-table","merchant.settings.exactChange",true);
 await saveConfiguration(a,{...draft(),infiniteStock:true,relationshipState:"Suspicious",relationshipModifier:20},context,configurationSnapshot(a));
 assert.deepEqual(a.getFlag("devils-table","merchant.relationships.pc"),{state:"Friend",spentMinor:100});assert.deepEqual(a.getFlag("devils-table","merchant.history"),["old"]);assert.equal(a.getFlag("devils-table","merchant.settings.exactChange"),true);
});
test("stale configuration and checkout locks block writes",async()=>{
 const a=world(),snap=configurationSnapshot(a);await a.setFlag("devils-table","merchant.notes","another GM");await assert.rejects(saveConfiguration(a,draft(),context,snap),/changed/);
 merchantSlots.acquire(a.id,"checkout");try{await assert.rejects(saveConfiguration(a,draft(),context,configurationSnapshot(a)),/serving/);}finally{merchantSlots.release(a.id,"checkout");}
 game.user.isGM=false;await assert.rejects(saveConfiguration(a,draft(),context,configurationSnapshot(a)),/active GM/);
});
test("data-defined settlement and prosperity scale estimates without mutating sources",async()=>{
 const before=JSON.stringify(catalogue),low={...draft(),settlement:"hamlet",prosperity:"poor"},high={...draft(),settlement:"large-city",prosperity:"luxury"};
 const a=estimateGeneration(low,context),b=estimateGeneration(high,context);assert.ok(b.units>a.units);assert.ok(b.value>a.value);assert.ok(b.maxCash>a.maxCash);assert.ok(b.rareProbability>a.rareProbability);assert.ok(b.categories.length>0);
 assert.equal(JSON.stringify(catalogue),before);assert.ok(b.draws<=50);
 assert.equal(scaledQuantity(1,"rarely",generationSettings(high,context)),1);assert.equal(scaledQuantity(2,"rarely",generationSettings(high,context)),2);
 const options=await generateStock(high,context,{roll:async options=>options});assert.equal(options.shopId,high.catalogueId);assert.equal(options.draws,b.draws);assert.ok(options.tierChances.rarely>a.rarePerDraw);
});
test("estimate excludes existing source IDs and Tavern has complete coverage",()=>{
 const a=world(),base=estimateGeneration(draft(),context);a.items.get("rope").data.flags["devils-table"].sourceId=catalogue.entries.find(e=>e.item.availability==="core"&&e.item.shops.includes("general-store")).item.id;
 assert.ok(estimateGeneration(draft(),context,a).count<base.count);assert.equal(estimateGeneration({...draft(),catalogueId:"tavern"},context).profile.coverage,"complete");
});
test("tuned tier sampling uses existing pools and never edits RollTable data",async()=>{
 const tables=stockTableDocuments(catalogue,{shopId:"general-store",profileId:"DT_TABLE_GS"}),before=JSON.stringify(tables);
 const result=await rollStockFromTables(tables,{draws:1,eligibleIds:null,tierChances:{often:0,rarely:100},rollDie:async()=>1});
 assert.equal(result.outcomes[0].tier,"rarely");assert.equal(JSON.stringify(tables),before);
 await assert.rejects(rollStockFromTables(tables,{draws:1,tierChances:{often:90,rarely:90},rollDie:async()=>1}),/chances/);
});
test("float edits conserve value and explicit replacement preserves stock",async()=>{
 const a=world(),before=[...a.items].map(i=>i.toObject());
 assert.equal((await previewInitialFloat(a,{policy:economy,roll:async()=>1})).status,"preserved-wallet");
 let p=await previewInitialFloat(a,{policy:economy,replace:true,roll:async()=>1});p=editFloat(p,"18.24","gp",context);assert.equal(p.amountCp,1824);
 assert.throws(()=>editFloat(p,"0.001","gp",context),/valid/);assert.throws(()=>editFloat(p,"-1","gp",context),/valid/);
 await applyBuilderFloat(a,p);assert.deepEqual([...a.items].map(i=>i.toObject()),before);assert.equal(a.system.currency.gp*100+a.system.currency.sp*10+a.system.currency.cp,1824);
 await assert.rejects(applyBuilderFloat(a,p),/changed/);
});
test("stock preview reuses edited float; later merchant changes invalidate apply",async()=>{
 const a=world(),p=await previewInitialFloat(a,{policy:economy,replace:true,roll:async()=>1});
 const f=editFloat(p,"99","sp",context);const stock=await planBuilderStock(a,draft(),context,{float:f,roll:async()=>({profileId:"DT_TABLE_GS",profileName:"Village",items:[]})});
 assert.equal(stock.float.amountCp,990);assert.equal(a.system.currency.cp,123);
 await a.setFlag("devils-table","merchant.notes","changed");await assert.rejects(applyBuilderStock(a,stock),/changed/);
});
test("regenerating notes uses authored policy rather than random campaign lore",()=>{
 assert.equal(generateNotes(draft(),context,builtins[0]),builtins[0].settings.notes);assert.match(generateNotes(draft(),context),/Always stocks/);
});
test("infinite offers remain reusable while normal currency settlement and memory still apply",async()=>{
 const m=world(),pc=new Actor("pc",100);await m.setFlag("devils-table","merchant.settings.infiniteStock",true);await m.setFlag("devils-table","merchant.relationshipDefaults",{state:"Recognises",pricingModifier:-10});
 for(let n=0;n<2;n++){const request={id:`infinite-${n}`,lines:[{id:"rope",quantity:1}],sales:[]};await executeTrade({merchant:m,character:pc,request,quote:quoteTrade(m,pc,request),receiptAdapter:ledger()});}
 assert.equal(m.items.get("rope").system.quantity,1);assert.equal([...pc.items][0].system.quantity,2);assert.equal(pc.system.currency.cp,82);assert.equal(m.getFlag("devils-table","merchant.relationships.pc").state,"Recognises");
});
test("infinite container offers create separate native containers and rollback failed delivery",async()=>{
 setup();const m=new Actor("merchant",0,[{...good(),type:"container"}]),pc=new Actor("pc",100);await m.setFlag("devils-table","merchant.settings.infiniteStock",true);
 const request={id:"bag",lines:[{id:"rope",quantity:1}],sales:[]};
 await executeTrade({merchant:m,character:pc,request,quote:quoteTrade(m,pc,request),receiptAdapter:ledger()});assert.equal(m.items.size,1);assert.equal(pc.items.size,1);
 pc.createEmbeddedDocuments=async()=>{throw Error("delivery failure");};await assert.rejects(executeTrade({merchant:m,character:pc,request:{...request,id:"failed"},quote:quoteTrade(m,pc,request),receiptAdapter:ledger()}),/delivery failure/);
 assert.equal(pc.system.currency.cp,90);assert.equal(m.items.size,1);assert.equal(pc.items.size,1);
});
test("custom templates use a private pack, round-trip editable settings and exclude live data",async()=>{
 world();const gm=game.user;game.users=[gm,{id:"player",isGM:false}];game.users.activeGM=gm;
 const docs=[];const pack={collection:"world.devils-table-merchant-templates",documentName:"JournalEntry",metadata:{packageType:"world"},testUserPermission:()=>false,configure:async()=>{},getIndex:async()=>new Map(docs.map((r,i)=>[String(i),r]))};
 game.packs.set(pack.collection,pack);CONFIG.JournalEntry={documentClass:{createDocuments:async rows=>{docs.push(...structuredClone(rows));return rows.map(r=>({getFlag:()=>r.flags["devils-table"].merchantTemplate}));}}};
 const saved=await saveTemplate("My trader",draft(),context);const loaded=await customTemplates();assert.deepEqual(loaded,[saved]);loaded[0].settings.notes="edited";assert.notEqual(saved.settings.notes,"edited");
 await assert.rejects(saveTemplate("My trader",draft(),context),/already/);pack.testUserPermission=()=>true;await assert.rejects(customTemplates(),/GM-only/);game.user.isGM=false;await assert.rejects(saveTemplate("No",draft(),context),/active GM/);
});

test("merchant checkout defaults remain compatible with old templates and save independently",async()=>{
 const a=world();
 assert.equal(readConfiguration(a,context).checkoutTime,"10:00");
 assert.equal(validateConfiguration(draft(),context).checkoutTime,"10:00");
 await saveConfiguration(a,{...draft(),checkoutTime:"11:30"},context,configurationSnapshot(a));
 assert.equal(readConfiguration(a,context).checkoutTime,"11:30");
 assert.equal(validateTemplate({...builtins[0],settings:{...draft(),checkoutTime:"12:00"}},context).settings.checkoutTime,"12:00");
 assert.throws(()=>validateConfiguration({...draft(),checkoutTime:"24:00"},context),/outside/);
});
