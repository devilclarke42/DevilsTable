import { formatCopper } from "./currency.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MerchantReviewApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #data;
  #finished = false;
  #saving = false;
  constructor(data, options = {}) { super(options); this.#data = data; }

  static DEFAULT_OPTIONS = {
    id: "devils-table-merchant-review", classes: ["devils-table"], tag: "section",
    position: { width: 560, height: "auto" },
    window: { title: "Devil's Table — GM Checkout Review", icon: "fa-solid fa-clipboard-check", resizable: true },
    actions: { approve: MerchantReviewApplication.#approve, reject: MerchantReviewApplication.#reject,
      dismiss: MerchantReviewApplication.#dismiss }
  };
  static PARTS = { body: { template: "modules/devils-table/templates/merchant-review.hbs" } };

  async _prepareContext(options) {
    return { ...await super._prepareContext(options), merchant: this.#data.actor.name,
      character: this.#data.character.name, claimedUser: this.#data.user.name,
      basket: this.#data.proposal.basket.map(row => ({ ...row, priceLabel: formatCopper(row.copper) })),
      totalLabel: formatCopper(this.#data.proposal.total),
      currency: { ...this.#data.character.system.currency },
      note: "Request identity is unverified on the module socket. This sprint does not move Items or currency." };
  }
  async #complete(status) {
    if (this.#finished || this.#saving) return;
    this.#saving = true;
    try {
      const saved = await this.#data.onFinish(status);
      if (saved === false) return;
      this.#finished = true;
    } finally {
      this.#saving = false;
    }
    await this.close();
  }
  static async #approve() { await this.#complete("approved"); }
  static async #reject() { await this.#complete("rejected"); }
  static async #dismiss() { await this.#complete("close"); }
  async close(options) {
    if (this.#saving) return this;
    if (!this.#finished) {
      this.#saving = true;
      try {
        if (await this.#data.onFinish("close") === false) return this;
        this.#finished = true;
      } finally { this.#saving = false; }
    }
    return super.close(options);
  }
}
