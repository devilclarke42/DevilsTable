import test from "node:test";
import assert from "node:assert/strict";
import { merchantPresentation, DEFAULT_MERCHANT_PORTRAIT, subscribePresentation, receivePresentation, registerPresentationUpdates } from "../scripts/merchant/presentation.js";

test("presentation projects only Actor portrait and availability, with a generic silhouette fallback", () => {
  const actor = { name: "PRIVATE ACTOR NAME", img: "portraits/old-nan.webp", type: "npc", system: { biography: "SECRET" },
    getFlag: () => ({ enabled: true, availability: "busy", gmNotes: "SECRET", relationships: { player: "SECRET" } }) };
  assert.deepEqual(merchantPresentation(actor), { portrait: "portraits/old-nan.webp", availability: "busy" });
  actor.img = ""; assert.equal(merchantPresentation(actor).portrait, DEFAULT_MERCHANT_PORTRAIT);
  delete actor.img; assert.equal(merchantPresentation(actor).portrait, DEFAULT_MERCHANT_PORTRAIT);
});
test("GM portrait and availability hooks notify matching viewers without reacting to private memory edits", () => {
  const hooks = new Map(); globalThis.Hooks = { on: (name, fn) => hooks.set(name, fn) };
  const actor = { id: "merchant", type: "npc", img: "new.webp", getFlag: () => ({ enabled: true, availability: "closed" }) };
  const messages = [], seen = []; let gm = true;
  const unsubscribe = subscribePresentation("merchant", packet => seen.push(packet));
  registerPresentationUpdates(() => gm, packet => messages.push(packet));
  hooks.get("updateActor")(actor, { flags: { "devils-table": { merchant: { relationships: { pc: {} } } } } });
  assert.equal(messages.length, 0);
  hooks.get("updateActor")(actor, { img: "new.webp" }); assert.equal(seen.length, 1); assert.equal(messages.length, 1);
  assert.deepEqual(Object.keys(messages[0]).sort(), ["actorId", "presentation", "type"]);
  hooks.get("updateActor")(actor, { "flags.devils-table.merchant.availability": "closed" }); assert.equal(messages.length, 2);
  gm = false; hooks.get("updateActor")(actor, { img: "other.webp" }); assert.equal(messages.length, 2);
  receivePresentation({ actorId: "other", presentation: { portrait: "other.webp", availability: "open" } }); assert.equal(seen.length, 2);
  unsubscribe(); receivePresentation(messages[0]); assert.equal(seen.length, 2);
});
test("player header uses the exact token name, updates live, and detaches when closed without accessing the Actor", async () => {
  const hooks = new Map(); let count = 0, renders = 0;
  globalThis.Hooks = { on(name, fn) { const id = ++count; hooks.set(id, { name, fn }); return id; }, off(_name, id) { hooks.delete(id); } };
  globalThis.foundry = { applications: { api: { ApplicationV2: class {
    rendered = true;
    async render() { renders++; return this; } async close() { this.rendered = false; return this; } async _prepareContext() { return {}; }
  }, HandlebarsApplicationMixin: Base => Base } } };
  const token = { document: { id: "token", actorId: "merchant", name: 'Old Nan <the Cook>', parent: { id: "scene" } } };
  Object.defineProperty(token, "actor", { get() { throw Error("Private Actor access"); } });
  globalThis.canvas = { tokens: { controlled: [] } };
  const { MerchantShopApplication } = await import("../scripts/merchant/shop-app.js");
  const shop = new MerchantShopApplication(token);
  assert.equal((await shop._prepareContext({})).merchant, 'Old Nan <the Cook>');
  receivePresentation({ actorId: "merchant", presentation: { portrait: "portraits/nan.webp", availability: "busy" } });
  assert.equal((await shop._prepareContext({})).portrait, "portraits/nan.webp");
  assert.equal((await shop._prepareContext({})).availability, "Busy");
  token.document.name = "Merrick Thorne";
  for (const hook of hooks.values()) hook.fn(token.document);
  assert.equal((await shop._prepareContext({})).merchant, "Merrick Thorne");
  const before = renders; await shop.close(); assert.equal(hooks.size, 0);
  receivePresentation({ actorId: "merchant", presentation: { portrait: "after-close.webp", availability: "open" } });
  assert.equal(renders, before);
});
