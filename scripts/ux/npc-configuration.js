import { MODULE_ID } from "../constants.js";
import { catalogueRegistry } from "../catalogues/registry.js";
import { economyPolicy } from "../merchant/economy.js";
import { loadBuilderPolicy, readConfiguration, configurationSnapshot } from "../merchant/builder/model.js";
import { loadStockCatalogue } from "../data/stock-loader.js";
import { saveConfiguration } from "../merchant/builder/service.js";
import { withAdministration } from "../merchant/operation-guard.js";

let contextPromise;
/** Module source definitions are immutable during a session; share them across NPC sheet renders. */
async function configurationContext() {
  contextPromise ??= Promise.all([economyPolicy(), loadBuilderPolicy(), loadStockCatalogue()])
    .then(([economy, policy, catalogue]) => ({economy, policy, catalogue}))
    .catch(error => { contextPromise = null; throw error; });
  return contextPromise;
}
/** Reuse Builder validation, authority checks and writes. Disabling never erases merchant history. */
export async function npcConfiguration(actor) {
  const context = await configurationContext();
  return { context, draft: readConfiguration(actor, context), expected: configurationSnapshot(actor) };
}
export async function saveNpcConfiguration(actor, state, values, enabled) {
  if (!game.user?.isGM || actor?.type !== "npc" || actor.isToken || actor.pack) throw Error("Configure a world NPC Actor; linked tokens use that Actor's merchant settings.");
  if (!enabled) return withAdministration(actor, async () => {
    if (configurationSnapshot(actor) !== state.expected) throw Error("Merchant settings changed. Reopen the tab before saving.");
    if (actor.getFlag(MODULE_ID, "merchant")) await actor.setFlag(MODULE_ID, "merchant.enabled", false);
    for (const scene of game.scenes) {
      const tokens = scene.tokens.filter(token => token.actorLink && token.actorId === actor.id);
      if (tokens.length) await scene.updateEmbeddedDocuments("Token", tokens.map(token => ({_id:token.id,[`flags.${MODULE_ID}.merchantEntry`]:false})));
    }
  }, { allowUnconverted: true });
  const draft = { ...state.draft, ...values };
  if (draft.catalogueId !== state.draft.catalogueId) draft.stockProfileId = "";
  return saveConfiguration(actor, draft, state.context, state.expected);
}
export function configurationChoices(state) {
  const { economy, policy } = state.context;
  return [
    ["catalogueId", "Catalogue", catalogueRegistry.list()],
    ["profile", "Economic profile", economy.profiles],
    ["settlement", "Settlement", economy.settlements],
    ["prosperity", "Prosperity", economy.prosperities],
    ["availability", "Availability", policy.availability.map(id => ({ id, name: id }))],
    ["restockProfile", "Restock profile", policy.restockProfiles]
  ].map(([key, label, choices]) => ({ key, label, choices: choices.map(c => ({ ...c, selected: c.id === state.draft[key] })) }));
}
