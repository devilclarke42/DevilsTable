import test from "node:test";
import assert from "node:assert/strict";
import { setup, Actor } from "./support/trade-world.js";

test("Shop disables checkout and does not send an unaffordable request", async () => {
  setup(); const pc = new Actor("pc", 0); pc.isOwner = true;
  globalThis.canvas = { tokens: { controlled: [{ actor: pc, document: { id: "pc-token" } }] } };
  foundry.applications = { api: { ApplicationV2: class {
    async _prepareContext() { return {}; } async render() { return this; }
  }, HandlebarsApplicationMixin: Base => Base } };
  const emitted = []; let listener;
  game.user = { id: "player", isGM: false };
  game.socket = { emit: (_channel, msg) => emitted.push(msg), on: (_channel, fn) => { listener = fn; } };
  const { initialiseMerchantService } = await import("../scripts/merchant/service.js"); initialiseMerchantService();
  const { MerchantShopApplication } = await import("../scripts/merchant/shop-app.js");
  const app = new MerchantShopApplication({ document: { id: "token", parent: { id: "scene" } } });
  await app.refreshStock();
  listener({ type: "stock", id: emitted[0].id, to: "player", merchant: "Merchant", availability: "open",
    items: [{ id: "rope", name: "Rope", description: "", category: "gear", quantity: 1, copper: 14 }] });
  await MerchantShopApplication.DEFAULT_OPTIONS.actions.add.call(app, null, { dataset: { id: "rope" } });
  const context = await app._prepareContext({}); assert.equal(context.canCheckout, false); assert.match(context.fundsError, /Not enough/);
  await MerchantShopApplication.DEFAULT_OPTIONS.actions.checkout.call(app); assert.equal(emitted.length, 1);
  pc.system.currency.cp = 14; assert.equal((await app._prepareContext({})).canCheckout, true);
});
