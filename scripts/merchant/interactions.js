import { MODULE_ID } from "../constants.js";
import { publicOffers } from "./model.js";
import { percent } from "./pricing.js";
import { tradeSettings, planPayment } from "./settlement.js";

/** Definitions separate the request/roll/GM-decision lifecycle from individual interactions. */
export const INTERACTIONS = Object.freeze({
  negotiation: Object.freeze({ label: "Negotiation", skill: "per", outcomes: ["success", "failure"] }),
  theft: Object.freeze({ label: "Theft", skill: "slt", outcomes: ["success", "failure-unnoticed", "failure-noticed", "caught"] })
});
export function confidence(actor) {
  const value = actor.getFlag(MODULE_ID, "merchant.confidence") ?? 0;
  return Number.isInteger(value) ? Math.max(-5, Math.min(5, value)) : 0;
}
export function interactionSuggestion(kind, total, dc) {
  if (!INTERACTIONS[kind] || !Number.isFinite(total) || !Number.isInteger(dc) || dc < 0 || dc > 50) throw Error("Invalid interaction roll or DC.");
  const margin = total - dc;
  return { total, dc, margin, success: margin >= 0,
    modifier: margin >= 0 ? -Math.min(25, 5 * (1 + Math.floor(margin / 5))) : 0,
    outcome: margin >= 0 ? "success" : kind === "negotiation" ? "failure"
      : margin > -5 ? "failure-unnoticed" : margin > -10 ? "failure-noticed" : "caught" };
}
export function interactionQuote(merchant, character, request, result) {
  const definition = INTERACTIONS[request.kind];
  if (!definition || !definition.outcomes.includes(result.outcome)) throw Error("Select a valid final interaction outcome.");
  const interaction = { kind: request.kind, ...result, modifier: percent(result.modifier ?? 0) };
  const basket = [];
  if (request.kind === "theft" && result.outcome === "success") {
    const item = publicOffers(merchant).find(i => i.id === request.itemId);
    if (!item || item.quantity < 1) throw Error("The selected item is no longer available.");
    basket.push({ id: item.id, name: item.name, quantity: 1, direction: "buy", copper: 0, originalCopper: item.copper });
  }
  const settings = tradeSettings(merchant);
  return { basket, total: 0, bought: 0, sold: 0, discount: 0, interaction, settings,
    payment: planPayment(character, merchant, 0, settings) };
}

export function nextMemory(old, quote, characterId, now) {
  const next = { ...old, customerActorId: characterId, state: old.state ?? "Unknown",
    firstMeetingAt: old.firstMeetingAt ?? now, lastVisitAt: now, visits: (old.visits ?? 0) + 1 };
  const increment = key => { next[key] = (old[key] ?? 0) + 1; };
  if (quote.interaction) {
    const { kind, outcome, modifier } = quote.interaction;
    if (kind === "negotiation") {
      increment(outcome === "success" ? "successfulNegotiations" : "failedNegotiations");
      // Explicit GM-approved offer for the next completed purchase, even on a failed roll.
      next.negotiationModifier = modifier;
    } else if (outcome === "success") increment("successfulThefts");
    else if (["caught", "failure-noticed"].includes(outcome)) increment("caughtStealing");
  } else {
    increment("transactionCount");
    if (quote.basket.some(row => row.direction === "buy")) {
      increment("successfulPurchases"); next.negotiationModifier = 0;
    }
    next.spentMinor = (old.spentMinor ?? 0) + quote.bought;
    next.receivedMinor = (old.receivedMinor ?? 0) + quote.sold;
    next.lifetimeDiscountMinor = (old.lifetimeDiscountMinor ?? 0) + (quote.discount ?? 0);
  }
  for (const key of ["visits", "transactionCount", "successfulPurchases", "spentMinor", "receivedMinor", "lifetimeDiscountMinor",
    "successfulNegotiations", "failedNegotiations", "successfulThefts", "caughtStealing"]) {
    if (next[key] !== undefined && (!Number.isSafeInteger(next[key]) || next[key] < 0)) throw Error("Merchant memory totals are invalid.");
  }
  return next;
}
