import { MODULE_ID } from "../constants.js";
import { coinValue, publicOffers, sanitizeBasket } from "./model.js";
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
export function purchaseOffers(merchant) {
  return publicOffers(merchant).map(item => {
    const copper = adjustedPrice(item.copper, tradeSettings(merchant).sellModifier);
    return { ...item, copper, price: { value: copper, denomination: "cp" } };
  });
}
export function quoteTrade(merchant, character, request, edits = null) {
  const settings = tradeSettings(merchant);
  const purchases = request.lines?.length ? sanitizeBasket(request.lines, purchaseOffers(merchant)).basket : [];
  const sales = request.sales?.length ? sanitizeBasket(request.sales, saleOffers(character, settings.buyModifier)).basket : [];
  if (!purchases.length && !sales.length) throw Error("The basket is empty.");
  const lines = [...purchases.map(row => ({ ...row, direction: "buy" })), ...sales.map(row => ({ ...row, direction: "sell" }))];
  for (const line of lines) {
    const edit = edits?.find(row => row.id === line.id && row.direction === line.direction);
    if (edit) {
      if (!Number.isSafeInteger(edit.quantity) || edit.quantity < 0 || edit.quantity > line.quantity ||
          !Number.isSafeInteger(edit.copper) || edit.copper < 0) throw Error("Invalid GM price or quantity.");
      line.quantity = edit.quantity; line.copper = edit.copper;
    }
  }
  const basket = lines.filter(row => row.quantity > 0);
  if (!basket.length) throw Error("At least one item is required.");
  const bought = basket.filter(r => r.direction === "buy").reduce((n, r) => n + r.quantity * r.copper, 0);
  const sold = basket.filter(r => r.direction === "sell").reduce((n, r) => n + r.quantity * r.copper, 0);
  if (![bought, sold].every(Number.isSafeInteger)) throw Error("Trade value is too large.");
  const total = bought - sold;
  const payment = planPayment(character, merchant, total, settings);
  return { basket, total, bought, sold, payment, settings };
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
