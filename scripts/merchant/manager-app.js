import { merchantConfig } from "./model.js";
import { enableMerchant } from "./service.js";
import { loadStockCatalogue } from "../data/stock-loader.js";
import { stockProfiles } from "../data/stock-catalogue.js";
import { previewMerchantStock, applyMerchantStock } from "./populate-stock.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MerchantManagerApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #message = "Choose an existing NPC and enable its linked tokens as shop entry points.";
  #catalogue = null;
  #actorId = "";
  #profileId = "DT_TABLE_GS";
  #preview = null;
  #busy = false;
  static DEFAULT_OPTIONS = {
    id: "devils-table-merchant-manager", classes: ["devils-table"], tag: "section",
    position: { width: 650, height: "auto" },
    window: { title: "Devil's Table — Merchant Setup", icon: "fa-solid fa-store", resizable: true },
    actions: { enable: MerchantManagerApplication.#enable, previewStock: MerchantManagerApplication.#previewStock,
      addStock: MerchantManagerApplication.#addStock }
  };
  static PARTS = { body: { template: "modules/devils-table/templates/merchant-manager.hbs" } };
  async _prepareContext(options) {
    let stockError = "";
    try { this.#catalogue ??= await loadStockCatalogue(); }
    catch (error) { stockError = error.message; }
    return { ...await super._prepareContext(options), npcs: game.actors.filter(actor => actor.type === "npc")
      .map(actor => ({ id: actor.id, name: actor.name, selected: actor.id === this.#actorId, enabled: Boolean(merchantConfig(actor)) })),
      profiles: this.#catalogue ? stockProfiles(this.#catalogue).map(p => ({ id: p.id, name: p.name, selected: p.id === this.#profileId })) : [],
      stockError, preview: this.#preview, previewMerchant: game.actors.get(this.#preview?.actorId)?.name,
      busy: this.#busy, stockBlocked: this.#busy || Boolean(stockError), message: this.#message };
  }
  static async #enable() {
    if (this.#busy) return;
    const actor = game.actors.get(this.element?.querySelector("[name=npc]")?.value);
    this.#actorId = actor?.id ?? "";
    const availability = this.element?.querySelector("[name=availability]")?.value ?? "open";
    try {
      await enableMerchant(actor, availability);
      this.#message = `${actor.name} is enabled. Its linked scene tokens open the Shop UI on right-click.`;
    } catch (error) { this.#message = error.message; }
    await this.render();
  }

  static async #previewStock() {
    if (this.#busy) return;
    this.#actorId = this.element.querySelector("[name=npc]").value;
    this.#profileId = this.element.querySelector("[name=profile]").value;
    this.#busy = true;
    this.#preview = null;
    try {
      await this.render();
      const profile = stockProfiles(this.#catalogue).find(p => p.id === this.#profileId);
      if (!profile) throw new Error("Choose a stock profile.");
      this.#preview = await previewMerchantStock(game.actors.get(this.#actorId), { shopId: profile.shop, profileId: profile.id });
      this.#message = "Preview ready. Existing catalogue goods are skipped, including sold-out offers. Add the preview when ready.";
    } catch (error) { this.#message = error.message; }
    finally { this.#busy = false; await this.render(); }
  }

  static async #addStock() {
    if (this.#busy || !this.#preview) return;
    if (this.element.querySelector("[name=npc]").value !== this.#preview.actorId ||
        this.element.querySelector("[name=profile]").value !== this.#preview.profileId) {
      this.#message = "Selection changed. Roll a new preview before adding stock.";
      return this.render();
    }
    this.#busy = true;
    try {
      await this.render();
      const result = await applyMerchantStock(game.actors.get(this.#preview.actorId), this.#preview);
      this.#message = `Added ${result.created} goods; skipped ${result.skipped} existing offers. Players can use Refresh stock to see the additions.`;
      this.#preview = null;
    } catch (error) { this.#message = error.message; }
    finally { this.#busy = false; await this.render(); }
  }
}
