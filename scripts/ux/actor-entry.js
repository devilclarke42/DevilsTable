import { MODULE_ID } from "../constants.js";
import { MerchantBuilderApplication } from "../merchant/builder/app.js";
import { IntegrationSettingsApplication } from "../integrations/settings-app.js";
import { CompendiumBuilderApplication } from "../apps/compendium-builder-app.js";
import { RollTableBuilderApplication } from "../apps/roll-table-builder-app.js";
import { npcConfiguration, configurationChoices, saveNpcConfiguration } from "./npc-configuration.js";

export const supportedNpc = actor => Boolean(game.user?.isGM && actor?.type === "npc" && !actor.pack && !actor.isToken);
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
  const header = root.querySelector(".window-header");
  if (header) {
    const button = document.createElement("button"); button.type = "button"; button.dataset.dtEntry = "header";
    button.className = "dt-actor-entry"; button.textContent = enabled(actor) ? "Merchant Builder" : "Create Merchant";
    button.title = "Devil's Table"; button.addEventListener("click", () => openNpcBuilder(actor)); header.append(button);
  }
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
export function addActorContext(_application, menu) {
  if (!game.user?.isGM) return;
  const actor = element => game.actors.get((element?.dataset ?? element?.[0]?.dataset)?.entryId);
  menu.push({ name: "Devil's Table — Create / Manage Merchant", icon: '<i class="fa-solid fa-store"></i>',
    condition: element => supportedNpc(actor(element)), callback: element => openNpcBuilder(actor(element)) });
}
export function renderMerchantBadges(_app, html) {
  const root = rootElement(html); if (!root || !game.user?.isGM) return;
  root.querySelectorAll(".dt-merchant-badge").forEach(el => el.remove());
  for (const row of root.querySelectorAll("[data-entry-id]")) {
    const actor = game.actors.get(row.dataset.entryId); if (!supportedNpc(actor) || !enabled(actor)) continue;
    const name = row.querySelector(".entry-name, .document-name"); if (!name) continue;
    const badge = document.createElement("i"); badge.className = "fa-solid fa-store dt-merchant-badge";
    badge.title = "Merchant"; badge.setAttribute("aria-label", "Merchant"); name.append(badge);
  }
}
export function registerActorEntry() {
  Hooks.on("renderActorSheetV2", (app, html) => { void renderNpcMerchantTab(app, html).catch(error => console.error("Devil's Table NPC tab", error)); });
  Hooks.on("getActorContextOptions", addActorContext);
  Hooks.on("renderActorDirectory", renderMerchantBadges);
}
