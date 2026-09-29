import { validateRoom } from "../integrations/room.js";
import { stable } from "../merchant/trade-model.js";
import { MODULE_ID } from "../constants.js";
import { withAdministration, merchantSlots, activeActorWrites, administrationBusy } from "../merchant/operation-guard.js";
import { definitions, eligibleService } from "./offers.js";
import { serviceRegistry, ServiceRegistry } from "./registry.js";
import { coinValue } from "../merchant/model.js";
/** All service offer writes share the existing checkout/administration guard. */
export async function saveServiceOffers(actor,rows,{expected}={}){
  return withAdministration(actor,async()=>{
    if(expected!==undefined&&stable(actor.getFlag(MODULE_ID,"merchant.services")??{})!==expected)throw Error("Service offerings changed. Reload before saving.");
    const registry=definitions(), next={};
    for(const row of rows){
      if(!registry.get(row.id)||Object.hasOwn(next,row.id)||typeof row.enabled!=="boolean"||
        (row.available!==undefined&&typeof row.available!=="boolean") || (row.price!==undefined&&coinValue(row.price)===null))throw Error("Invalid service offer settings.");
      if(row.room!==undefined&&!registry.get(row.id).accommodation)throw Error("Room settings require an accommodation service.");
      const room=validateRoom(row.room);
      next[row.id]={...(room?{room}:{}),enabled:row.enabled,...(row.available===undefined?{}:{available:row.available}),...(row.price===undefined?{}:{price:row.price})};
    }
    const old=actor.getFlag(MODULE_ID,"merchant.services")??{};
    const update={...structuredClone(next)};
    // Foundry merges flag objects: explicit deletion keys are needed to remove offers.
    for(const id of Object.keys(old))if(!Object.hasOwn(next,id))update[`-=${id}`]=null;
    for(const id of Object.keys(next))if(old[id]?.room&&!next[id].room)update[id]["-=room"]=null;
    for(const id of Object.keys(next))if(old[id]?.available!==undefined&&next[id].available===undefined)update[id]["-=available"]=null;
    for(const id of Object.keys(next))if(old[id]?.price && !next[id].price)update[id]["-=price"]=null;
    await actor.setFlag(MODULE_ID,"merchant.services",update);
    const saved=actor.getFlag(MODULE_ID,"merchant.services");
    if(stable(saved)!==stable(next))throw Error("Service settings read-back failed.");
  });
}
export function generatedServiceOffers(actor,categories){
  const registry=definitions(), known=new Set(registry.categories().map(c=>c.id));
  if(categories.some(id=>!known.has(id)))throw Error("Unknown service category.");
  const current=structuredClone(actor.getFlag(MODULE_ID,"merchant.services")??{});
  for(const row of registry.list())if(categories.includes(row.category)&&eligibleService(row,actor))current[row.id]??={enabled:true};
  return Object.entries(current).map(([id,offer])=>({id,...offer}));
}
export async function saveWorldServices(bundle){
  if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)throw Error("Only the active GM may edit service definitions.");
  if([...game.actors].some(a=>merchantSlots.occupied(a.id)||activeActorWrites.has(a.id)||administrationBusy(a.id)||a.getFlag(MODULE_ID,"transactionPending")))throw Error("Finish active checkouts and recovery before editing shared definitions.");
  const registry=new ServiceRegistry();registry.register({categories:serviceRegistry.categories(),services:serviceRegistry.list()});registry.register(bundle);
  await game.settings.set(MODULE_ID,"serviceDefinitions",structuredClone(bundle));
}

/** Called within the Builder's existing administration lock. Seed once per service identity,
 * preserving explicit removals, disabled offers and overrides across repeated saves.
 * A newly eligible service can be introduced after a prosperity/profile upgrade.
 */
export async function seedDefaultServices(actor,catalogue){
  const categories=catalogue?.metadata?.defaultServiceCategories??[];
  if(!categories.length)return 0;
  const registry=definitions();
  if(!Array.isArray(categories)||categories.some(id=>!registry.categories().some(c=>c.id===id&&c.catalogues.includes(catalogue.id))))throw Error("Invalid catalogue default service categories.");
  const old=actor.getFlag(MODULE_ID,"merchant.services")??{},next=structuredClone(old);
  const seen=[...(actor.getFlag(MODULE_ID,`merchant.builder.serviceDefaults.${catalogue.id}`)??[])];
  let added=0;
  for(const row of registry.list())if(categories.includes(row.category)&&eligibleService(row,actor,{catalogueId:catalogue.id})&&!seen.includes(row.id)){
    if(!Object.hasOwn(next,row.id)){if(row.room!==undefined&&!registry.get(row.id).accommodation)throw Error("Room settings require an accommodation service.");
      const room=validateRoom(row.room);
      next[row.id]={...(room?{room}:{}),enabled:true};added++;}
    seen.push(row.id);
  }
  // Offers precede the marker: a failed marker write can be retried without duplicates.
  if(added){await actor.setFlag(MODULE_ID,"merchant.services",next);if(stable(actor.getFlag(MODULE_ID,"merchant.services"))!==stable(next))throw Error("Default service offers read-back failed. Reload before retrying.");}
  await actor.setFlag(MODULE_ID,`merchant.builder.serviceDefaults.${catalogue.id}`,seen);
  if(stable(actor.getFlag(MODULE_ID,`merchant.builder.serviceDefaults.${catalogue.id}`))!==stable(seen))throw Error("Default service marker read-back failed. Reload before retrying.");
  return added;
}
