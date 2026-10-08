import { MODULE_ID } from "../constants.js";
import { MerchantBuilderApplication } from "../merchant/builder/app.js";
import { IntegrationSettingsApplication } from "../integrations/settings-app.js";
import { CompendiumBuilderApplication } from "../apps/compendium-builder-app.js";
import { RollTableBuilderApplication } from "../apps/roll-table-builder-app.js";
import { npcConfiguration, configurationChoices, saveNpcConfiguration } from "./npc-configuration.js";

export const supportedNpc = actor => Boolean(game.user?.isGM && actor?.type === "npc" && !actor.pack && !actor.isToken);
const MAKE_MERCHANT_LABEL = "Devils Table: Make merchant";
const enabled = actor => actor.getFlag(MODULE_ID, "merchant")?.enabled === true;
const rootElement = html => html?.querySelector ? html : html?.[0];
const generations = new WeakMap();
export function openNpcBuilder(actor, tab = "setup") {
  if (!supportedNpc(actor)) return;
  return new MerchantBuilderApplication({ actorId: actor.id, tab }).render({ force: true });
}
/** Render-only extension of the standard 5e NPC sheet. No sheet replacement or prototype patch. */
export async function renderNpcMerchantTab(app, html) {
  const actor = app.actor ?? app.document, root = rootElement(html);
  if (!supportedNpc(actor) || !root) return;
  const generation = (generations.get(app) ?? 0) + 1; generations.set(app, generation);
  root.querySelectorAll("[data-dt-entry]").forEach(el => el.remove());
  const nav = root.querySelector('nav.tabs[data-group="primary"]'), body = root.querySelector(".tab-body");
  if (!nav || !body) return; // Alternate sheets retain the header/Directory entry, without layout assumptions.
  const link = document.createElement("a"); link.className = "item control"; link.dataset.dtEntry = "tab";
  Object.assign(link.dataset, { action: "tab", group: "primary", tab: "devilsTable" });
  link.tabIndex = 0; link.setAttribute("aria-label", "Devil's Table"); link.title = "Devil's Table";
  link.innerHTML = '<i class="fa-solid fa-store" aria-hidden="true"></i>';
  link.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); link.click(); } });
  nav.append(link);
  const panel = document.createElement("section"); panel.className = "tab devils-table dt-npc-tab";
  Object.assign(panel.dataset, { dtEntry: "panel", group: "primary", tab: "devilsTable" });
  if (app.tabGroups?.primary === "devilsTable") { panel.classList.add("active"); link.classList.add("active"); }
  panel.textContent = "Loading merchant settings…"; body.append(panel);
  try {
    const state = await npcConfiguration(actor);
    if (generations.get(app) !== generation || !panel.parentElement || !game.user.isGM) return;
    panel.innerHTML = await foundry.applications.handlebars.renderTemplate("modules/devils-table/templates/npc-merchant-tab.hbs", {
      enabled: enabled(actor), draft: state.draft, choices: configurationChoices(state)
    });
    // These controls intentionally have no form names; native Actor autosave must not handle module drafts.
    for (const type of ["change", "input"]) panel.addEventListener(type, event => event.stopPropagation());
    let saving = false;
    panel.addEventListener("click", async event => {
      const target = event.target.closest("[data-dt-command]"); if (!target) return;
      event.preventDefault(); event.stopPropagation();
      if (!supportedNpc(actor) || saving) return;
      const command = target.dataset.dtCommand;
      if (command === "builder" || command === "services") return openNpcBuilder(actor, command === "services" ? "services" : "setup");
      if (command === "integrations") return new IntegrationSettingsApplication().render({ force: true });
      if (command === "items") return new CompendiumBuilderApplication().render({ force: true });
      if (command === "tables") return new RollTableBuilderApplication().render({ force: true });
      if (command !== "save") return;
      saving = true; target.disabled = true;
      try {
        const values = Object.fromEntries([...panel.querySelectorAll("[data-dt-field]")].map(el => [el.dataset.dtField, el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) : el.value]));
        await saveNpcConfiguration(actor, state, values, panel.querySelector("[data-dt-enabled]").checked);
        ui.notifications.info("Merchant settings saved."); await app.render({ force: true });
      } catch (error) { ui.notifications.error(error.message); }
      finally { saving = false; target.disabled = false; }
    });
  } catch (error) { panel.textContent = `Merchant settings unavailable: ${error.message}. Open Merchant Builder from the header or Actor Directory.`; }
}
/** Resolve supported directory layouts without changing the document being configured. */
export function entryActor(element) {
  const node = rootElement(element) ?? element;
  const row = node?.closest?.("[data-entry-id], [data-document-id], [data-actor-id], [data-token-id]") ?? node;
  const data = row?.dataset ?? {};
  const token = data.tokenId && globalThis.canvas?.scene?.tokens?.get(data.tokenId);
  return token?.actor ?? game.actors.get(data.entryId ?? data.documentId ?? data.actorId);
}
export function addMerchantHeaderControl(app, controls) {
  const doc = app.document;
  if (!["Actor", "Token"].includes(doc?.documentName)) return;
  const actor = doc.documentName === "Token" ? doc.actor : doc;
  if (!supportedNpc(actor) || controls.some(c => c.action === "dtMakeMerchant")) return;
  const open = () => openNpcBuilder(actor);
  const visible = () => supportedNpc(actor);
  // Earlier V2 sheets consume label/onClick and icon classes; newer menus use ContextMenuEntry.
  const legacy = Number(game.release?.generation ?? 14) < 14
    || controls.some(control => "label" in control && !("name" in control));
  controls.push({
    action: "dtMakeMerchant", name: MAKE_MERCHANT_LABEL, label: MAKE_MERCHANT_LABEL,
    icon: legacy ? "fa-solid fa-store" : '<i class="fa-solid fa-store"></i>',
    visible, condition: visible, onClick: open, callback: open
  });
}
export function addActorContext(_application, menu) {
  if (!game.user?.isGM || menu.some(entry => entry.action === "dtMakeMerchant")) return;
  const visible = element => supportedNpc(entryActor(element));
  const open = element => openNpcBuilder(entryActor(element));
  menu.push({
    action: "dtMakeMerchant", label: MAKE_MERCHANT_LABEL, name: MAKE_MERCHANT_LABEL,
    icon: '<i class="fa-solid fa-store"></i>',
    // V14 passes the context target as the second onClick argument.
    visible, onClick: (_event, target) => open(target),
    condition: visible, callback: open
  });
}
export function renderMerchantBadges(_app, html) {
  const root = rootElement(html); if (!root) return;
  root.querySelectorAll(".dt-merchant-badge").forEach(el => el.remove());
  if (!game.user?.isGM) return;
  for (const row of root.querySelectorAll("[data-entry-id], [data-document-id], [data-actor-id], [data-token-id]")) {
    const actor = entryActor(row); if (!supportedNpc(actor) || !enabled(actor)) continue;
    if (row.querySelector(".dt-merchant-badge")) continue;
    const name = row.querySelector(".entry-name, .document-name, .name") ?? row;
    const badge = document.createElement("span"); badge.className = "dt-merchant-badge";
    badge.title = "Devil's Table merchant"; badge.setAttribute("aria-label", "Merchant");
    badge.innerHTML = '<i class="fa-solid fa-store" aria-hidden="true"></i> Merchant'; name.append(badge);
  }
}
export function refreshMerchantIndicators() {
  const actors = globalThis.ui?.actors;
  if (actors?.element) renderMerchantBadges(actors, actors.element);
  if (actors?.popout?.element) renderMerchantBadges(actors.popout, actors.popout.element);
  const tokens = globalThis.ui?.tokens;
  if (tokens?.element) renderMerchantBadges(tokens, tokens.element);
}
export function registerActorEntry() {
  Hooks.on("renderActorSheetV2", (app, html) => { void renderNpcMerchantTab(app, html).catch(error => console.error("Devil's Table NPC tab", error)); });
  Hooks.on("getHeaderControlsApplicationV2", addMerchantHeaderControl);
  Hooks.on("getActorContextOptions", addActorContext);
  Hooks.on("renderActorDirectory", renderMerchantBadges);
  Hooks.on("renderTokenTab", renderMerchantBadges);
  Hooks.on("updateActor", refreshMerchantIndicators);
  refreshMerchantIndicators();
}
