import { MODULE_ID } from "../constants.js";
import { readModuleJson } from "../data/catalogue-loader.js";
import { COINS, walletValue, tradeSettings } from "./settlement.js";
import { stable } from "./trade-model.js";
import { assertAdministrator } from "./operation-guard.js";
import { stockItems } from "./inventory.js";

let policyPromise;
export function validateEconomy(data) {
  const slug = x => typeof x === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
  if (data?.schemaVersion !== 1) throw Error("Unsupported economy policy version.");
  for (const [list, field] of [["settlements", "settlement"], ["prosperities", "prosperity"], ["profiles", "profile"]]) {
    const rows = data[list];
    if (!Array.isArray(rows) || !rows.length || new Set(rows.map(r => r.id)).size !== rows.length) throw Error(`Invalid economy ${list}.`);
    for (const row of rows) {
      if (!slug(row.id) || typeof row.name !== "string" || !row.name.trim()) throw Error(`Invalid economy ${list} label.`);
      if (list === "settlements" ? ![row.minCp, row.maxCp].every(n => Number.isSafeInteger(n) && n >= 0 && n <= 100000000)
          || row.maxCp < row.minCp : !Number.isSafeInteger(row.percent) || row.percent < 1 || row.percent > 1000) throw Error(`Invalid economy ${list} range.`);
    }
    if (!rows.some(r => r.id === data.defaults?.[field])) throw Error(`Missing economy default ${field}.`);
  }
  if (!data.coinShares || Object.keys(data.coinShares).some(k => !COINS[k]) ||
      Object.values(data.coinShares).some(n => !Number.isInteger(n) || n < 0 || n > 100) ||
      Object.values(data.coinShares).reduce((a,b) => a+b, 0) !== 100) throw Error("Coin shares must total 100 percent.");
  for (const values of Object.values(data.stockProfiles ?? {})) resolveEconomy(data, values);
  return data;
}
export async function loadEconomy({ readJson = readModuleJson } = {}) { return validateEconomy(await readJson("data/economy.json")); }
export function economyPolicy() { return policyPromise ??= loadEconomy().catch(error => { policyPromise = null; throw error; }); }
export function resolveEconomy(policy, values = {}, profileId = null) {
  const inputs = { ...policy.defaults, ...policy.stockProfiles?.[profileId], ...values };
  for (const [key, list] of [["settlement", "settlements"], ["prosperity", "prosperities"], ["profile", "profiles"]]) {
    if (!policy[list].some(row => row.id === inputs[key])) throw Error(`Unknown ${key}: ${inputs[key]}.`);
  }
  return Object.fromEntries(["settlement", "prosperity", "profile"].map(key => [key, inputs[key]]));
}
export function floatAmount(policy, inputs, draw) {
  const settlement = policy.settlements.find(row => row.id === inputs.settlement);
  const prosperity = policy.prosperities.find(row => row.id === inputs.prosperity);
  const profile = policy.profiles.find(row => row.id === inputs.profile);
  const sides = settlement.maxCp - settlement.minCp + 1;
  if (!Number.isSafeInteger(draw) || draw < 1 || draw > sides) throw Error("Invalid float roll.");
  const amount = Math.round((settlement.minCp + draw - 1) * prosperity.percent * profile.percent / 10000);
  if (!Number.isSafeInteger(amount) || amount < 0) throw Error("Initial float exceeds supported currency precision.");
  return amount;
}
export function floatCoins(amount, shares) {
  const coins = Object.fromEntries(Object.keys(COINS).map(key => [key, 0]));
  for (const [key, share] of Object.entries(shares)) coins[key] = Math.floor(amount * share / 100 / COINS[key]);
  coins.cp += amount - walletValue(coins);
  return coins;
}
/** Read-only planning. A single native Actor update later commits cash and its one-time marker. */
export async function previewInitialFloat(actor, { policy, profileId = null, hadStock = stockItems(actor).length > 0,
  roll = async sides => (await new Roll(`1d${sides}`).evaluate()).total } = {}) {
  policy ??= await economyPolicy();
  const config = actor.getFlag(MODULE_ID, "merchant") ?? {};
  const inputs = resolveEconomy(policy, config.economy, profileId);
  const before = { ...actor.system.currency };
  const balance = walletValue(before);
  let status = config.initialFloat ? "already-initialized" : balance > 0 ? "preserved-wallet"
    : hadStock || Object.keys(config.relationships ?? {}).length ? "preserved-existing-merchant"
      : tradeSettings(actor).walletMode === "infinite" ? "infinite-wallet" : "generated";
  let amountCp = 0;
  if (status === "generated") {
    const settlement = policy.settlements.find(row => row.id === inputs.settlement);
    amountCp = floatAmount(policy, inputs, await roll(settlement.maxCp - settlement.minCp + 1));
  }
  return { status, inputs, profileId, before, amountCp, after: status === "generated" ? floatCoins(amountCp, policy.coinShares) : before,
    configuration: stable(config.economy ?? null), walletMode: tradeSettings(actor).walletMode, marker: stable(config.initialFloat ?? null), policyVersion: policy.schemaVersion };
}
export function assertFloatCurrent(actor, plan) {
  const config = actor.getFlag(MODULE_ID, "merchant") ?? {};
  if (stable(actor.system.currency) !== stable(plan.before) || stable(config.economy ?? null) !== plan.configuration ||
      stable(config.initialFloat ?? null) !== plan.marker || tradeSettings(actor).walletMode !== plan.walletMode) {
    throw Error("Cash or economy settings changed. Roll a new inventory preview.");
  }
}
export async function applyInitialFloat(actor, plan, extra = {}) {
  assertAdministrator(actor);
  assertFloatCurrent(actor, plan);
  const change = { ...extra };
  if (plan.status !== "already-initialized") {
    change[`flags.${MODULE_ID}.merchant.initialFloat`] = { status: plan.status, amountCp: plan.amountCp,
      inputs: plan.inputs, at: new Date().toISOString(), policyVersion: plan.policyVersion };
    if (plan.status === "generated") change["system.currency"] = plan.after;
  }
  if (!Object.keys(change).length) return;
  await actor.update(change);
  if (stable(actor.system.currency) !== stable(plan.after) ||
      (plan.status !== "already-initialized" && actor.getFlag(MODULE_ID, "merchant.initialFloat")?.status !== plan.status)) {
    throw Error("Initial float read-back failed. Inspect the native wallet before retrying; stock may already be present.");
  }
}
