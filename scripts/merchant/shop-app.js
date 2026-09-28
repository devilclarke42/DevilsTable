import { merchantSummary, emptyMerchantStock, saveMerchantEconomy } from "./administration.js";
import { economyPolicy, resolveEconomy } from "./economy.js";
import { MODULE_ID } from "../constants.js";
import { matchesOffer } from "../catalogues/registry.js";
import { percentLabel } from "./pricing.js";
import { DEFAULT_MERCHANT_PORTRAIT, subscribePresentation } from "./presentation.js";
import { walletValue } from "./settlement.js";
import { saleOffers } from "./trade-model.js";
import { formatCopper } from "./currency.js";
import { logger } from "../core/logger.js";
import { merchantRequest } from "./service.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MerchantShopApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #token;
  #administrationOpen = false;
  #adminBusy = false;
  #portrait = DEFAULT_MERCHANT_PORTRAIT;
  #unsubscribe;
  #tokenHook;
  #closed = false;
  #items = [];
  #categories = [];
  #catalogue = null;
  #pricing = {};
  #basket = new Map();
  #sales = new Map();
  #buyModifier = 1;
  #sellerId = null;
  #query = "";
  #category = "";
  #merchant = "Merchant";
  #availability = "open";
  #message = "Loading stock…";
  #pending = false;
  #stockCharacterId = null;

  constructor(token, options = {}) {
    super(options); this.#token = token;
    this.#unsubscribe = subscribePresentation(token.document.actorId, data => {
      this.#portrait = data.portrait || DEFAULT_MERCHANT_PORTRAIT;
      this.#availability = data.availability;
      if (this.rendered) void this.render();
    });
    this.#tokenHook = globalThis.Hooks?.on("updateToken", doc => {
      if (doc.id === this.#token.document.id && doc.parent?.id === this.#token.document.parent.id) {
        this.#merchant = doc.name;
        if (this.rendered) void this.render();
      }
    });
  }
  async close(options) {
    const result = await super.close(options);
    this.#closed = true; this.#unsubscribe?.();
    if (this.#tokenHook !== undefined) Hooks.off("updateToken", this.#tokenHook);
    return result;
  }
  _onRender(context, options) {
    super._onRender?.(context, options);
    this.element.querySelector("[name=search]")?.addEventListener("input", event => {
      this.#query = event.target.value.slice(0, 100);
      // Update only visibility: preserve keyboard focus, caret and basket while typing.
      this.#filterElements();
    });
    const image = this.element.querySelector("[data-merchant-portrait]");
    image?.addEventListener("error", () => { image.src = DEFAULT_MERCHANT_PORTRAIT; }, { once: true });
  }

  static DEFAULT_OPTIONS = {
    id: "devils-table-merchant-shop", classes: ["devils-table"], tag: "section",
    position: { width: 740, height: "auto" },
    window: { title: "Devil's Table: Trade & Merchants — Shop", icon: "fa-solid fa-store", resizable: true },
    actions: { toggleAdministration: MerchantShopApplication.#toggleAdministration, emptyStock: MerchantShopApplication.#emptyStock,
      saveEconomy: MerchantShopApplication.#saveEconomy, setupMerchant: MerchantShopApplication.#setupMerchant, negotiate: MerchantShopApplication.#negotiate, steal: MerchantShopApplication.#steal, refresh: MerchantShopApplication.#refresh, search: MerchantShopApplication.#search,
      category: MerchantShopApplication.#selectCategory, add: MerchantShopApplication.#add,
      remove: MerchantShopApplication.#remove, sell: MerchantShopApplication.#sell, unsell: MerchantShopApplication.#unsell, checkout: MerchantShopApplication.#checkout }
  };
  static PARTS = { body: { template: "modules/devils-table/templates/merchant-shop.hbs" } };

  async _prepareContext(options) {
    const canAdmin = globalThis.game?.user?.isGM === true;
    let administration = null, adminError = "";
    if (canAdmin && this.#administrationOpen) {
      try {
        const actor = game.actors.get(this.#token.document.actorId);
        const policy = await economyPolicy(), inputs = resolveEconomy(policy, actor.getFlag(MODULE_ID, "merchant.economy"));
        administration = { ...await merchantSummary(actor, { policy }),
          fields: [["settlement", "Settlement", "settlements"], ["prosperity", "Prosperity", "prosperities"], ["profile", "Merchant profile", "profiles"]]
            .map(([key, label, list]) => ({ key, label, choices: policy[list].map(row => ({ id: row.id, name: row.name, selected: row.id === inputs[key] })) })) };
      } catch (error) { adminError = error.message; }
    }
    const filtered = this.#items;
    const basket = [...this.#basket].map(([id, count]) => {
      const item = this.#items.find(offer => offer.id === id);
      return item ? { ...item, count, subtotal: count * item.copper, subtotalLabel: formatCopper(count * item.copper) } : null;
    }).filter(Boolean);
    const pc = globalThis.canvas?.tokens?.controlled?.find(token => token.actor?.isOwner && token.actor.type === "character");
    if (this.#sellerId !== pc?.actor.id) { this.#sales.clear(); this.#sellerId = pc?.actor.id; }
    const offers = saleOffers(pc?.actor, this.#buyModifier);
    const sales = [...this.#sales].map(([id, count]) => {
      const item = offers.find(i => i.id === id);
      return item ? { ...item, count, subtotalLabel: formatCopper(count * item.copper) } : null;
    }).filter(Boolean);
    const total = basket.reduce((n, row) => n + row.subtotal, 0) - sales.reduce((n, row) => n + row.count * row.copper, 0);
    let funds = 0;
    try { funds = walletValue(pc?.actor.system.currency); } catch (_) { /* Disable checkout below. */ }
    return { ...await super._prepareContext(options), canAdmin, administrationOpen: canAdmin && this.#administrationOpen,
      administration, adminError, adminBusy: this.#adminBusy, sales, sellItems: offers.map(i => ({ ...i, priceLabel: formatCopper(i.copper) })),
      characterName: pc?.actor.name ?? "Select your character token", fundsLabel: formatCopper(funds),
      fundsError: this.#stockCharacterId !== pc?.actor.id ? "Refresh stock for the selected character’s prices." : total > funds ? "Not enough money for this basket." : "",
      merchant: this.#token.document.name ?? this.#merchant, portrait: this.#portrait,
      availability: this.#availability.charAt(0).toUpperCase() + this.#availability.slice(1),
      items: filtered.map(item => ({ ...item, hidden: !matchesOffer(item, this.#query, this.#category), priceLabel: formatCopper(item.copper) })), basket, message: this.#message, query: this.#query,
      categories: this.#categories.map(row => ({ ...row, selected: row.id === this.#category })),
      noMatches: !this.#items.some(item => matchesOffer(item, this.#query, this.#category)),
      catalogue: this.#catalogue,
      originalLabel: formatCopper(basket.reduce((n, row) => n + row.count * (row.originalCopper ?? row.copper), 0)),
      adjustedLabel: formatCopper(basket.reduce((n, row) => n + row.subtotal, 0)),
      modifiers: ["merchant", "character", "negotiation"].map(key => ({ name: key.charAt(0).toUpperCase() + key.slice(1), label: percentLabel(this.#pricing[key] ?? 0) })),
      stacking: this.#pricing.stacking ?? "additive",
      total,
      totalLabel: `${total < 0 ? "You receive " : "You pay "}${formatCopper(Math.abs(total))}`,
      canInteract: Boolean(pc) && !this.#pending && this.#availability === "open",
      canCheckout: Boolean(pc) && this.#stockCharacterId === pc.actor.id && total <= funds && !this.#pending && this.#availability === "open" && (basket.length + sales.length > 0) };
  }

  static async #toggleAdministration() {
    if (!game.user.isGM) return;
    this.#administrationOpen = !this.#administrationOpen;
    await this.render();
  }
  async #adminAction(operation) {
    if (!game.user.isGM || this.#adminBusy) return;
    this.#adminBusy = true;
    try { await operation(game.actors.get(this.#token.document.actorId)); }
    catch (error) { ui.notifications.error(error.message); }
    finally { this.#adminBusy = false; await this.render(); }
  }
  static async #emptyStock() {
    await this.#adminAction(async actor => {
      const result = await emptyMerchantStock(actor);
      if (result.removed) { ui.notifications.info(`Removed ${result.removed} inventory entries.`); await this.refreshStock(); }
    });
  }
  static async #saveEconomy() {
    await this.#adminAction(async actor => {
      const inputs = Object.fromEntries(["settlement", "prosperity", "profile"].map(key => [key, this.element.querySelector(`[name=${key}]`).value]));
      await saveMerchantEconomy(actor, inputs);
      ui.notifications.info("Economy settings saved. Existing cash is unchanged.");
    });
  }
  static async #setupMerchant() {
    if (!game.user.isGM) return;
    const { MerchantBuilderApplication } = await import("./builder/app.js");
    await new MerchantBuilderApplication({ actorId: this.#token.document.actorId }).render({ force: true });
  }

  async refreshStock() {
    this.#message = "Loading stock…";
    // ApplicationV2 will not mount a new window unless its first render is forced.
    await this.render({ force: true });
    merchantRequest("browse", { sceneId: this.#token.document.parent.id, tokenId: this.#token.document.id,
      characterId: globalThis.canvas?.tokens?.controlled?.find(t => t.actor?.isOwner && t.actor.type === "character")?.actor.id }, async msg => {
      if (this.#closed) return;
      if (msg.error) this.#message = msg.error;
      else {
        this.#merchant = msg.merchant;
        this.#portrait = msg.presentation?.portrait || DEFAULT_MERCHANT_PORTRAIT;
        this.#stockCharacterId = msg.characterId === undefined ? globalThis.canvas?.tokens?.controlled?.find(t => t.actor?.isOwner && t.actor.type === "character")?.actor.id : msg.characterId;
        this.#items = msg.items;
        this.#categories = msg.categories ?? [];
        this.#catalogue = msg.catalogue;
        this.#pricing = msg.pricing ?? {};
        if (!this.#categories.some(row => row.id === this.#category)) this.#category = "";
        this.#buyModifier = msg.buyModifier ?? 1;
        this.#availability = msg.availability;
        for (const [id, quantity] of this.#basket) {
          const item = this.#items.find(offer => offer.id === id);
          if (!item) this.#basket.delete(id);
          else if (quantity > item.quantity) this.#basket.set(id, item.quantity);
        }
        this.#message = `${this.#items.length} public offers. Browsing does not reserve stock.`;
      }
      await this.render();
    });
  }

  #filterElements() {
    let matches = 0;
    const byId = new Map(this.#items.map(item => [item.id, item]));
    for (const row of this.element.querySelectorAll("[data-offer-id]")) {
      const item = byId.get(row.dataset.offerId);
      row.hidden = !item || !matchesOffer(item, this.#query, this.#category);
      if (!row.hidden) matches++;
    }
    const empty = this.element.querySelector("[data-no-matches]");
    if (empty) empty.hidden = matches > 0;
  }
  static async #refresh() { await this.refreshStock(); }
  static async #search() { this.#query = this.element?.querySelector("[name=search]")?.value.trim().slice(0, 100) ?? ""; await this.render(); }
  static async #selectCategory(_event, target) { this.#category = target.dataset.category ?? ""; await this.render(); }
  static async #add(_event, target) {
    const offer = this.#items.find(item => item.id === target.dataset.id);
    if (!offer) return;
    const next = (this.#basket.get(offer.id) ?? 0) + 1;
    if (next > offer.quantity) return;
    this.#basket.set(offer.id, next);
    logger.debug("Basket updated", { merchantToken: this.#token.id, distinct: this.#basket.size });
    await this.render();
  }
  static async #remove(_event, target) {
    const count = this.#basket.get(target.dataset.id) ?? 0;
    if (count <= 1) this.#basket.delete(target.dataset.id);
    else this.#basket.set(target.dataset.id, count - 1);
    logger.debug("Basket updated", { merchantToken: this.#token.id, distinct: this.#basket.size });
    await this.render();
  }
  static async #sell(_event, target) {
    const pc = globalThis.canvas?.tokens?.controlled?.find(t => t.actor?.isOwner && t.actor.type === "character");
    const offer = saleOffers(pc?.actor, this.#buyModifier).find(i => i.id === target.dataset.id);
    if (!offer) return;
    this.#sales.set(offer.id, Math.min(offer.quantity, (this.#sales.get(offer.id) ?? 0) + 1));
    await this.render();
  }
  static async #unsell(_event, target) {
    const count = this.#sales.get(target.dataset.id) ?? 0;
    if (count <= 1) this.#sales.delete(target.dataset.id); else this.#sales.set(target.dataset.id, count - 1);
    await this.render();
  }
  async requestInteraction(kind, itemId) {
    if (this.#pending || this.#availability !== "open") return;
    const pc = globalThis.canvas?.tokens?.controlled?.find(t => t.actor?.isOwner && t.actor.type === "character");
    if (!pc) return ui.notifications.warn("Select your character token first.");
    this.#pending = true; this.#message = "Waiting for the GM to allow the attempt…";
    await this.render();
    merchantRequest("interaction", { kind, itemId, sceneId: this.#token.document.parent.id, tokenId: this.#token.document.id,
      characterId: pc.actor.id, characterTokenId: pc.document.id }, async result => {
      this.#pending = result.status === "pending";
      const outcomes = { success: kind === "theft" ? "Theft succeeded. The selected item was transferred." : "Negotiation completed. Refresh prices reflect the GM's offer.",
        failure: "Negotiation failed. The GM has resolved the offer.", "failure-unnoticed": "Theft failed, unnoticed.",
        "failure-noticed": "The theft attempt was noticed.", caught: "Caught immediately.", declined: "The GM declined the attempt.", completed: "Interaction already completed." };
      const message = result.error || (this.#pending ? "The GM is reviewing your interaction request." : outcomes[result.outcome] ?? "Interaction complete.");
      if (result.status === "interaction-complete") {
        ui.notifications.info(message);
        await this.refreshStock();
      }
      this.#message = message; await this.render();
    });
  }
  static async #negotiate() { await this.requestInteraction("negotiation"); }
  static async #steal(_event, target) { await this.requestInteraction("theft", target.dataset.id); }
  static async #checkout() {
    if (this.#pending || this.#availability !== "open" || (!this.#basket.size && !this.#sales.size)) return;
    const pc = globalThis.canvas?.tokens?.controlled?.find(token => token.actor?.isOwner && token.actor.type === "character");
    if (!pc) { this.#message = "Control a character token near the merchant before checkout."; return this.render(); }
    const context = await this._prepareContext({});
    if (!context.canCheckout) { this.#message = context.fundsError || "Review your basket and selected character."; return this.render(); }
    this.#pending = true;
    this.#message = "Waiting for GM response…";
    await this.render();
    merchantRequest("checkout", { sceneId: this.#token.document.parent.id, tokenId: this.#token.document.id,
      characterId: pc.actor.id, characterTokenId: pc.document.id,
      sales: [...this.#sales].map(([id, quantity]) => ({ id, quantity })),
      lines: [...this.#basket].map(([id, quantity]) => ({ id, quantity })) }, async result => {
      this.#pending = result.status === "pending";
      this.#message = result.error || ({ pending: "GM is reviewing the request; no stock is reserved.",
        approved: "Trade completed. Items and currency transferred.",
        rejected: "Checkout was rejected or the revised offer was declined. Your basket remains available.",
        close: "GM closed the request. Your basket remains available." }[result.status] ?? "Request complete.");
      if (result.status === "approved") { this.#basket.clear(); this.#sales.clear(); await this.refreshStock(); }
      await this.render();
    });
  }
}
