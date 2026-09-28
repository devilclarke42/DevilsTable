import { MODULE_ID } from "../../constants.js";
import { withAdministration, assertAdministrator } from "../operation-guard.js";
import { enableMerchant } from "../service.js";
import { validateConfiguration, configurationSnapshot, readConfiguration } from "./model.js";
import { applyInitialFloat, floatCoins, previewInitialFloat } from "../economy.js";
import { walletValue } from "../settlement.js";
import { previewMerchantStock, applyMerchantStock } from "../populate-stock.js";
import { generateStock } from "./generation.js";

export async function saveConfiguration(actor, draft, context, expected) {
  const config=validateConfiguration(draft,context);
  return withAdministration(actor,async()=>{
    if(configurationSnapshot(actor)!==expected) throw Error("Merchant data changed in another window. Reload the NPC before saving.");
    // Conversion only writes module flags, including linked-token entry flags.
    await enableMerchant(actor,config.availability);
    assertAdministrator(actor);
    const old=actor.getFlag(MODULE_ID,"merchant");
    await actor.update({
      [`flags.${MODULE_ID}.merchant.catalogueId`]:config.catalogueId,
      [`flags.${MODULE_ID}.merchant.economy`]:{settlement:config.settlement,prosperity:config.prosperity,profile:config.profile},
      [`flags.${MODULE_ID}.merchant.settings`]:{...old.settings,walletMode:config.infiniteFunds?"infinite":"finite",infiniteStock:config.infiniteStock,merchantModifier:config.pricingModifier},
      [`flags.${MODULE_ID}.merchant.relationshipDefaults`]:{...old.relationshipDefaults,state:config.relationshipState,pricingModifier:config.relationshipModifier},
      [`flags.${MODULE_ID}.merchant.restock`]:{...old.restock,profileId:config.restockProfile},
      [`flags.${MODULE_ID}.merchant.builder`]:{...old.builder,schemaVersion:1,stockProfileId:config.stockProfileId},
      [`flags.${MODULE_ID}.merchant.notes`]:config.notes
    });
    // Read back only fields managed here, leaving all other merchant metadata intact.
    const actual=readConfiguration(actor,context);
    if(Object.keys(config).some(k=>actual[k]!==config[k])) throw Error("Merchant configuration read-back failed. Reload before retrying.");
    return configurationSnapshot(actor);
  },{allowUnconverted:true});
}
export async function planBuilderStock(actor,draft,context,{float=null,roll}={}) {
  const snapshot=configurationSnapshot(actor);
  const preview=await previewMerchantStock(actor,{}, {roll:()=>generateStock(draft,context,{roll}),
    planFloat:()=>float ?? previewInitialFloat(actor,{policy:context.economy})});
  if(snapshot!==configurationSnapshot(actor)) throw Error("Merchant settings changed during generation. Reload before applying.");
  return {...preview,builderSnapshot:snapshot};
}
export async function applyBuilderStock(actor,preview,options={}) {
  if(configurationSnapshot(actor)!==preview.builderSnapshot) throw Error("Merchant data changed after preview. Regenerate stock.");
  return applyMerchantStock(actor,preview,options);
}
export function editFloat(plan,value,denomination,context) {
  const units={pp:1000,gp:100,ep:50,sp:10,cp:1};
  const amount=Math.round(Number(value)*units[denomination]);
  if(plan?.status!=="generated" || !units[denomination] || value==="" || !Number.isFinite(Number(value)) ||
    !Number.isSafeInteger(amount) || Math.abs(Number(value)*units[denomination]-amount)>1e-7 || amount<0 || amount>context.policy.limits.maxCashCp) throw Error("Enter a valid nonnegative native currency amount with whole-coin precision.");
  return {...plan,amountCp:amount,after:floatCoins(amount,context.economy.coinShares)};
}
export async function applyBuilderFloat(actor,plan) {
  if(!plan || plan.status!=="generated" || walletValue(plan.after)!==plan.amountCp) throw Error("Generate an eligible float first.");
  return withAdministration(actor,()=>applyInitialFloat(actor,plan));
}
