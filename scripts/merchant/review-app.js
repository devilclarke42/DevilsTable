import { quoteTrade } from "./trade-model.js";
import { formatCopper } from "./currency.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MerchantReviewApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #data;
  #finished = false;
  #saving = false;
  #edits = null;
  constructor(data, options = {}) {
    super(options); this.#data = data;
    this.#edits = data.proposal?.basket.map(({ id, direction, quantity, copper }) => ({ id, direction, quantity, copper })) ?? null;
  }

  static DEFAULT_OPTIONS = {
    id: "devils-table-merchant-review", classes: ["devils-table"], tag: "section",
    position: { width: 560, height: "auto" },
    window: { title: "Devil's Table — GM Checkout Review", icon: "fa-solid fa-clipboard-check", resizable: true },
    actions: { approve: MerchantReviewApplication.#approve, reject: MerchantReviewApplication.#reject,
      dismiss: MerchantReviewApplication.#dismiss, recalculate: MerchantReviewApplication.#recalculate }
  };
  static PARTS = { body: { template: "modules/devils-table/templates/merchant-review.hbs" } };

  async _prepareContext(options) {
    return { ...await super._prepareContext(options), merchant: this.#data.actor.name,
      character: this.#data.character.name, claimedUser: this.#data.user.name,
      basket: this.#data.proposal.basket.map(row => ({ ...row, priceLabel: formatCopper(row.copper) })),
      totalLabel: `${this.#data.proposal.total < 0 ? "Character receives " : "Character pays "}${formatCopper(Math.abs(this.#data.proposal.total))}`,
      paymentRows: ["pp", "gp", "ep", "sp", "cp"].map(coin => ({ coin,
        pcBefore: this.#data.character.system.currency[coin] ?? 0,
        pcAfter: this.#data.proposal.payment.character[coin] ?? 0,
        gmBefore: this.#data.actor.system.currency[coin] ?? 0,
        gmAfter: this.#data.proposal.payment.merchant[coin] ?? 0 })),
      currency: { ...this.#data.character.system.currency },
      note: "Checkout confirmed with the requesting client. Approval transfers the displayed goods and native currency." };
  }
  async #complete(status) {
    if (this.#finished || this.#saving) return;
    this.#saving = true;
    try {
      const saved = await this.#data.onFinish(status, this.#edits);
      if (saved === false) return;
      this.#finished = true;
    } finally {
      this.#saving = false;
    }
    await this.close();
  }
  #readEdits() {
    const rows = [...this.element.querySelectorAll("[data-trade-line]")];
    if (!rows.length) throw Error("The review form has no item rows. Close it and request checkout again.");
    return rows.map(row => {
      const quantity = row.querySelector("[name=quantity]");
      const copper = row.querySelector("[name=copper]");
      if (!quantity || !copper || !quantity.value.trim() || !copper.value.trim()) {
        throw Error("The review form is missing a quantity or price. Close it and request checkout again.");
      }
      const result = { id: row.dataset.id, direction: row.dataset.direction,
        quantity: Number(quantity.value), copper: Number(copper.value) };
      if (![result.quantity, result.copper].every(n => Number.isSafeInteger(n) && n >= 0)) {
        throw Error("Quantities and prices must be whole, nonnegative numbers.");
      }
      return result;
    });
  }
  static async #recalculate() {
    if (this.#saving) return false;
    try {
      const edits = this.#readEdits();
      const proposal = quoteTrade(this.#data.actor, this.#data.character, this.#data.request, edits);
      this.#edits = edits;
      this.#data.proposal = proposal;
      await this.render();
      return true;
    } catch (error) { ui.notifications.error(error.message); return false; }
  }
  static async #approve() {
    if (this.#saving || this.#finished) return;
    try {
      const edits = this.#readEdits();
      if (JSON.stringify(edits) !== JSON.stringify(this.#edits)) {
        if (await MerchantReviewApplication.#recalculate.call(this)) {
          ui.notifications.info("Review the recalculated totals and coin balances, then approve.");
        }
        return;
      }
      await this.#complete("approved");
    } catch (error) { ui.notifications.error(error.message); }
  }
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
