import { formatCopper } from "./currency.js";
import { escapeHtml } from "../builders/item-factory.js";

/** Public terms only: never send wallets, GM notes or the full settlement plan. */
export function offerTerms(quote) {
  return { total: quote.total, basket: quote.basket.map(({ id, direction, name, quantity, copper }) =>
    ({ id, direction, name, quantity, copper })) };
}
export async function confirmRevisedOffer({ merchant, previous, revised }) {
  const total = quote => `${quote.total < 0 ? "You receive" : "You pay"} ${formatCopper(Math.abs(quote.total))}`;
  const list = quote => `<ul>${quote.basket.map(row => `<li>${row.direction === "sell" ? "Sell" : "Buy"}: ${row.quantity} × ${escapeHtml(row.name)} — ${formatCopper(row.copper)} each</li>`).join("")}</ul>`;
  return foundry.applications.api.DialogV2.confirm({
    window: { title: "Merchant offer changed" }, modal: true, rejectClose: false,
    content: `<p><strong>${escapeHtml(merchant)}</strong> has revised your checkout. Review the prices and quantities before continuing.</p><h3>Previous offer</h3>${list(previous)}<p>${total(previous)}</p><h3>Revised offer</h3>${list(revised)}<p><strong>${total(revised)}</strong></p><p>Continue at these terms? Nothing transfers until the GM approves. Respond within 60 seconds; a late response cannot approve a trade.</p>`,
    yes: { label: "Accept revised offer" }, no: { label: "Decline" }
  });
}
