import { MODULE_ID } from "../constants.js";

export const SOCKET_CHANNEL = `module.${MODULE_ID}`;
export const MERCHANT_FLAG = "merchant";
export const RETENTION = Object.freeze({ last100: 100, last500: 500, last1000: 1000, unlimited: Infinity });

/** GM-owned, in-memory service slot; read-only browsing never enters this map. */
export class ServiceSlots {
  #active = new Map();
  occupied(id) { return this.#active.has(id); }
  acquire(id, requestId) {
    if (this.#active.has(id)) return false;
    this.#active.set(id, requestId);
    return true;
  }
  release(id, requestId) {
    if (this.#active.get(id) !== requestId) return false;
    this.#active.delete(id);
    return true;
  }
  owns(id, requestId) { return this.#active.get(id) === requestId; }
}

export function merchantConfig(actor) {
  if (actor?.type !== "npc") return null;
  const flag = actor.getFlag?.(MODULE_ID, MERCHANT_FLAG);
  return flag?.enabled ? flag : null;
}

export function isMerchantToken(token) {
  return token?.document?.actorLink === true && token.document.getFlag?.(MODULE_ID, "merchantEntry") === true;
}

export function coinValue(price) {
  const values = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 };
  if (!price || !Number.isFinite(price.value) || price.value < 0 || !values[price.denomination]) return null;
  const copper = price.value * values[price.denomination];
  return Number.isSafeInteger(copper) ? copper : null;
}

export function publicOffers(actor) {
  const offers = [];
  for (const item of actor.items ?? []) {
    const quantity = Number(item.system?.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1) continue;
    const own = item.getFlag?.(MODULE_ID, "offer") ?? {};
    const canonical = item.getFlag?.(MODULE_ID, "generatedBy") === MODULE_ID;
    const price = Number.isSafeInteger(own.unitPrice) && own.unitPrice >= 0
      ? { value: own.unitPrice, denomination: "cp" } : item.system?.price;
    const value = coinValue(price);
    if (value === null) continue;
    // Non-catalogue items need a separately approved public description.
    if (!canonical && typeof own.publicDescription !== "string") continue;
    const raw = canonical ? item.system?.description?.value ?? "" : own.publicDescription;
    const description = String(raw).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1600);
    offers.push({ id: item.id, name: String(item.name).slice(0, 160), img: item.img,
      description, quantity, price: { value: price.value, denomination: price.denomination },
      copper: value, category: item.getFlag?.(MODULE_ID, "category") ?? item.type,
      saleUnit: item.getFlag?.(MODULE_ID, "saleUnit") ?? "each" });
  }
  return offers.sort((a, b) => a.name.localeCompare(b.name));
}

export function sanitizeBasket(lines, offers) {
  if (!Array.isArray(lines) || lines.length > 100) throw new Error("Basket is too large.");
  const byId = new Map(offers.map(item => [item.id, item]));
  const seen = new Set();
  const basket = [];
  for (const line of lines) {
    if (typeof line?.id !== "string" || seen.has(line.id) || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Invalid basket line.");
    }
    seen.add(line.id);
    const offer = byId.get(line.id);
    if (!offer || line.quantity > offer.quantity) throw new Error("Stock has changed; review your basket.");
    basket.push({ id: line.id, name: offer.name, quantity: line.quantity, copper: offer.copper });
  }
  if (!basket.length) throw new Error("Basket is empty.");
  const total = basket.reduce((sum, line) => sum + line.quantity * line.copper, 0);
  if (!Number.isSafeInteger(total)) throw new Error("Basket total is too large.");
  return { basket, total };
}

export function appendHistory(history, entry, policy = "last500") {
  const limit = RETENTION[policy] ?? RETENTION.last500;
  return [...(Array.isArray(history) ? history : []), entry].slice(-limit);
}
