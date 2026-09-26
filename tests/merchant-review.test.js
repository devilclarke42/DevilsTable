import test from "node:test";
import assert from "node:assert/strict";

test("reject saves private history, releases checkout, and survives a failed write", async t => {
  const originals = new Map(["game", "foundry", "ui"].map(key => [key, globalThis[key]]));
  t.after(() => { for (const [key, value] of originals) globalThis[key] = value; });
  let review, fail = true, saves = 0;
  const errors = [], replies = [];
  class ApplicationV2 {
    async render() { review = this; return this; }
    async close() { this.closed = true; }
  }
  globalThis.foundry = { applications: { api: { ApplicationV2, HandlebarsApplicationMixin: Base => Base } } };
  globalThis.ui = { notifications: { error: message => errors.push(message) } };
  const gm = { id: "gm", isGM: true, active: true };
  const users = [gm]; users.get = id => users.find(user => user.id === id);
  let flag = { enabled: true, availability: "open", history: [], relationships: { pc: { state: "trusted" } } };
  const actor = { id: "merchant", type: "npc", name: "Merchant", getFlag: () => flag,
    items: [{ id: "rope", name: "Rope", system: { quantity: 2, price: { value: 1, denomination: "sp" } },
      getFlag: (_ns, key) => key === "offer" ? { publicDescription: "Rope" } : undefined }],
    async setFlag(namespace, key, history) {
      assert.equal(namespace, "devils-table"); assert.equal(key, "merchant.history");
      saves++;
      await new Promise(resolve => setImmediate(resolve));
      if (fail) throw Error("Example Actor write failure");
      flag.history = history;
    }
  };
  const character = { id: "pc", testUserPermission: () => true };
  globalThis.game = { user: gm, users, settings: { get: () => "last500" },
    actors: new Map([[actor.id, actor], [character.id, character]]),
    scenes: new Map([["scene", { tokens: new Map([
      ["merchant-token", { actorId: actor.id, actorLink: true, getFlag: () => true }],
      ["pc-token", { actorId: character.id }]
    ]) }]]) };
  const service = await import("../scripts/merchant/service.js?review-test");
  const request = () => service.merchantRequest("checkout", { sceneId: "scene", tokenId: "merchant-token",
    characterId: "pc", characterTokenId: "pc-token", lines: [{ id: "rope", quantity: 1 }] }, msg => replies.push(msg));
  request();
  for (let i = 0; i < 20 && !review; i++) await new Promise(resolve => setTimeout(resolve, 5));
  assert.ok(review);
  const reject = review.constructor.DEFAULT_OPTIONS.actions.reject;
  await Promise.all([reject.call(review), reject.call(review)]);
  assert.equal(saves, 1);
  assert.match(errors[0], /Example Actor write failure/);
  assert.equal(review.closed, undefined);
  assert.equal(replies.at(-1).status, "pending");
  fail = false;
  await reject.call(review);
  assert.equal(flag.history.length, 1);
  assert.equal(flag.history[0].status, "rejected");
  assert.equal(flag.relationships.pc.state, "trusted");
  assert.equal(replies.at(-1).status, "rejected");
  assert.equal(review.closed, true);
  request();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(replies.at(-1).status, "pending");
  await review.close();
  assert.equal(replies.at(-1).status, "close");
});
