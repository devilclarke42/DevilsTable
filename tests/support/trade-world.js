import { COINS } from "../../scripts/merchant/settlement.js";
const copy = value => structuredClone(value);
function get(obj, path) { return path.split('.').reduce((a,k) => a?.[k], obj); }
function set(obj, path, value) { const keys = path.split('.'); const leaf = keys.pop(); let base = obj; for (const key of keys) base = base[key] ??= {}; if (value === undefined) delete base[leaf]; else base[leaf] = copy(value); }
class Items extends Map {
  [Symbol.iterator]() { return this.values(); }
}
export class Item {
  constructor(data) { this.data = copy(data); }
  get id() { return this.data._id; } get name() { return this.data.name; } get type() { return this.data.type; }
  get system() { return this.data.system; }
  getFlag(ns, key) { return get(this.data.flags?.[ns], key); }
  toObject() { return copy(this.data); }
}
export class Actor {
  constructor(id, copper = 0, data = []) {
    this.id = id; this.name = id; this.type = id === "merchant" ? "npc" : "character";
    this.system = { currency: { cp: copper, sp: 0, ep: 0, gp: 0, pp: 0 } };
    this.flags = { "devils-table": { merchant: { enabled: true, availability: "open", settings: {}, relationships: {} } } };
    this.items = new Items(data.map(d => [d._id, new Item(d)]));
  }
  getFlag(ns, key) { return get(this.flags[ns], key); }
  async setFlag(ns, key, value) { set(this.flags[ns] ??= {}, key, value); return this; }
  async unsetFlag(ns, key) { set(this.flags[ns], key, undefined); }
  testUserPermission() { return true; }
  async update(data) { for (const [path,value] of Object.entries(data)) set(this, path, value); }
  async updateEmbeddedDocuments(_type, rows) { for (const row of rows) for (const [key, value] of Object.entries(row)) if (key !== "_id") set(this.items.get(row._id).data, key, value); }
  async createEmbeddedDocuments(_type, rows) { for (const row of rows) this.items.set(row._id, new Item(row)); return rows.map(r => this.items.get(r._id)); }
  async deleteEmbeddedDocuments(_type, ids) { ids.forEach(id => this.items.delete(id)); }
}
export function good(id = "rope", quantity = 1, price = 10) {
  return { _id: id, name: "Rope", type: "loot", img: "rope.webp", effects: [], flags: { "devils-table": { generatedBy: "devils-table" } },
    system: { quantity, price: { value: price, denomination: "cp" }, description: { value: "Rope" } } };
}
export function setup() {
  let count = 0;
  globalThis.CONST = { DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0, OWNER: 3 } };
  globalThis.foundry = { utils: { randomID: () => `new${++count}` } };
  globalThis.CONFIG = { Item: { documentClass: Item } };
  const gm = { id: "gm", isGM: true, active: true };
  globalThis.game = { user: gm, users: { activeGM: gm }, settings: { get: (_ns, key) => key === "debugLogging" ? false : "unlimited" } };
  // Pure helper stub; native 5.3.3 helper use is separately verified from upstream source.
  globalThis.dnd5e = { applications: { CurrencyManager: { getActorCurrencyUpdates(actor, amount) {
    const currency = { ...actor.system.currency }; let remainder = amount;
    for (const [key, value] of Object.entries(COINS).reverse()) {
      const count = Math.min(currency[key], Math.ceil(remainder / value));
      currency[key] -= count; remainder -= count * value;
      if (remainder <= 0) { currency.cp -= remainder; remainder = 0; break; }
    }
    return { system: { currency }, remainder, item: [] };
  } } } };
}
export function ledger() {
  const records = [];
  return { records, async create(record) { records.push(copy(record)); return { uuid: `Receipt.${records.length}`, index: records.length - 1 }; },
    async save(doc, record) { records[doc.index] = copy(record); } };
}
