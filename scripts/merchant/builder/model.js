import { MODULE_ID } from "../../constants.js";
import { readModuleJson } from "../../data/catalogue-loader.js";
import { catalogueRegistry } from "../../catalogues/registry.js";
import { resolveEconomy } from "../economy.js";
import { percent } from "../pricing.js";
import { stable } from "../trade-model.js";
import { stockProfiles } from "../../data/stock-catalogue.js";

/** Only these portable configuration fields can be saved as a template. */
export const CONFIG_KEYS = Object.freeze(["catalogueId", "settlement", "prosperity", "profile", "stockProfileId", "availability",
  "infiniteFunds", "infiniteStock", "restockProfile", "pricingModifier", "relationshipState", "relationshipModifier", "notes"]);
export async function loadBuilderPolicy({ readJson = readModuleJson } = {}) {
  const data = await readJson("data/merchant-builder.json");
  if (data?.schemaVersion !== 1) throw Error("Unsupported Merchant Builder policy.");
  for (const key of ["availability", "relationshipStates"]) if (!Array.isArray(data[key]) || !data[key].length ||
    data[key].some(x => typeof x !== "string" || !x.trim()) || new Set(data[key]).size !== data[key].length) throw Error(`Invalid builder ${key}.`);
  if (!Array.isArray(data.restockProfiles) || !data.restockProfiles.length || new Set(data.restockProfiles.map(r => r.id)).size !== data.restockProfiles.length ||
    data.restockProfiles.some(r => !/^[a-z0-9-]+$/.test(r.id) || typeof r.name !== "string" || !(r.intervalDays === null || Number.isInteger(r.intervalDays) && r.intervalDays > 0))) throw Error("Invalid restock profiles.");
  for (const [key,max] of [["maxDraws",50],["maxQuantity",100],["maxCashCp",100000000],["maxTemplates",1000]]) {
    if (!Number.isInteger(data.limits?.[key]) || data.limits[key] < 1 || data.limits[key] > max) throw Error(`Invalid builder limit ${key}.`);
  }
  return data;
}
export function readConfiguration(actor, { economy, policy, registry = catalogueRegistry }) {
  const config = actor?.getFlag(MODULE_ID, "merchant") ?? {};
  return { ...policy.defaults, ...resolveEconomy(economy, config.economy),
    catalogueId: config.catalogueId ?? registry.resolve(actor ?? {})?.id ?? "", stockProfileId: config.builder?.stockProfileId ?? "",
    availability: config.availability ?? policy.defaults.availability,
    infiniteFunds: config.settings?.walletMode === "infinite", infiniteStock: config.settings?.infiniteStock === true,
    pricingModifier: config.settings?.merchantModifier ?? Math.round(((config.settings?.sellModifier ?? 1) - 1) * 10000) / 100,
    restockProfile: config.restock?.profileId ?? policy.defaults.restockProfile,
    relationshipState: config.relationshipDefaults?.state ?? policy.defaults.relationshipState,
    relationshipModifier: config.relationshipDefaults?.pricingModifier ?? policy.defaults.relationshipModifier,
    notes: typeof config.notes === "string" ? config.notes : "" };
}
export function validateConfiguration(input, { economy, policy, catalogue, registry = catalogueRegistry }) {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !CONFIG_KEYS.includes(key))) throw Error("Unknown Merchant Builder configuration field.");
  const result = Object.fromEntries(CONFIG_KEYS.map(key => [key, input[key]]));
  if (!registry.get(result.catalogueId)) throw Error("Select an available catalogue.");
  resolveEconomy(economy, result);
  if (!policy.availability.includes(result.availability) || !policy.relationshipStates.includes(result.relationshipState) ||
      !policy.restockProfiles.some(row => row.id === result.restockProfile)) throw Error("Unknown merchant availability, relationship or restock profile.");
  for (const key of ["infiniteFunds", "infiniteStock"]) if (typeof result[key] !== "boolean") throw Error(`Invalid ${key}.`);
  for (const key of ["pricingModifier", "relationshipModifier"]) percent(result[key]);
  if (typeof result.notes !== "string" || result.notes.length > 10000) throw Error("Merchant notes must be text of at most 10,000 characters.");
  if (typeof result.stockProfileId !== "string" || (result.stockProfileId && !stockProfiles(catalogue).some(p => p.id === result.stockProfileId && p.shop === result.catalogueId))) throw Error("Stock profile does not belong to the selected catalogue.");
  return result;
}
export function chooseStockProfile(draft, { catalogue, economy }) {
  const choices = stockProfiles(catalogue).filter(row => row.shop === draft.catalogueId);
  return choices.find(row => row.id === draft.stockProfileId) ??
    choices.find(row => economy.stockProfiles?.[row.id]?.settlement === draft.settlement && economy.stockProfiles?.[row.id]?.profile === draft.profile) ??
    choices.find(row => !row.isVariant) ?? null;
}
/** Full private state fingerprint prevents a stale panel from overwriting another GM's edits. */
export const configurationSnapshot = actor => stable(actor?.getFlag(MODULE_ID, "merchant") ?? null);
