import { MODULE_ID } from "../constants.js";
import { comparableItem, stable } from "./trade-model.js";

/** GM-side equivalence check. Only opaque Item IDs enter the public projection. */
export function markOfferGroups(actor, offers) {
  const groups = new Map();
  const items = new Map([...actor.items].map(item => [item.id, item]));
  const occupied = new Set([...actor.items].map(item => item.system?.container).filter(Boolean));
  return offers.map(offer => {
    const item = items.get(offer.id);
    if (item?.type !== "container" || occupied.has(item.id) || item.system?.container) return offer;
    const key = stable({ item: comparableItem(item.toObject()), offer: item.getFlag(MODULE_ID, "offer"),
      public: { ...offer, id: null, quantity: null } });
    if (!groups.has(key)) groups.set(key, offer.id);
    return { ...offer, stockGroup: groups.get(key) };
  });
}

/** Presentation only: Actor documents and checkout line identities remain separate. */
export function groupedOffers(offers) {
  const groups = new Map();
  for (const offer of offers) {
    const id = offer.stockGroup ?? offer.id;
    if (!groups.has(id)) groups.set(id, { ...offer, id, quantity: 0 });
    groups.get(id).quantity += offer.quantity;
  }
  return [...groups.values()];
}
export function basketMember(offers, basket, id, adding) {
  return offers.find(offer => (offer.stockGroup ?? offer.id) === id &&
    (adding ? (basket.get(offer.id) ?? 0) < offer.quantity : (basket.get(offer.id) ?? 0) > 0));
}
export function groupedBasket(offers, basket) {
  const rows = new Map();
  for (const offer of offers) {
    const count = basket.get(offer.id) ?? 0;
    if (!count) continue;
    const id = offer.stockGroup ?? offer.id;
    if (!rows.has(id)) rows.set(id, { ...offer, id, count: 0, subtotal: 0 });
    const row = rows.get(id);
    row.count += count;
    row.subtotal += count * offer.copper;
  }
  return [...rows.values()];
}
