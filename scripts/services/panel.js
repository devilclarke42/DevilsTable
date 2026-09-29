import { coinValue } from "../merchant/model.js";
import { MODULE_ID } from "../constants.js";
import { catalogueRegistry } from "../catalogues/registry.js";
import { stable } from "../merchant/trade-model.js";
import { definitions, worldServices, eligibleService } from "./offers.js";
import { saveServiceOffers, generatedServiceOffers, saveWorldServices } from "./administration.js";
import { formatCopper } from "../merchant/currency.js";

/** Shared form state for the Builder and legacy standalone window. Never stores inventory. */
export class ServicePanel {
  constructor(actor) { this.actor=actor; this.reset(); }
  reset() { this.draft=new Map(); this.filters={query:"",category:"",status:""}; this.selected=new Set(); this.raw=null; this.expected=stable(this.actor?.getFlag(MODULE_ID,"merchant.services")??{}); }
  get dirty() { return this.draft.size>0 || this.raw!==null; }
  context(busy=false) {
    const registry=definitions(), offers=this.actor.getFlag(MODULE_ID,"merchant.services")??{}, stats=this.actor.getFlag(MODULE_ID,"merchant.serviceStats")??{};
    const total=Object.values(stats).reduce((n,s)=>n+(s.purchased??0),0), cat=catalogueRegistry.resolve(this.actor)?.id;
    const services=registry.list().filter(r=>r.catalogues.includes(cat)||offers[r.id]).map(r=>{
      const form=this.draft.get(r.id)??{offered:Boolean(offers[r.id]),enabled:offers[r.id]?.enabled!==false,available:offers[r.id]?.available!==false,price:offers[r.id]?.price??r.price};
      const category=registry.categories().find(c=>c.id===r.category);
      return {...r,...form,categoryName:category?.name??r.category,
        search:[r.name,r.description,...r.tags,category?.name??r.category].join(" ").toLocaleLowerCase(),
        rangeLabel:r.recommendedRange?`${formatCopper(coinValue(r.recommendedRange.min))}–${formatCopper(coinValue(r.recommendedRange.max))}`:"Not specified",
        eligible:eligibleService(r,this.actor),denominations:["cp","sp","ep","gp","pp"].map(id=>({id,selected:id===form.price.denomination})),
        purchased:stats[r.id]?.purchased??0,revenue:formatCopper(stats[r.id]?.revenue??0),last:stats[r.id]?.lastPurchased??"Never",
        popularity:total?`${(100*(stats[r.id]?.purchased??0)/total).toFixed(1)}%`:"0%"};
    });
    const categories=registry.categories().filter(c=>c.catalogues.includes(cat)||services.some(r=>r.category===c.id));
    return {name:this.actor.name,busy,categories:categories.map(c=>({...c,checked:this.selected.has(c.id)})),
      groups:categories.map(c=>({...c,services:services.filter(r=>r.category===c.id)})).filter(c=>c.services.length),
      definitions:this.raw??JSON.stringify(worldServices(),null,2)};
  }
  bind(root) {
    if(!root?.querySelectorAll)return;
    const read=el=>({offered:el.querySelector('[name=offered]').checked,enabled:el.querySelector('[name=enabled]').checked,
      available:el.querySelector('[name=available]').checked,price:{value:el.querySelector('[name=price]').value,denomination:el.querySelector('[name=denomination]').value}});
    const filter=()=>{
      for(const row of root.querySelectorAll('[data-service-row]')) {
        const state=read(row), status=this.filters.status;
        row.hidden=!(row.dataset.search??'').includes(this.filters.query.toLocaleLowerCase()) || Boolean(this.filters.category&&row.dataset.category!==this.filters.category)
          || (status==='offered'&&!state.offered)||(status==='enabled'&&(!state.offered||!state.enabled))
          || (status==='disabled'&&(!state.offered||state.enabled))||(status==='unavailable'&&state.available&&row.dataset.eligible==='true');
      }
      for(const group of root.querySelectorAll('[data-service-group]'))group.hidden=![...group.querySelectorAll('[data-service-row]')].some(row=>!row.hidden);
    };
    for(const row of root.querySelectorAll('[data-service-row]'))row.addEventListener('input',()=>{this.draft.set(row.dataset.serviceRow,read(row));filter();});
    for(const input of root.querySelectorAll('[data-service-filter]')) {input.value=this.filters[input.dataset.serviceFilter];input.addEventListener('input',()=>{this.filters[input.dataset.serviceFilter]=input.value;filter();});}
    for(const input of root.querySelectorAll('[name=serviceCategory]'))input.addEventListener('change',()=>{if(input.checked)this.selected.add(input.value);else this.selected.delete(input.value);});
    root.querySelector('[name=serviceDefinitions]')?.addEventListener?.('input',event=>{this.raw=event.target.value;});
    filter();
  }
  async save() {
    const rows=this.context().groups.flatMap(g=>g.services).filter(r=>r.offered).map(r=>({id:r.id,enabled:r.enabled,available:r.available,
      price:{value:String(r.price.value).trim()?Number(r.price.value):NaN,denomination:r.price.denomination}}));
    await saveServiceOffers(this.actor,rows,{expected:this.expected});this.reset();
  }
  async generate() {
    const categories=[...this.selected], rows=generatedServiceOffers(this.actor,categories);
    if(await foundry.applications.api.DialogV2.confirm({window:{title:"Generate service offers?"},content:`<p>Offer ${rows.length} services in total? Existing saved overrides remain. Unsaved service edits will be discarded.</p>`,rejectClose:false,modal:true})) {
      await saveServiceOffers(this.actor,generatedServiceOffers(this.actor,categories),{expected:this.expected});this.reset();
    }
  }
  async saveDefinitions() {
    const bundle=JSON.parse(this.raw??JSON.stringify(worldServices()));
    if(await foundry.applications.api.DialogV2.confirm({window:{title:"Save shared service definitions?"},content:"<p>Update definitions for every merchant? Execution UUIDs may run GM macros or apply effects after payment. Review them before saving. Historical receipts remain.</p>",rejectClose:false,modal:true})) {
      await saveWorldServices(bundle);this.raw=null;
    }
  }
}
