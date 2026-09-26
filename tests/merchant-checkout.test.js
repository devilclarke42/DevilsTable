import test from "node:test";
import assert from "node:assert/strict";
import { setup, Actor, good } from "./support/trade-world.js";

let currentReviews;
function journalPack() {
  const docs = new Map();
  const index = new Map(); index[Symbol.iterator] = function () { return this.values(); };
  const pack = { documentName: "JournalEntry", metadata: { packageType: "world" }, collection: "world.devils-table-transactions", index,
    testUserPermission: () => false, configure: async () => {}, getIndex: async () => index, getDocument: async id => docs.get(id) };
  globalThis.CONFIG.JournalEntry = { documentClass: { async create(data) {
    if (docs.has(data._id)) throw Error("Duplicate receipt ID");
    const doc = { uuid: `Compendium.${pack.collection}.JournalEntry.${data._id}`, data: structuredClone(data),
      pages: [{ id: "page" }], getFlag: (ns, key) => doc.data.flags[ns][key],
      async update(change) { if (change["flags.devils-table.transaction"]) doc.data.flags["devils-table"].transaction = structuredClone(change["flags.devils-table.transaction"]); },
      async updateEmbeddedDocuments() {} };
    docs.set(data._id, doc); index.set(data._id, { _id: data._id, flags: doc.data.flags }); return doc;
  } } };
  return { pack, docs };
}
for (const count of [2, 3, 5]) test(`${count} checkout clients: one GM review, browsing continues, approval transfers once`, async () => {
  setup(); const merchant = new Actor("merchant", 0, [good("rope", 1)]);
  const players = Array.from({ length: count }, (_, i) => ({ id: `user${i}`, active: true, isGM: false }));
  const pcs = players.map((p, i) => new Actor(`pc${i}`, 50));
  const gm = game.user; const users = [gm, ...players]; users.get = id => users.find(u => u.id === id); users.activeGM = gm;
  game.users = users; game.actors = new Map([[merchant.id, merchant], ...pcs.map(pc => [pc.id, pc])]);
  const tokens = new Map([["merchant-token", { actorId: merchant.id, actorLink: true, getFlag: () => true }], ...pcs.map(pc => [pc.id, { actorId: pc.id }])]);
  game.scenes = new Map([["scene", { tokens }]]);
  const { pack, docs } = journalPack(); game.packs = new Map([[pack.collection, pack]]);
  const responses = [], reviews = [], errors = [];
  currentReviews = reviews;
  let receive;
  game.socket = { on: (_channel, handler) => { receive = handler; }, emit: (_channel, message, ack) => { responses.push(message); ack?.({}); } };
  globalThis.ui = { notifications: { error: msg => errors.push(msg), info: () => {} } };
  foundry.applications = { api: { ApplicationV2: class { async render() { if (!currentReviews.includes(this)) currentReviews.push(this); return this; } async close() {} }, HandlebarsApplicationMixin: Base => Base } };
  const service = await import(`../scripts/merchant/service.js?checkout-${count}`); service.initialiseMerchantService();
  const packets = players.map((p,i) => ({ id: `request-${count}-${i}`, userId: p.id, type: "checkout", sceneId: "scene", tokenId: "merchant-token", characterId: pcs[i].id,
    characterTokenId: pcs[i].id, lines: [{ id: "rope", quantity: 1 }], sales: [] }));
  players.forEach((p,i) => { p.query = async () => structuredClone(packets[i]); });
  if (count === 2) {
    pcs[0].system.currency.cp = 0; receive(packets[0]);
    await new Promise(r => setImmediate(r));
    assert.match(responses.at(-1).error, /enough money/); assert.equal(reviews.length, 0);
    pcs[0].system.currency.cp = 50;
    players[0].query = async () => null; receive(packets[0]);
    await new Promise(r => setImmediate(r));
    assert.match(responses.at(-1).error, /could not confirm/); assert.equal(reviews.length, 0);
    players[0].query = async () => structuredClone(packets[0]);
  }
  packets.forEach(packet => receive(packet));
  for (let n = 0; n < 20 && !reviews.length; n++) await new Promise(r => setTimeout(r, 5));
  assert.equal(reviews.length, 1); assert.equal(responses.filter(r => /occupied/.test(r.error)).length, count - 1);
  players.forEach((p,i) => receive({ type: "browse", id: `browse${i}`, userId: p.id, sceneId: "scene", tokenId: "merchant-token" }));
  await new Promise(r => setImmediate(r)); assert.equal(responses.filter(r => r.type === "stock").length, count);
  reviews[0].element = { querySelectorAll: () => [{ dataset: { id: "rope", direction: "buy" }, querySelector: selector => ({ value: selector.includes("quantity") ? "1" : "10" }) }] };
  await reviews[0].constructor.DEFAULT_OPTIONS.actions.approve.call(reviews[0]);
  assert.deepEqual(errors, []); assert.equal(responses.filter(r => r.status === "approved").length, 1);
  assert.equal(merchant.items.get("rope").system.quantity, 0); assert.equal(pcs[0].system.currency.cp, 40);
  const completed = [...docs.values()][0].getFlag("devils-table", "transaction");
  assert.equal(completed.status, "completed");
  const { createReceipt } = await import("../scripts/merchant/ledger.js");
  await assert.rejects(createReceipt(completed), /already has a receipt/);
  if (count === 2) {
    merchant.items.get("rope").data.system.quantity = 1;
    const next = { ...packets[1], id: "rejected-new" }; players[1].query = async () => structuredClone(next);
    receive(next); for (let n = 0; n < 20 && reviews.length < 2; n++) await new Promise(r => setTimeout(r, 5));
    await reviews[1].constructor.DEFAULT_OPTIONS.actions.reject.call(reviews[1]);
    assert.equal(merchant.items.get("rope").system.quantity, 1); assert.equal(pcs[1].system.currency.cp, 50);
    assert.equal([...docs.values()].filter(d => d.getFlag("devils-table", "transaction").status === "rejected").length, 1);
  }
});
