import { logger } from "../core/logger.js";
import { merchantRequest } from "./service.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MerchantShopApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #token;
  #items = [];
  #basket = new Map();
  #query = "";
  #category = "";
  #merchant = "Merchant";
  #availability = "open";
  #message = "Loading stock…";
  #pending = false;

  constructor(token, options = {}) { super(options); this.#token = token; }

  static DEFAULT_OPTIONS = {
    id: "devils-table-merchant-shop", classes: ["devils-table"], tag: "section",
    position: { width: 740, height: "auto" },
    window: { title: "Devil's Table — Shop", icon: "fa-solid fa-store", resizable: true },
    actions: { refresh: MerchantShopApplication.#refresh, search: MerchantShopApplication.#search,
      category: MerchantShopApplication.#selectCategory, add: MerchantShopApplication.#add,
      remove: MerchantShopApplication.#remove, checkout: MerchantShopApplication.#checkout }
  };
  static PARTS = { body: { template: "modules/devils-table/templates/merchant-shop.hbs" } };

  async _prepareContext(options) {
    const filtered = this.#items.filter(item => (!this.#category || item.category === this.#category) &&
      (!this.#query || `${item.name} ${item.description}`.toLocaleLowerCase().includes(this.#query.toLocaleLowerCase())));
    const basket = [...this.#basket].map(([id, count]) => {
      const item = this.#items.find(offer => offer.id === id);
      return item ? { ...item, count, subtotal: count * item.copper } : null;
    }).filter(Boolean);
    return { ...await super._prepareContext(options), merchant: this.#merchant, availability: this.#availability,
      items: filtered, basket, message: this.#message, query: this.#query,
      categories: [...new Set(this.#items.map(item => item.category))].map(id => ({ id, selected: id === this.#category })),
      total: basket.reduce((n, row) => n + row.subtotal, 0),
      canCheckout: !this.#pending && this.#availability === "open" && basket.length > 0 };
  }

  async refreshStock() {
    this.#message = "Loading stock…";
    // ApplicationV2 will not mount a new window unless its first render is forced.
    await this.render({ force: true });
    merchantRequest("browse", { sceneId: this.#token.document.parent.id, tokenId: this.#token.document.id }, async msg => {
      if (msg.error) this.#message = msg.error;
      else {
        this.#merchant = msg.merchant;
        this.#items = msg.items;
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
  static async #checkout() {
    if (this.#pending || this.#availability !== "open" || !this.#basket.size) return;
    const pc = canvas.tokens.controlled.find(token => token.actor?.isOwner && token.actor.type === "character");
    if (!pc) { this.#message = "Control a character token near the merchant before checkout."; return this.render(); }
    this.#pending = true;
    this.#message = "Waiting for GM response…";
    await this.render();
    merchantRequest("checkout", { sceneId: this.#token.document.parent.id, tokenId: this.#token.document.id,
      characterId: pc.actor.id, characterTokenId: pc.document.id,
      lines: [...this.#basket].map(([id, quantity]) => ({ id, quantity })) }, async result => {
      this.#pending = result.status === "pending";
      this.#message = result.error || ({ pending: "GM is reviewing the request; no stock is reserved.",
        approved: "GM approved the demonstration request. No Items or money moved.",
        rejected: "GM rejected the request. Your basket remains available.",
        close: "GM closed the request. Your basket remains available." }[result.status] ?? "Request complete.");
      if (result.status === "approved") this.#basket.clear();
      await this.render();
    });
  }
}
