import { MODULE_ID } from "../constants.js";
import { catalogueRegistry } from "../catalogues/registry.js";
import { coinValue } from "../merchant/model.js";
import { serviceRegistry, ServiceRegistry } from "./registry.js";
/** World-authored JSON extends module/provider definitions; it never enters the Item compendium. */
export function worldServices(){return globalThis.game?.settings?.get(MODULE_ID,"serviceDefinitions")??{categories:[],services:[]};}
export function definitions(){
  const registry=new ServiceRegistry();
  registry.register({categories:serviceRegistry.categories(),services:serviceRegistry.list()});
  registry.register(worldServices());return registry;
}
export function eligibleService(row,actor){
  const catalogue=catalogueRegistry.resolve(actor)?.id;
  if(!row.catalogues.includes(catalogue))return false;
  const economy=actor.getFlag(MODULE_ID,"merchant.economy")??{};
  return Object.entries(row.availability??{}).every(([key,values])=>!values.length||values.includes(economy[{settlements:"settlement",prosperities:"prosperity",profiles:"profile"}[key]]));
}
export function serviceOffers(actor,character=null,{includeUnavailable=false}={}){
  const offerings=actor.getFlag(MODULE_ID,"merchant.services")??{};
  if(!Object.keys(offerings).length)return [];
  const registry=definitions();
  return Object.entries(offerings).flatMap(([id,offer])=>{
    const row=registry.get(id);
    if(!row||!eligibleService(row,actor)||offer.enabled===false)return [];
    const r=row.requirements??{};
    const allowed=(!r.actorTypes?.length||r.actorTypes.includes(character?.type))&&(!(r.minLevel>0)||Number(character?.system?.details?.level)>=r.minLevel);
    if(!allowed&&!includeUnavailable)return [];
    const copper=offer.price===undefined?coinValue(row.price):coinValue(offer.price);
    if(copper===null)throw Error(`Invalid service price: ${row.name}.`);
    return [{id:`service:${id}`,serviceId:id,kind:"service",isService:true,name:row.name,img:row.icon,
      description:row.description,category:row.category,categoryName:registry.categories().find(c=>c.id===row.category)?.name,
      catalogues:row.catalogues,tags:row.tags,quantity:allowed?row.maxQuantity:0,unlimited:true,
      saleUnit:"service",copper,serviceModifier:row.modifier??0,
      availability:allowed?"Available":"Requirements not met",requirements:r.note??"",
      execution:structuredClone(row.execution??{})}];
  });
}
