import { serviceOffers } from "../services/offers.js";
import { MODULE_ID } from "../constants.js";
import { coinValue, publicOffers, sanitizeBasket } from "./model.js";
import { pricingTerms, combinedPercent, priced, percent } from "./pricing.js";
import { adjustedPrice, tradeSettings, planPayment } from "./settlement.js";

export function saleOffers(character, modifier = 1) {
  return [...(character?.items ?? [])].flatMap(item => {
    const copper = coinValue(item.system?.price);
    if (copper === null || !Number.isSafeInteger(item.system?.quantity) || item.system.quantity < 1) return [];
    if (!["weapon", "equipment", "consumable", "tool", "loot", "container"].includes(item.type)) return [];
    return [{ id: item.id, name: item.name, quantity: item.system.quantity,
      copper: adjustedPrice(copper, modifier), img: item.img }];
  });
}
export function purchaseOffers(merchant, character = null) {
  const terms = pricingTerms(merchant, character);
  return [...publicOffers(merchant), ...serviceOffers(merchant, character, { includeUnavailable: true })].map(item => {
    const combined = combinedPercent([terms.merchant, terms.character, terms.negotiation, item.serviceModifier ?? 0], terms.stacking);
    const copper = priced(item.copper, combined);
    return { ...item, originalCopper: item.copper, modifier: combined, copper, price: { value: copper, denomination: "cp" } };
  });
}
export function quoteTrade(merchant, character, request, edits = null, { settlement = true } = {}) {
  const settings = tradeSettings(merchant);
  const pricing = pricingTerms(merchant, character, edits?.pricing);
  const offers = [...publicOffers(merchant), ...serviceOffers(merchant, character)];
  const purchases = request.lines?.length ? sanitizeBasket(request.lines, offers).basket.map(row => {
    const offer=offers.find(o=>o.id===row.id);
    return offer.kind === "service" ? {...row, kind:"service", serviceId:offer.serviceId, serviceModifier:offer.serviceModifier, execution:offer.execution, saleUnit:offer.saleUnit, duration:offer.duration} : row;
  }) : [];
  const sales = request.sales?.length ? sanitizeBasket(request.sales, saleOffers(character, 1)).basket : [];
  if (!purchases.length && !sales.length) throw Error("The basket is empty.");
  const lines = [...purchases.map(row => ({ ...row, direction: "buy" })), ...sales.map(row => ({ ...row, direction: "sell" }))];
  for (const line of lines) {
    const edit = edits?.lines?.find(row => row.id === line.id && row.direction === line.direction);
    if (edit && (!Number.isSafeInteger(edit.quantity) || edit.quantity < 0 || edit.quantity > line.quantity)) throw Error("Invalid GM quantity.");
    line.quantity = edit?.quantity ?? line.quantity;
    line.percent = percent(edit?.percent ?? 0);
    line.originalCopper = line.copper;
    const factors = line.direction === "buy" ? [pricing.merchant, pricing.character, pricing.negotiation, pricing.review, line.percent, line.serviceModifier ?? 0]
      : [Math.round((settings.buyModifier - 1) * 10000) / 100, pricing.review, line.percent, line.serviceModifier ?? 0];
    line.finalModifier = combinedPercent(factors, pricing.stacking);
    line.copper = priced(line.originalCopper, line.finalModifier);
  }
  const basket = lines.filter(row => row.quantity > 0);
  if (!basket.length) throw Error("At least one item is required.");
  const sum = (direction, key) => basket.filter(r => r.direction === direction).reduce((n, r) => n + r.quantity * r[key], 0);
  const bought = sum("buy", "copper"), sold = sum("sell", "copper");
  const originalBought = sum("buy", "originalCopper"), originalSold = sum("sell", "originalCopper");
  if (![bought, sold, originalBought, originalSold].every(Number.isSafeInteger)) throw Error("Trade value is too large.");
  const total = bought - sold, originalTotal = originalBought - originalSold;
  const payment = settlement ? planPayment(character, merchant, total, settings) : null;
  return { basket, total, bought, sold, originalBought, originalSold, originalTotal,
    adjustment: total - originalTotal, discount: basket.filter(r => r.direction === "buy")
      .reduce((n, r) => n + Math.max(0, r.originalCopper - r.copper) * r.quantity, 0),
    pricing, finalModifier: combinedPercent([pricing.merchant, pricing.character, pricing.negotiation, pricing.review], pricing.stacking), payment, settings };
}

/** Full mechanical state participates in stacking; names/source IDs alone never establish equality. */
export function comparableItem(data) {
  const result = structuredClone(data);
  for (const key of ["_id", "_stats", "folder", "ownership", "sort"]) delete result[key];
  if (result.system) delete result.system.quantity;
  if (result.flags?.[MODULE_ID]) {
    delete result.flags[MODULE_ID].offer;
    if (!Object.keys(result.flags[MODULE_ID]).length) delete result.flags[MODULE_ID];
  }
  return result;
}
export function stable(value) {
  if (Array.isArray(value)) return JSON.stringify(value.map(v => JSON.parse(stable(v))));
  if (value && typeof value === "object") return JSON.stringify(Object.fromEntries(Object.keys(value).sort().map(k => [k, JSON.parse(stable(value[k]))])));
  return JSON.stringify(value ?? null);
}
export function transferable(item, actor) {
  if (item.system?.container || [...actor.items].some(child => child.system?.container === item.id)) {
    throw Error(`${item.name}: remove it from its container or empty its contents before trading.`);
  }
  if (item.system?.equipped || item.system?.attuned) throw Error(`${item.name}: unequip and unattune it before trading.`);
}
