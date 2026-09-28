import { scaledQuantity } from "../../stock/stock-quantities.js";
import { stockGroups } from "../../data/stock-catalogue.js";
import { rollStockList } from "../../stock/stock-roller.js";
import { priceBand } from "../../validation/item-rules.js";
import { coinValue } from "../model.js";
import { floatAmount } from "../economy.js";
import { chooseStockProfile } from "./model.js";
import { MODULE_ID } from "../../constants.js";

export function generationSettings(draft, context) {
  const { economy, catalogue, policy } = context, profile = chooseStockProfile(draft, context);
  if (!profile) throw Error("This catalogue has no stock-generation profile yet. Its existing inventory can still be managed.");
  const settlement = economy.settlements.find(r => r.id === draft.settlement), prosperity = economy.prosperities.find(r => r.id === draft.prosperity);
  const product = key => (settlement[key] ?? 100) * (prosperity[key] ?? 100) / 10000;
  return { profile, draws: Math.max(0, Math.min(policy.limits.maxDraws, Math.round(profile.draws * product("drawPercent")))),
    quantityPercent: product("quantityPercent") * 100, maxQuantity: policy.limits.maxQuantity,
    tierChances: { often: catalogue.stock.oftenChance, rarely: Math.max(0, Math.min(100 - catalogue.stock.oftenChance, Math.round(catalogue.stock.rarelyChance * product("rarePercent")))) } };
}
/** E[min(Binomial(draws,p), pool size)]; uniform sampling without replacement inside a tier. */
function expectedSelected(draws, chance, count) {
  if (!count) return 0;
  let distribution = [1];
  for (let n=0;n<draws;n++) { const next=Array(Math.min(n+1,count)+1).fill(0); for(let k=0;k<distribution.length;k++) {
    next[k] += distribution[k]*(1-chance); next[Math.min(count,k+1)] += distribution[k]*chance;
  } distribution=next; }
  return distribution.reduce((sum,p,k)=>sum+p*k,0);
}
export function estimateGeneration(draft, context, actor = null) {
  const options = generationSettings(draft, context), { catalogue, economy } = context;
  const groups = stockGroups(catalogue, options.profile), existing = new Set([...(actor?.items ?? [])].map(i => i.getFlag(MODULE_ID,"sourceId")).filter(Boolean));
  const categories = new Map(); let count=0, units=0, value=0;
  for(const [tier,items] of Object.entries(groups)) {
    const probability = tier === "always" ? 1 : expectedSelected(options.draws, options.tierChances[tier]/100, items.length)/(items.length || 1);
    for(const item of items) {
      if(existing.has(item.id)) continue;
      const rule=catalogue.quantities.rules.find(r=>r.tier===tier && r.priceBand===priceBand(item.price));
      const quantityProfile=catalogue.quantities.profiles.find(r=>r.id===rule?.profile);
      if(!quantityProfile) throw Error(`Missing stock quantity policy for ${item.id}.`);
      const quantity=quantityProfile.results.reduce((n,r)=>n+scaledQuantity(r.quantity,tier,options)*r.weight/100,0);
      count+=probability;units+=probability*quantity;value+=probability*quantity*coinValue(item.price);
      categories.set(item.category,(categories.get(item.category)??0)+probability);
    }
  }
  const settlement=economy.settlements.find(r=>r.id===draft.settlement);
  return { profile: options.profile, count, units, value: Math.round(value), draws:options.draws,
    rarePerDraw: groups.rarely.length ? options.tierChances.rarely : 0,
    rareProbability: groups.rarely.length ? (1-(1-options.tierChances.rarely/100)**options.draws)*100 : 0,
    categories:[...categories].map(([id,count])=>({id,count,name:catalogue.categoryDefinitions.find(r=>r.id===id && (r.catalogue??r.shop)===draft.catalogueId)?.name??id})),
    minCash: draft.infiniteFunds ? 0 : floatAmount(economy,draft,1),
    maxCash: draft.infiniteFunds ? 0 : floatAmount(economy,draft,settlement.maxCp-settlement.minCp+1) };
}
export async function generateStock(draft, context, { roll = rollStockList } = {}) {
  const options=generationSettings(draft,context);
  return roll({shopId:draft.catalogueId, profileId:options.profile.id, draws:options.draws,
    tierChances:options.tierChances, quantityScale:options, load:async()=>context.catalogue});
}
export function generateNotes(draft, context, template = null) {
  if(template?.settings.catalogueId===draft.catalogueId) return template.settings.notes;
  const shop=context.catalogue.shopDefinitions.find(r=>r.id===draft.catalogueId);
  const notes=shop?.merchantNotes ?? {};
  return [["Always stocks",notes.alwaysStocks],["Often stocks",notes.oftenStocks],["Rarely stocks",notes.rarelyStocks]]
    .filter(([,rows])=>Array.isArray(rows)&&rows.length).map(([label,rows])=>`${label}:\n${rows.map(x=>`- ${x}`).join("\n")}`).join("\n\n") || shop?.description || "";
}
