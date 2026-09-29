import { coinValue } from "../merchant/model.js";
import { MODULE_ID } from "../constants.js";
import { catalogueRegistry } from "../catalogues/registry.js";
import { definitions, worldServices, eligibleService } from "./offers.js";
import { saveServiceOffers, generatedServiceOffers, saveWorldServices } from "./administration.js";
import { formatCopper } from "../merchant/currency.js";
const { ApplicationV2, HandlebarsApplicationMixin }=foundry.applications.api;
/** Optional service pane opened from Builder. No changes on navigation or preview. */
export class MerchantServicesApplication extends HandlebarsApplicationMixin(ApplicationV2){
  #actor;#busy=false;
  constructor(actor,options={}){super(options);this.#actor=actor;}
  static DEFAULT_OPTIONS={id:"devils-table-services",classes:["devils-table"],tag:"section",position:{width:760,height:680},window:{title:"Merchant Services",resizable:true},actions:{save:MerchantServicesApplication.#save,generate:MerchantServicesApplication.#generate,definitions:MerchantServicesApplication.#definitions}};
  static PARTS={body:{template:"modules/devils-table/templates/merchant-services.hbs"}};
  async _prepareContext(options){
    if(!game.user.isGM)throw Error("Service administration is GM-only.");
    const registry=definitions(),offers=this.#actor.getFlag(MODULE_ID,"merchant.services")??{},stats=this.#actor.getFlag(MODULE_ID,"merchant.serviceStats")??{};
    const total=Object.values(stats).reduce((n,s)=>n+s.purchased,0),cat=catalogueRegistry.resolve(this.#actor)?.id;
    return {...await super._prepareContext(options),name:this.#actor.name,busy:this.#busy,
      categories:registry.categories().filter(c=>c.catalogues.includes(cat)),
      definitions:JSON.stringify(worldServices(),null,2),
      services:registry.list().filter(r=>r.catalogues.includes(cat)||offers[r.id]).map(r=>({
        ...r,rangeLabel:r.recommendedRange?`${formatCopper(coinValue(r.recommendedRange.min))}–${formatCopper(coinValue(r.recommendedRange.max))}`:"Not specified",offered:Boolean(offers[r.id]),enabled:offers[r.id]?.enabled!==false,
        eligible:eligibleService(r,this.#actor),price:offers[r.id]?.price??r.price,
        denominations:["cp","sp","ep","gp","pp"].map(id=>({id,selected:id===(offers[r.id]?.price??r.price).denomination})),
        purchased:stats[r.id]?.purchased??0,revenue:formatCopper(stats[r.id]?.revenue??0),last:stats[r.id]?.lastPurchased??"Never",
        popularity:total?`${(100*(stats[r.id]?.purchased??0)/total).toFixed(1)}%`:"0%"
      }))};
  }
  async #run(action){if(this.#busy)return;this.#busy=true;try{await action();}catch(error){ui.notifications.error(error.message);}finally{this.#busy=false;if(this.rendered)await this.render();}}
  static async #save(){
    const rows=[...this.element.querySelectorAll("[data-service-row]")].filter(el=>el.querySelector("[name=offered]").checked).map(el=>({id:el.dataset.serviceRow,enabled:el.querySelector("[name=enabled]").checked,price:{value:el.querySelector("[name=price]").value.trim()?Number(el.querySelector("[name=price]").value):NaN,denomination:el.querySelector("[name=denomination]").value}}));
    await this.#run(async()=>{await saveServiceOffers(this.#actor,rows);ui.notifications.info("Service offerings saved. Refresh the Shop to see changes.");});
  }
  static async #generate(){
    const categories=[...this.element.querySelectorAll("[name=serviceCategory]:checked")].map(el=>el.value);
    await this.#run(async()=>{
      const rows=generatedServiceOffers(this.#actor,categories);
      const confirmed=await foundry.applications.api.DialogV2.confirm({window:{title:"Generate service offers?"},content:`<p>Offer ${rows.length} services in total, using the saved catalogue and economic profile? Existing overrides are preserved. Unsaved form edits are not applied.</p>`,rejectClose:false,modal:true});
      if(confirmed)await saveServiceOffers(this.#actor,generatedServiceOffers(this.#actor,categories));
    });
  }
  static async #definitions(){const raw=this.element.querySelector("[name=serviceDefinitions]").value;await this.#run(async()=>{
    const bundle=JSON.parse(raw);
    if(await foundry.applications.api.DialogV2.confirm({window:{title:"Save shared service definitions?"},content:"<p>Update world service definitions for every merchant? Execution UUIDs can run GM macros or apply effects after payment. Review them before saving. Removed definitions stop being offered; historical receipts remain.</p>",rejectClose:false,modal:true}))await saveWorldServices(bundle);
  });}
}
