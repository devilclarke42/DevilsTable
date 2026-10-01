import { formatCopper } from "./currency.js";
import { escapeHtml } from "../builders/item-factory.js";

/** Public terms only: never send wallets, GM notes or the full settlement plan. */
export function offerTerms(quote) {
  return { total: quote.total, basket: quote.basket.map(({ id, direction, name, quantity, copper, saleUnit, duration, accommodation, nights, checkoutTime }) =>
    ({ id, direction, name, quantity, copper, ...(id.startsWith("service:") ? {saleUnit, duration} : {}), ...(accommodation ? {nights,checkoutTime} : {}) })) };
}
export async function confirmRevisedOffer({ merchant, previous, revised }) {
  const total = quote => `${quote.total < 0 ? "You receive" : "You pay"} ${formatCopper(Math.abs(quote.total))}`;
  const list = quote => `<ul>${quote.basket.map(row => `<li>${row.id.startsWith("service:") ? "Service" : row.direction === "sell" ? "Sell" : "Buy"}: ${row.quantity} × ${escapeHtml(row.name)}${row.saleUnit ? ` (${escapeHtml(row.saleUnit)}; ${escapeHtml(row.duration??"")})` : ""}${row.checkoutTime ? `; ${escapeHtml(String(row.nights))} night(s), checkout ${escapeHtml(row.checkoutTime)}` : ""} — ${formatCopper(row.copper)} each</li>`).join("")}</ul>`;
  return foundry.applications.api.DialogV2.confirm({
    window: { title: "Merchant offer changed" }, modal: true, rejectClose: false,
    content: `<p><strong>${escapeHtml(merchant)}</strong> has revised your checkout. Review the prices, quantities and room checkout terms before continuing.</p><h3>Previous offer</h3>${list(previous)}<p>${total(previous)}</p><h3>Revised offer</h3>${list(revised)}<p><strong>${total(revised)}</strong></p><p>Continue at these terms? Nothing transfers until the GM approves. Respond within 60 seconds; a late response cannot approve a trade.</p>`,
    yes: { label: "Accept revised offer" }, no: { label: "Decline" }
  });
}
