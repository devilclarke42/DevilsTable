import { MODULE_ID } from "../constants.js";

export function percent(value = 0) {
  if (!Number.isFinite(value) || value < -100 || value > 500 || Math.abs(value * 100 - Math.round(value * 100)) > 1e-7) {
    throw Error("Modifiers must be percentages from -100 to +500 with at most two decimal places.");
  }
  return value;
}
export function pricingTerms(merchant, character, override = {}) {
  const settings = merchant.getFlag(MODULE_ID, "merchant")?.settings ?? {};
  const memory = character ? merchant.getFlag(MODULE_ID, `merchant.relationships.${character.id}`) ?? merchant.getFlag(MODULE_ID, "merchant.relationshipDefaults") ?? {} : {};
  const result = { merchant: settings.merchantModifier ?? Math.round(((settings.sellModifier ?? 1) - 1) * 10000) / 100,
    character: memory.pricingModifier ?? 0, negotiation: memory.negotiationModifier ?? 0,
    review: 0, stacking: settings.stacking ?? "additive", ...override };
  for (const key of ["merchant", "character", "negotiation", "review"]) percent(result[key]);
  if (!["additive", "compound"].includes(result.stacking)) throw Error("Unknown modifier stacking rule.");
  return result;
}
export function combinedPercent(values, stacking = "additive") {
  values.forEach(percent);
  const factor = stacking === "compound" ? values.reduce((n, value) => n * (1 + value / 100), 1)
    : Math.max(0, 1 + values.reduce((sum, value) => sum + value, 0) / 100);
  if (!Number.isFinite(factor) || factor > 100) throw Error("Combined markup exceeds the supported limit.");
  return Math.round((factor - 1) * 1000000) / 10000;
}
export function priced(value, modifier) {
  const result = Math.round(value * (1 + modifier / 100));
  if (!Number.isSafeInteger(result) || result < 0) throw Error("Adjusted price is invalid.");
  return result;
}
export const percentLabel = value => `${value > 0 ? "+" : ""}${Number(value.toFixed(2))}%`;
