import test from "node:test";
import assert from "node:assert/strict";

test("live search preserves focus and basket while matching tags and category labels from the GM", async () => {
  let listener, renders = 0, packet;
  globalThis.foundry = { applications: { api: { ApplicationV2: class {
    async render() { renders++; return this; } async _prepareContext() { return {}; }
  }, HandlebarsApplicationMixin: Base => Base } } };
  globalThis.game = { user: { id: "player", isGM: false }, settings: { get: () => false }, socket: {
    on(_channel, fn) { listener = fn; }, emit(_channel, msg, ack) { packet = msg; ack({}); }
  } };
  globalThis.canvas = { tokens: { controlled: [] } };
  const { initialiseMerchantService } = await import("../scripts/merchant/service.js");
  initialiseMerchantService();
  const { MerchantShopApplication } = await import("../scripts/merchant/shop-app.js");
  const app = new MerchantShopApplication({ document: { id: "t", actorId: "m", name: "Old Nan", parent: { id: "s" } } });
  await app.refreshStock();
  listener({ type: "stock", to: "player", id: packet.id, merchant: "Old Nan", availability: "open", items: [
    { id: "a", name: "Needle", description: "A fine point", tags: ["sewing"], category: "craft", categoryName: "Handicrafts", quantity: 3, copper: 9, originalCopper: 10 },
    {id:"service:DT_SERVICE_TEST",isService:true,kind:"service",name:"Advice",description:"Expert consultation",tags:["knowledge"],category:"expertise",categoryName:"Expertise",quantity:1,copper:20,originalCopper:20}
  ], categories: [{ id: "craft", name: "Handicrafts", icon: "icons/svg/item-bag.svg" }],
  catalogue: { id: "custom", name: "Custom Catalogue" }, pricing: { merchant: -10, character: 0, negotiation: 0, stacking: "additive" } });
  await new Promise(resolve => setImmediate(resolve));
  await MerchantShopApplication.DEFAULT_OPTIONS.actions.add.call(app, null, { dataset: { id: "a" } });
  const context = await app._prepareContext({});
  assert.equal(context.canAdmin, false);
  assert.equal(context.administration, null);
  await MerchantShopApplication.DEFAULT_OPTIONS.actions.toggleAdministration.call(app);
  assert.equal((await app._prepareContext({})).administrationOpen, false);
  assert.equal(context.catalogue.name, "Custom Catalogue"); assert.equal(context.categories[0].name, "Handicrafts");
  assert.equal(context.originalLabel, "1 sp"); assert.equal(context.adjustedLabel, "9 cp"); assert.equal(context.basket[0].count, 1);
  await MerchantShopApplication.DEFAULT_OPTIONS.actions.view.call(app,null,{dataset:{view:"services"}});
  let services=await app._prepareContext({});
  assert.equal(services.items.find(r=>r.id==="a").hidden,true);
  assert.equal(services.items.find(r=>r.isService).hidden,false);
  await MerchantShopApplication.DEFAULT_OPTIONS.actions.add.call(app,null,{dataset:{id:"service:DT_SERVICE_TEST"}});
  assert.equal((await app._prepareContext({})).basket.length,2);
  await MerchantShopApplication.DEFAULT_OPTIONS.actions.view.call(app,null,{dataset:{view:"inventory"}});
  const input = { addEventListener(_name, fn) { this.input = fn; } }, row = { dataset: { offerId: "a" } }, empty = {};
  app.element = { querySelector: selector => selector === "[name=search]" ? input : selector === "[data-no-matches]" ? empty : null,
    querySelectorAll: () => [row] };
  app._onRender({}, {}); const before = renders;
  for (const value of ["sewing", "handicrafts", "fine point", "needle"]) { input.input({ target: { value } }); assert.equal(row.hidden, false); }
  input.input({ target: { value: "no match" } }); assert.equal(row.hidden, true); assert.equal(empty.hidden, false);
  assert.equal(renders, before); assert.equal((await app._prepareContext({})).basket[0].count, 1);
});
