import { MODULE_ID } from "../constants.js";
import { stockItems } from "./inventory.js";
import { validateVisibility } from "./visibility.js";
import { stable } from "./trade-model.js";
import { withAdministration } from "./operation-guard.js";
export const stockVisibilitySnapshot = actor => stable(stockItems(actor).map(i=>({id:i.id,offer:i.getFlag(MODULE_ID,"offer")??{}})));
export function stockVisibilityRows(actor) {
  return stockItems(actor).map(item=>{
    const policy=item.getFlag(MODULE_ID,"offer")?.visibility??{mode:"public"};
    return {id:item.id,name:item.name,minPurchases:policy.minPurchases??3,revealed:policy.revealed===true,
      modes:["public","hidden","relationship"].map(id=>({id,selected:id===policy.mode}))};
  });
}
export async function saveStockVisibility(actor, rows, expected) {
  return withAdministration(actor,async()=>{
    if(stockVisibilitySnapshot(actor)!==expected)throw Error("Stock offer settings changed. Reload before saving visibility.");
    const items=new Map(stockItems(actor).map(i=>[i.id,i]));
    if(!Array.isArray(rows)||new Set(rows.map(r=>r.id)).size!==rows.length||rows.some(r=>!items.has(r.id)))throw Error("Invalid stock visibility selection.");
    const updates=rows.map(row=>({_id:row.id,[`flags.${MODULE_ID}.offer.visibility`]:validateVisibility(row.visibility)}));
    await actor.updateEmbeddedDocuments("Item",updates);
    if(rows.some(row=>stable(items.get(row.id).getFlag(MODULE_ID,"offer")?.visibility)!==stable(validateVisibility(row.visibility))))throw Error("Stock visibility read-back failed. Reload before retrying.");
  });
}
