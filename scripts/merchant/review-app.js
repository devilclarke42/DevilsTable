import { quoteTrade, stable } from "./trade-model.js";
import { INTERACTIONS } from "./interactions.js";
import { percent, percentLabel } from "./pricing.js";
import { MODULE_ID } from "../constants.js";
import { formatCopper } from "./currency.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MerchantReviewApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #data;
  #finished = false;
  #saving = false;
  #edits = null;
  #offerMessage = "";
  #previewListener = null;
  constructor(data, options = {}) {
    super(options); this.#data = data;
    this.#edits = data.proposal ? { pricing: { ...data.proposal.pricing },
      lines: data.proposal.basket.map(({ id, direction, quantity }) => ({ id, direction, quantity, percent: 0 })) } : null;
  }

  static DEFAULT_OPTIONS = {
    id: "devils-table-merchant-review", classes: ["devils-table"], tag: "section",
    position: { width: 560, height: "auto" },
    window: { title: "Devil's Table: Trade & Merchants — GM Merchant Review", icon: "fa-solid fa-clipboard-check", resizable: true },
    actions: { approve: MerchantReviewApplication.#approve, reject: MerchantReviewApplication.#reject,
      allowInteraction: MerchantReviewApplication.#allowInteraction, resolveInteraction: MerchantReviewApplication.#resolveInteraction,
      saveModifiers: MerchantReviewApplication.#saveModifiers,
      dismiss: MerchantReviewApplication.#dismiss, recalculate: MerchantReviewApplication.#recalculate }
  };
  static PARTS = { body: { template: "modules/devils-table/templates/merchant-review.hbs" } };

  async _prepareContext(options) {
    const memory = { successfulNegotiations: 0, failedNegotiations: 0, successfulThefts: 0, caughtStealing: 0,
      ...(this.#data.actor.getFlag(MODULE_ID, `merchant.relationships.${this.#data.character.id}`) ?? this.#data.actor.getFlag(MODULE_ID, "merchant.relationshipDefaults")) };
    memory.spendLabel = formatCopper(memory.spentMinor ?? 0);
    memory.discountLabel = formatCopper(memory.lifetimeDiscountMinor ?? 0);
    if (this.#data.interaction) {
      const interaction = this.#data.interaction;
      return { ...await super._prepareContext(options), interaction, merchant: this.#data.actor.name,
        character: this.#data.character.name, claimedUser: this.#data.user.name, relationship: memory.state ?? "Unknown",
        memory, theft: interaction.kind === "theft", itemName: this.#data.actor.items.get(this.#data.request.itemId)?.name,
        skills: Object.entries(CONFIG.DND5E.skills).filter(([id]) => interaction.kind !== "theft" || id === "slt")
          .map(([id, value]) => ({ id, label: game.i18n.localize(value.label), selected: id === interaction.skill })),
        outcomes: INTERACTIONS[interaction.kind].outcomes.map(value => ({ value, label: value.replaceAll("-", " "), selected: value === interaction.result?.outcome })),
        note: this.#offerMessage || "Private GM review. The player receives no DC or merchant statistics. Suggestions never decide the outcome.",
        suggestedRelationship: interaction.result?.success ? "Consider recognising this customer; no relationship state will change automatically."
          : "Consider suspicion only if appropriate to the scene; no relationship state will change automatically." };
    }
    return { ...await super._prepareContext(options), merchant: this.#data.actor.name,
      character: this.#data.character.name, claimedUser: this.#data.user.name,
      relationship: memory.state ?? "Unknown", memory,
      pricing: this.#data.proposal.pricing, compound: this.#data.proposal.pricing?.stacking === "compound",
      finalModifier: percentLabel(this.#data.proposal.finalModifier ?? 0),
      originalLabel: `${(this.#data.proposal.originalTotal ?? this.#data.proposal.total) < 0 ? "Character receives " : "Character pays "}${formatCopper(Math.abs(this.#data.proposal.originalTotal ?? this.#data.proposal.total))}`,
      discountLabel: formatCopper(this.#data.proposal.discount ?? 0),
      adjustmentLabel: `${this.#data.proposal.adjustment < 0 ? "−" : "+"}${formatCopper(Math.abs(this.#data.proposal.adjustment ?? 0))}`,
      basket: this.#data.proposal.basket.map(row => ({ ...row, kindLabel:row.kind === "service" ? "Service" : "Product", executionLabel:row.kind === "service" ? [...Object.keys(row.execution??{}),...(row.actions??[]).map(action=>action.kind==="integration"?`${action.integration}: ${action.action}`:action.kind)].join(", ") || "Record only" : "Transfer inventory", priceLabel: formatCopper(row.copper), originalLabel: formatCopper(row.originalCopper ?? row.copper) })),
      totalLabel: `${this.#data.proposal.total < 0 ? "Character receives " : "Character pays "}${formatCopper(Math.abs(this.#data.proposal.total))}`,
      paymentRows: ["pp", "gp", "ep", "sp", "cp"].map(coin => ({ coin,
        pcBefore: this.#data.character.system.currency[coin] ?? 0,
        pcAfter: this.#data.proposal.payment.character[coin] ?? 0,
        gmBefore: this.#data.actor.system.currency[coin] ?? 0,
        gmAfter: this.#data.proposal.payment.merchant[coin] ?? 0 })),
      currency: { ...this.#data.character.system.currency },
      note: this.#offerMessage || "Checkout confirmed with the requesting client. Approval transfers the displayed goods and native currency." };
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
    const number = (element, label) => {
      if (!element || !element.value.trim()) throw Error(`The review form is missing a ${label}.`);
      const value = Number(element.value);
      if (!Number.isFinite(value)) throw Error(`Invalid ${label}.`);
      return value;
    };
    const rows = [...this.element.querySelectorAll("[data-trade-line]")];
    if (!rows.length) throw Error("The review form has no item rows. Close it and request checkout again.");
    const lines = rows.map(row => {
      const quantity = number(row.querySelector("[name=quantity]"), "quantity or price modifier");
      if (!Number.isSafeInteger(quantity) || quantity < 0) throw Error("Quantities must be whole and nonnegative.");
      return { id: row.dataset.id, direction: row.dataset.direction, quantity,
        percent: percent(number(row.querySelector("[name=percent]"), "percentage modifier")) };
    });
    const pricing = {};
    for (const key of ["merchant", "character", "negotiation", "review"]) {
      pricing[key] = percent(number(this.element.querySelector(`[name=${key}Modifier]`), `${key} modifier`));
    }
    pricing.stacking = this.element.querySelector("[name=stacking]").value;
    return { lines, pricing };
  }
  _onRender(context, options) {
    super._onRender?.(context, options);
    if (this.#data.interaction) return;
    this.#previewListener?.abort();
    this.#previewListener = new AbortController();
    this.element.addEventListener("input", () => {
      if (this.#saving || this.#finished) return;
      try {
        const quote = quoteTrade(this.#data.actor, this.#data.character, this.#data.request, this.#readEdits(), { settlement: false });
        const text = (key, value) => { const node = this.element.querySelector(`[data-preview=${key}]`); if (node) node.textContent = value; };
        text("original", `${quote.originalTotal < 0 ? "Character receives" : "Character pays"} ${formatCopper(Math.abs(quote.originalTotal))}`);
        text("discount", formatCopper(quote.discount));
        text("adjustment", `${quote.adjustment < 0 ? "−" : "+"}${formatCopper(Math.abs(quote.adjustment))}`);
        text("total", `${quote.total < 0 ? "Character receives" : "Character pays"} ${formatCopper(Math.abs(quote.total))}`);
        text("modifier", percentLabel(quote.finalModifier));
        text("error", "Preview only. Recalculate to confirm changed terms with the player.");
        for (const row of this.element.querySelectorAll("[data-trade-line]")) {
          const line = quote.basket.find(r => r.id === row.dataset.id && r.direction === row.dataset.direction);
          const label = row.querySelector("[data-adjusted]");
          if (label) label.textContent = line ? formatCopper(line.copper) : "Removed";
        }
      } catch (error) { const node = this.element.querySelector("[data-preview=error]"); if (node) node.textContent = error.message; }
    }, { signal: this.#previewListener.signal });
  }
  static async #allowInteraction() {
    if (this.#saving || this.#finished || this.#data.interaction.result) return;
    this.#saving = true;
    try {
      const skill = this.element.querySelector("[name=skill]").value;
      const rawDC = this.element.querySelector("[name=dc]").value;
      if (!rawDC.trim()) throw Error("Set a hidden DC before allowing the roll.");
      const dc = Number(rawDC);
      this.#offerMessage = "Waiting for the player's native skill roll (up to 60 seconds)…";
      await this.render();
      const result = await this.#data.onRoll({ skill, dc });
      Object.assign(this.#data.interaction, { skill, dc, result });
      this.#offerMessage = "Roll received. The result is advisory: choose the final outcome below.";
    } catch (error) { this.#offerMessage = error.message; ui.notifications.error(error.message); }
    finally { this.#saving = false; await this.render(); }
  }
  static async #resolveInteraction() {
    if (this.#saving || this.#finished) return;
    try {
      this.#edits = { outcome: this.element.querySelector("[name=outcome]").value,
        modifier: this.#data.interaction.kind === "negotiation" ? percent(Number(this.element.querySelector("[name=interactionModifier]").value)) : 0 };
      await this.#complete("approved");
    } catch (error) { ui.notifications.error(error.message); }
  }
  static async #saveModifiers() {
    if (this.#saving || this.#finished) return;
    this.#saving = true;
    try {
      const edits = this.#readEdits();
      await this.#data.onSaveModifiers(edits.pricing);
      ui.notifications.info("Shop and character modifiers saved. Recalculate to confirm this checkout.");
    } catch (error) { ui.notifications.error(error.message); }
    finally { this.#saving = false; }
  }
  static async #recalculate() {
    if (this.#saving || this.#finished) return false;
    let declined = false;
    this.#saving = true;
    try {
      const edits = this.#readEdits();
      const proposal = quoteTrade(this.#data.actor, this.#data.character, this.#data.request, edits);
      this.#edits = edits;
      this.#data.proposal = proposal;
      this.#offerMessage = "Waiting for the player to confirm any changed prices or quantities…";
      await this.render();
      if (!await this.#data.onRecalculate(proposal)) {
        declined = true;
        this.#offerMessage = "Player declined the revised offer. Checkout cancelled.";
        return false;
      }
      this.#offerMessage = "The player has accepted these terms. Review and approve to complete the trade.";
      await this.render();
      return true;
    } catch (error) {
      this.#offerMessage = "Player confirmation was not received. Recalculate to retry, or close the checkout.";
      ui.notifications.error(error.message); return false;
    } finally {
      this.#saving = false;
      if (declined) await this.#complete("rejected");
      else await this.render();
    }
  }
  static async #approve() {
    if (this.#saving || this.#finished) return;
    try {
      const edits = this.#readEdits();
      if (stable(edits) !== stable(this.#edits)) {
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
