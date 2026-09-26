import test from "node:test";
import assert from "node:assert/strict";

test("opening a shop mounts a new ApplicationV2 window before requesting stock", async t => {
  const names = ["foundry", "game"];
  const previous = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  let app;
  const sent = [];
  class ApplicationV2 {
    rendered = false;
    async render(options = {}) {
      // Match Foundry's first-render contract instead of letting every render mount a window.
      if (!this.rendered && !options.force) return this;
      this.rendered = true;
      return this;
    }
    async _prepareContext() { return {}; }
  }
  globalThis.foundry = { applications: { api: {
    ApplicationV2, HandlebarsApplicationMixin: Base => Base
  } } };
  globalThis.game = { user: { id: "player" }, settings: { get: () => false },
    socket: { emit: (channel, msg) => { assert.equal(app.rendered, true); sent.push({ channel, msg }); } } };
  const { MerchantShopApplication } = await import("../scripts/merchant/shop-app.js");
  app = new MerchantShopApplication({ document: { id: "merchant-token", parent: { id: "scene" } } });
  await app.refreshStock();
  assert.equal(app.rendered, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].msg.type, "browse");
  assert.equal(sent[0].msg.tokenId, "merchant-token");
  assert.equal((await app._prepareContext({})).message, "Loading stock…");
});
