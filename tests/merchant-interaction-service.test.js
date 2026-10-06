import test from "node:test";
import assert from "node:assert/strict";
import { setup, Actor, good } from "./support/trade-world.js";
import { journalPack } from "./support/journal-pack.js";

function world() {
  setup();
  const merchant = new Actor("merchant", 0, [good()]), character = new Actor("pc", 50);
  const gm = game.user, user = { id: "player", active: true, isGM: false };
  game.users = [gm, user]; game.users.activeGM = gm; game.users.get = id => game.users.find(u => u.id === id);
  game.actors = new Map([[merchant.id, merchant], [character.id, character]]);
  CONFIG.DND5E = { skills: { per: { label: "Persuasion" }, slt: { label: "Sleight of Hand" } } };
  CONFIG.queries = {};
  const { pack, docs } = journalPack(); game.packs = new Map([[pack.collection, pack]]);
  foundry.applications = { api: { ApplicationV2: class {
    async render() { return this; } async close() { this.closed = true; } async _prepareContext() { return {}; }
  }, HandlebarsApplicationMixin: Base => Base } };
  const errors = []; globalThis.ui = { notifications: { error: e => errors.push(e), info() {} } };
  game.i18n = { localize: value => value };
  return { merchant, character, user, docs, errors };
}
test("GM interaction review keeps DC private, honours an overridden result, and resolves only once", async () => {
  const { merchant, character, user, docs, errors } = world();
  const { interactionReview } = await import("../scripts/merchant/interaction-service.js");
  const messages = []; let released = 0, queries = 0;
  user.query = async (name, payload) => {
    queries++; assert.equal(name, "devils-table.interactionRoll");
    assert.deepEqual(payload, { id: "negotiate", characterId: "pc", skill: "per", kind: "negotiation" });
    return { total: 3 }; // Failed roll, but the GM may still grant a discount.
  };
  const app = await interactionReview({ actor: merchant, character, user,
    request: { id: "negotiate", userId: "player", kind: "negotiation" },
    verify: async () => {}, owns: () => !released, release: () => released++, notify: packet => messages.push(packet) });
  app.element = { querySelector: selector => ({ value: ({ "[name=skill]": "per", "[name=dc]": "19", "[name=outcome]": "success", "[name=interactionModifier]": "-15" })[selector] }) };
  const actions = app.constructor.DEFAULT_OPTIONS.actions;
  await Promise.all([actions.allowInteraction.call(app), actions.allowInteraction.call(app)]);
  assert.equal(queries, 1); assert.equal(docs.size, 0);
  const context = await app._prepareContext({}); assert.equal(context.interaction.result.dc, 19);
  assert.equal(context.interaction.result.success, false);
  await Promise.all([actions.resolveInteraction.call(app), actions.resolveInteraction.call(app)]);
  assert.deepEqual(errors, []); assert.equal(released, 1); assert.equal(docs.size, 1);
  assert.deepEqual(messages, [{ status: "interaction-complete", outcome: "success", kind: "negotiation" }]);
  assert.equal(merchant.getFlag("devils-table", "merchant.relationships.pc.negotiationModifier"), -15);
  assert.equal([...docs.values()][0].getFlag("devils-table", "transaction").quote.interaction.dc, 19);
});
test("GM can dismiss after availability or ownership changes without altering memory", async () => {
  const { merchant, character, user, docs, errors } = world();
  const { interactionReview } = await import("../scripts/merchant/interaction-service.js");
  let released = false;
  const app = await interactionReview({ actor: merchant, character, user, request: { id: "decline", kind: "theft", itemId: "rope" },
    verify: async () => {}, owns: () => !released, release: () => { released = true; }, notify() {} });
  await merchant.setFlag("devils-table", "merchant.availability", "closed"); character.testUserPermission = () => false;
  await app.close();
  assert.equal(released, true); assert.equal(app.closed, true); assert.deepEqual(errors, []);
  assert.equal([...docs.values()][0].getFlag("devils-table", "transaction").status, "closed");
  assert.equal(merchant.items.get("rope").system.quantity, 1);
  assert.equal(merchant.getFlag("devils-table", "merchant.relationships.pc"), undefined);
});
test("native player roll requires an outstanding interaction and caches duplicate queries", async () => {
  const { character, user } = world();
  const service = await import("../scripts/merchant/service.js");
  game.user = user; character.isOwner = true;
  const packets = []; game.socket = { emit: (_channel, packet) => packets.push(packet) };
  let rolls = 0;
  character.rollSkill = async (...args) => {
    rolls++; assert.deepEqual(args, [{ skill: "per" }, { configure: true }, { create: false }]);
    return [{ total: 17 }];
  };
  service.registerCheckoutProof();
  const handler = CONFIG.queries["devils-table.interactionRoll"];
  assert.equal(await handler({ id: "unsolicited", characterId: "pc", skill: "per", kind: "negotiation" }), null);
  const id = service.merchantRequest("interaction", { characterId: "pc", kind: "negotiation" }, () => {});
  const payload = { id, characterId: "pc", skill: "per", kind: "negotiation" };
  const { integrationManager } = await import("../scripts/integrations/manager.js");
  const presentations=[];const originalPresentation=integrationManager.present;
  integrationManager.present=async(...args)=>presentations.push(args);
  let results;
  try { results = await Promise.all([handler(payload), handler(payload)]); }
  finally { integrationManager.present=originalPresentation; }
  assert.equal(presentations.length,1);
  assert.equal(presentations[0][0],"dice-so-nice");
  assert.deepEqual(Object.keys(presentations[0][2]),["roll"]);
  assert.deepEqual(results, [{ total: 17 }, { total: 17 }]); assert.equal(rolls, 1);
  assert.equal(await handler({ ...payload, characterId: "other" }), null);
  assert.equal(packets[0].dc, undefined);
});
test("interaction holds the same merchant slot as checkout while other players browse", async () => {
  const { merchant, character, user } = world();
  const reviews = [], responses = []; let receive;
  const { MerchantReviewApplication } = await import("../scripts/merchant/review-app.js");
  const previous = MerchantReviewApplication.prototype.render;
  MerchantReviewApplication.prototype.render = async function () { reviews.push(this); return this; };
  try {
    game.scenes = new Map([["scene", { tokens: new Map([
      ["shop", { actorId: merchant.id, actorLink: true, getFlag: () => true }], ["pc-token", { actorId: character.id }]
    ]) }]]);
    game.socket = { on: (_channel, handler) => { receive = handler; }, emit: (_channel, packet, ack) => { responses.push(packet); ack?.({}); } };
    const service = await import("../scripts/merchant/service.js?interaction-lock"); service.initialiseMerchantService();
    const request = { id: "locked", type: "interaction", kind: "negotiation", userId: user.id, sceneId: "scene", tokenId: "shop", characterId: character.id, characterTokenId: "pc-token" };
    user.query = async () => request;
    receive(request);
    for (let n = 0; n < 20 && !reviews.length; n++) await new Promise(r => setTimeout(r, 5));
    assert.equal(reviews.length, 1);
    for (let n = 0; n < 5; n++) {
      receive({ ...request, id: `checkout${n}`, type: "checkout", lines: [{ id: "rope", quantity: 1 }], sales: [] });
      receive({ ...request, id: `browse${n}`, type: "browse" });
    }
    await new Promise(r => setImmediate(r));
    assert.equal(responses.filter(r => /occupied/.test(r.error)).length, 5);
    assert.equal(responses.filter(r => r.type === "stock").length, 5);
    assert.equal(merchant.items.get("rope").system.quantity, 1);
    await reviews[0].close();
    receive({ ...request, id: "after-close", type: "checkout", lines: [{ id: "rope", quantity: 1 }], sales: [] });
    await new Promise(r => setImmediate(r));
    assert.doesNotMatch(responses.at(-1).error ?? "", /occupied/);
  } finally { MerchantReviewApplication.prototype.render = previous; }
});
