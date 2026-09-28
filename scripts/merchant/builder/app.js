import { resetMerchant } from "../reset-merchant.js";
import { walletValue } from "../settlement.js";
import { MODULE_ID } from "../../constants.js";
import { catalogueRegistry } from "../../catalogues/registry.js";
import { loadStockCatalogue } from "../../data/stock-loader.js";
import { stockProfiles } from "../../data/stock-catalogue.js";
import { economyPolicy, previewInitialFloat } from "../economy.js";
import { emptyMerchantStock, merchantSummary } from "../administration.js";
import { formatCopper } from "../currency.js";
import { merchantConfig } from "../model.js";
import { stable } from "../trade-model.js";
import { loadBuilderPolicy, readConfiguration, validateConfiguration, configurationSnapshot } from "./model.js";
import { builtInTemplates, customTemplates, validateTemplate, saveTemplate } from "./templates.js";
import { estimateGeneration, generateNotes } from "./generation.js";
import { saveConfiguration, planBuilderStock, applyBuilderStock, editFloat, applyBuilderFloat, editStockQuantities } from "./service.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const choices = (rows, selected) => rows.map(r => ({ ...r, selected: r.id === selected }));

/** Single editable panel. Drafts/previews are local; only explicit actions write native documents. */
export class MerchantBuilderApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #tab="setup";
  #actorId; #context; #draft; #saved; #snapshot; #templates=[]; #templateId="";
  #stockPending=false; #stock=null; #float=null; #floatPending=false; #busy=false; #closed=false; #message="Select an NPC, adjust settings, then Save / Convert.";
  constructor({actorId="",...options}={}) { super(options); this.#actorId=actorId; }
  static DEFAULT_OPTIONS = {
    id:"devils-table-merchant-builder",classes:["devils-table"],tag:"section",position:{width:850,height:730},
    window:{title:"Devil's Table: Trade & Merchants — Merchant Builder",icon:"fa-solid fa-store",resizable:true},
    actions:{services:MerchantBuilderApplication.#services,editStock:MerchantBuilderApplication.#editStock,selectTab:MerchantBuilderApplication.#selectTab,stepTab:MerchantBuilderApplication.#stepTab,resetMerchant:MerchantBuilderApplication.#resetMerchant,save:MerchantBuilderApplication.#save,generateStock:MerchantBuilderApplication.#generateStock,
      generateFloat:MerchantBuilderApplication.#generateFloat,generateNotes:MerchantBuilderApplication.#generateNotes,
      applyStock:MerchantBuilderApplication.#applyStock,applyFloat:MerchantBuilderApplication.#applyFloat,
      editFloat:MerchantBuilderApplication.#editFloat,empty:MerchantBuilderApplication.#empty,
      applyTemplate:MerchantBuilderApplication.#applyTemplate,saveTemplate:MerchantBuilderApplication.#saveTemplate,
      reload:MerchantBuilderApplication.#reload,advanced:MerchantBuilderApplication.#advanced}
  };
  static PARTS={body:{template:"modules/devils-table/templates/merchant-builder.hbs"}};
  async close(options = {}) {
    this.#closed = true;
    return super.close(options);
  }
  get actor() { return game.actors.get(this.#actorId); }
  #requireGM() { if(!game.user?.isGM) throw Error("Merchant Builder is GM-only."); }
  #loadActor() {
    this.#draft=readConfiguration(this.actor,this.#context);this.#saved=structuredClone(this.#draft);
    this.#snapshot=configurationSnapshot(this.actor);this.#stock=null;this.#float=null;
  }
  #dirty() {return stable(this.#draft)!==stable(this.#saved);}
  #requireSaved() {
    if(!merchantConfig(this.actor) || this.#dirty()) throw Error("Save / Convert this NPC before generating or applying stock and cash.");
    if(configurationSnapshot(this.actor)!==this.#snapshot) throw Error("Merchant data changed. Reload the NPC before continuing.");
  }
  async _prepareContext(options) {
    this.#requireGM();
    if(!this.#context) {
      const [economy,policy,catalogue,builtins]=await Promise.all([economyPolicy(),loadBuilderPolicy(),loadStockCatalogue(),builtInTemplates()]);
      this.#context={economy,policy,catalogue};this.#context.builtins=builtins;
    }
    if(!this.#draft) this.#loadActor();
    this.#templates=[...this.#context.builtins.map(r=>({...r,key:`builtin:${r.id}`,origin:"Built-in"})),...(await customTemplates()).map(r=>({...r,key:`world:${r.id}`,origin:"World"}))]
      .map(r=>{try{validateTemplate({schemaVersion:r.schemaVersion,id:r.id,name:r.name,settings:r.settings},this.#context);return r;}catch(error){return {...r,unavailable:true,name:`${r.name} — unavailable: ${error.message}`};}});
    let summary=null,summaryError="";
    if(this.actor?.type==="npc") {try{summary=await merchantSummary(this.actor,{policy:this.#context.economy,allowUnconverted:true});}catch(error){summaryError=error.message;}}
    const {economy,policy,catalogue}=this.#context, d=this.#draft;
    const selects=[
      ["catalogueId","Catalogue",catalogueRegistry.list()],
      ["settlement","Settlement",economy.settlements],["prosperity","Prosperity",economy.prosperities],
      ["profile","Economic profile",economy.profiles],
      ["stockProfileId","Stock profile",[{id:"",name:"Automatic for settlement"},...stockProfiles(catalogue).filter(r=>r.shop===d.catalogueId)]],
      ["availability","Availability",policy.availability.map(id=>({id,name:id.charAt(0).toUpperCase()+id.slice(1)}))],
      ["restockProfile","Restock preference",policy.restockProfiles],
      ["relationshipState","New customer relationship",policy.relationshipStates.map(id=>({id,name:id}))]
    ].map(([key,label,rows])=>({key,label,choices:choices(rows,d[key])}));
    return {...await super._prepareContext(options),actorName:this.actor?.name??"Choose an NPC",draft:d,selects:selects.filter(row=>["catalogueId","settlement","prosperity","availability"].includes(row.key)),
      advancedSelects:selects.filter(row=>!["catalogueId","settlement","prosperity","availability"].includes(row.key)), cashLabel:formatCopper(walletValue(this.actor?.system.currency)),
      tabs:Object.fromEntries(["setup","stock","cash","manage"].map(id=>[id,id===this.#tab])),
      npcs:game.actors.filter(a=>a.type==="npc").map(a=>({id:a.id,name:a.name,selected:a.id===this.#actorId})),
      templates:this.#templates.map(r=>({...r,selected:r.key===this.#templateId})),summary,summaryError,
      busy:this.#busy,message:this.#message,stock:this.#stock?{...this.#stock,items:this.#stock.items.map(i=>({...i,priceLabel:formatCopper(i.price.value*({cp:1,sp:10,ep:50,gp:100,pp:1000}[i.price.denomination]))})),
        added:this.#stock.items.filter(i=>!i.skip).length,valueLabel:formatCopper(this.#stock.items.filter(i=>!i.skip).reduce((n,i)=>n+i.quantity*i.price.value*({cp:1,sp:10,ep:50,gp:100,pp:1000}[i.price.denomination]),0))}:null,
      float:this.#float?{label:this.#float.status==="generated"?formatCopper(this.#float.amountCp):this.#float.status.replaceAll("-"," "),
        generated:this.#float.status==="generated",replacement:this.#float.replacement,amount:this.#float.amountCp/100}:null,
      generationBlocked:this.#busy||!merchantConfig(this.actor)||this.#dirty(),
      stockBlocked:this.#busy||!this.#stock||this.#dirty(),floatBlocked:this.#busy||this.#float?.status!=="generated"||this.#dirty()};
  }
  _onRender(context,options) {
    super._onRender?.(context,options);
    this.element.querySelector("[name=builderNpc]")?.addEventListener("change",async event=>{
      const id=event.target.value;
      if((this.#dirty()||this.#stock||this.#float)&&!await this.#confirm("Switch NPC?","Discard this panel's unsaved settings and previews?")){event.target.value=this.#actorId;return;}
      this.#actorId=id;this.#templateId="";this.#loadActor();await this.render();
    });
    for(const input of this.element.querySelectorAll("[data-config]")) input.addEventListener("input",event=>{
      const el=event.target, key=el.name;
      this.#draft[key]=el.type==="checkbox"?el.checked:el.type==="number"?Number(el.value):el.value;
      if(key!=="notes") {this.#stock=null;this.#float=null;}
      if(key==="catalogueId") {this.#draft.stockProfileId="";void this.render();}
      else this.#paintEstimate();
    });
    this.#stockPending=false;
    for (const input of this.element.querySelectorAll("[data-stock-id]")) input.addEventListener("input",()=>{
      this.#stockPending=true;
      const button=this.element.querySelector("[data-action=applyStock]");if(button)button.disabled=true;
    });
    this.#floatPending=false;
    for (const selector of ["[name=floatValue]", "[name=floatDenomination]"]) this.element.querySelector(selector)?.addEventListener?.("input", () => {
      this.#floatPending=true;
      for (const action of ["applyStock", "applyFloat"]) {const button=this.element.querySelector(`[data-action=${action}]`);if(button)button.disabled=true;}
    });
    this.#showTab();
    this.#paintEstimate();
  }
  #paintEstimate() {
    const set=(key,value)=>{const node=this.element.querySelector(`[data-estimate="${key}"]`);if(node)node.textContent=value;};
    set("dirty",this.#dirty()?"Unsaved changes — save before generation.":"Settings saved. Generation previews do not change the world.");
    for(const key of ["settlement","prosperity","availability"]) set(key,this.#draft[key]);
    set("catalogue",catalogueRegistry.get(this.#draft.catalogueId)?.name??"Unavailable");
    try {
      validateConfiguration(this.#draft,this.#context);
      const e=estimateGeneration(this.#draft,this.#context,this.actor);
      set("size",`${e.count.toFixed(1)} distinct goods / ${e.units.toFixed(1)} sale units (expected additions)`);
      set("value",formatCopper(e.value));set("cash",`${formatCopper(e.minCash)}–${formatCopper(e.maxCash)}${this.#draft.infiniteFunds?" (infinite funds)":" (new eligible merchant)"}`);
      set("rare",`${e.rareProbability.toFixed(1)}% per assortment; ${e.rarePerDraw}% per rotating draw`);
      set("distribution",e.categories.filter(r=>r.count>0).map(r=>`${r.name}: ${r.count.toFixed(1)}`).join(" · ")||"No missing catalogue goods");
      set("coverage",e.profile.coverage==="partial"?"Partial catalogue: only currently authored shared goods can be generated.":"Estimates use current source prices and weighted stock rules; actual rolls vary.");
    }catch(error){set("coverage",error.message);for(const key of ["size","value","cash","rare","distribution"])set(key,"Unavailable");}
    for(const action of ["generateStock","generateFloat"]) {const button=this.element.querySelector(`[data-action=${action}]`);if(button)button.disabled=this.#busy||!merchantConfig(this.actor)||this.#dirty();}
    for(const [action,disabled] of [["applyStock",!this.#stock],["applyFloat",this.#float?.status!=="generated"]]) {const button=this.element.querySelector(`[data-action=${action}]`);if(button)button.disabled=this.#busy||this.#dirty()||disabled;}
    for(const [name,preview] of [["stock",this.#stock],["float",this.#float]]) {const node=this.element.querySelector(`[data-preview=${name}]`);if(node)node.hidden=!preview;}
  }
  async #confirm(title,text) {return foundry.applications.api.DialogV2.confirm({window:{title},content:`<p>${text}</p>`,modal:true,rejectClose:false});}
  async #run(operation) {
    this.#requireGM();if(this.#busy)return;this.#busy=true;
    for (const el of this.element?.querySelectorAll?.(".dt-merchant-builder input, .dt-merchant-builder select, .dt-merchant-builder textarea, .dt-merchant-builder button") ?? []) el.disabled=true;
    try{await operation();}catch(error){this.#message=error.message;ui.notifications.error(error.message);}
    finally{this.#busy=false;if(!this.#closed)await this.render();}
  }
  static async #services(){await this.#run(async()=>{this.#requireSaved();const {MerchantServicesApplication}=await import("../../services/manager-app.js");await new MerchantServicesApplication(this.actor).render({force:true});});}
  static async #save(){await this.#run(async()=>{const preserve=Object.keys(this.#draft).every(key=>key==="notes"||this.#draft[key]===this.#saved[key]);this.#snapshot=await saveConfiguration(this.actor,this.#draft,this.#context,this.#snapshot);this.#saved=structuredClone(this.#draft);if(preserve){if(this.#stock)this.#stock.builderSnapshot=this.#snapshot;}else{this.#stock=null;this.#float=null;}this.#message="Merchant configured. Existing NPC data, inventory and cash preserved.";});}
  static async #generateStock(){await this.#run(async()=>{this.#requireSaved();this.#stock=await planBuilderStock(this.actor,this.#draft,this.#context,{float:this.#float});this.#float=this.#stock.float;this.#message="Review the assortment and cash below. Nothing has been applied.";});}
  static async #generateFloat(){await this.#run(async()=>{
    this.#requireSaved();
    if (this.#draft.infiniteFunds) throw Error("Infinite Funds is enabled. Save with Infinite Funds disabled to generate a native cash float.");
    this.#float=await previewInitialFloat(this.actor,{policy:this.#context.economy,replace:true});
    if(this.#stock)this.#stock.float=this.#float;
    this.#message="Cash preview ready. Review or override the amount, then Apply Float to replace the native wallet. Stock is unchanged.";
  });}
  static async #editFloat(){const value=this.element.querySelector("[name=floatValue]")?.value,denom=this.element.querySelector("[name=floatDenomination]")?.value;await this.#run(async()=>{this.#requireSaved();this.#float=editFloat(this.#float,value,denom,this.#context);if(this.#stock)this.#stock.float=this.#float;this.#message="Preview amount edited. Confirm before applying.";});}
  static async #generateNotes(){await this.#run(async()=>{if(this.#draft.notes&&!await this.#confirm("Regenerate notes?","Replace the current draft notes with editable template or catalogue merchant notes?"))return;
    this.#draft.notes=generateNotes(this.#draft,this.#context,this.#templates.find(r=>r.key===this.#templateId));this.#message="Notes regenerated in the draft. Save to apply them.";});}
  static async #editStock() {
    const edits=[...this.element.querySelectorAll("[data-stock-id]")].filter(el=>!el.disabled).map(el=>({id:el.dataset.stockId,quantity:el.value===""?NaN:Number(el.value)}));
    await this.#run(async()=>{this.#requireSaved();this.#stock=editStockQuantities(this.#stock,edits,this.#context.policy.limits.maxQuantity);this.#message="Stock preview quantities updated. Zero quantities were omitted. No inventory changed.";});
  }
  static async #applyStock(){await this.#run(async()=>{if(this.#stockPending)throw Error("Update Stock Preview before applying edited quantities.");if(this.#floatPending)throw Error("Update Float Preview to commit your edited amount before applying.");this.#requireSaved();if(!this.#stock)throw Error("Generate stock first.");
    if(!await this.#confirm("Apply stock preview?",`Add missing goods and apply the displayed float if eligible? Existing goods are preserved.${this.#float?.replacement?" This also REPLACES the merchant's current cash with the displayed float.":""}`))return;
    const result=await applyBuilderStock(this.actor,this.#stock);this.#snapshot=configurationSnapshot(this.actor);this.#stock=null;if(result.created)this.#float=null;this.#message=`Added ${result.created} goods; skipped ${result.skipped}. Cash is only applied when new goods were added. Use Apply Float separately if needed.`;});}
  static async #applyFloat(){await this.#run(async()=>{if(this.#floatPending)throw Error("Update Float Preview to commit your edited amount before applying.");this.#requireSaved();if(!this.#float)throw Error("Generate float first.");
    if(!await this.#confirm("Apply displayed cash?",`${this.#float.replacement?"REPLACE the current native wallet":"Initialize the native wallet"} with ${formatCopper(this.#float.amountCp)}? Stock will not change.`))return;
    await applyBuilderFloat(this.actor,this.#float);this.#snapshot=configurationSnapshot(this.actor);this.#float=null;if(this.#stock){this.#stock.float=await previewInitialFloat(this.actor,{policy:this.#context.economy});this.#stock.builderSnapshot=this.#snapshot;}
    this.#message="Cash applied. Stock preview preserved.";});}
  static async #empty(){await this.#run(async()=>{if(this.#dirty())throw Error("Save or reload unsaved settings first.");const result=await emptyMerchantStock(this.actor);this.#snapshot=configurationSnapshot(this.actor);this.#stock=null;this.#float=null;this.#message=`Removed ${result.removed} physical inventory entries.`;});}
  static async #applyTemplate(){const key=this.element.querySelector("[name=builderTemplate]")?.value;await this.#run(async()=>{const row=this.#templates.find(r=>r.key===key);if(!row||row.unavailable)throw Error("Select an available template.");
    if(this.#dirty()&&!await this.#confirm("Apply template?","Replace unsaved configuration with this template? Actor data is not changed until Save."))return;
    this.#draft=validateConfiguration(row.settings,this.#context);this.#templateId=key;this.#stock=null;this.#float=null;this.#message="Template applied to draft. Every setting remains editable.";});}
  static async #saveTemplate(){const name=this.element.querySelector("[name=templateName]")?.value;await this.#run(async()=>{const row=await saveTemplate(name,this.#draft,this.#context);this.#templateId=`world:${row.id}`;this.#message="Custom template saved for this world. Inventory, wallets and relationships were excluded.";});}
  static async #reload(){await this.#run(async()=>{if((this.#dirty()||this.#stock||this.#float)&&!await this.#confirm("Reload NPC?","Discard unsaved settings and generation previews?"))return;this.#loadActor();this.#message="Current merchant data loaded.";});}
  #showTab() {
    for (const panel of this.element.querySelectorAll("[data-builder-panel]")) panel.hidden=panel.dataset.builderPanel!==this.#tab;
    for (const button of this.element.querySelectorAll("[data-builder-tab]")) button.setAttribute("aria-selected",String(button.dataset.builderTab===this.#tab));
  }
  static #selectTab(_event,target) {
    if (!["setup","stock","cash","manage"].includes(target.dataset.builderTab)) return;
    this.#tab=target.dataset.builderTab;this.#showTab();
  }
  static #stepTab(_event,target) {
    const tabs=["setup","stock","cash","manage"],index=tabs.indexOf(this.#tab);
    this.#tab=tabs[Math.max(0,Math.min(tabs.length-1,index+Number(target.dataset.step)))];this.#showTab();
  }
  static async #resetMerchant() {await this.#run(async()=>{
    const done=await resetMerchant(this.actor,{confirm:({receipts,relationships})=>this.#confirm("Permanently reset this merchant?",
      `Remove shop configuration, ${relationships} relationships, merchant notes, offer settings and ${receipts} history receipts? All retained merchant history will be permanently deleted. This NPC will no longer be a shop. Biography, portrait, ownership, inventory and cash will remain. This cannot be undone.`)});
    if(done){this.#templateId="";this.#loadActor();this.#tab="setup";this.#message="NPC reset. Shop configuration and history cleared; ordinary NPC data, inventory and cash preserved.";}
  });}
  static async #advanced(){this.#requireGM();const {MerchantManagerApplication}=await import("../manager-app.js");await new MerchantManagerApplication({actorId:this.#actorId}).render({force:true});}
}
