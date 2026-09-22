import test from "node:test";
import assert from "node:assert/strict";

test("startup registers a restricted V2 menu and a read-only-default API without building", async t => {
  const names = ["foundry", "Hooks", "game"];
  const previous = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const hooks = new Map();
  const settings = [];
  const menus = [];
  const module = {};
  class ApplicationV2 {
    render(options) { return options; }
    async _prepareContext() { return {}; }
  }
  globalThis.foundry = {
    data: { fields: { BooleanField: class {}, StringField: class {} } },
    applications: { api: { ApplicationV2, HandlebarsApplicationMixin: Base => class extends Base {} } }
  };
  globalThis.Hooks = { once: (event, handler) => hooks.set(event, handler) };
  globalThis.game = {
    modules: new Map([["devils-table", module]]), user: { isGM: true },
    settings: {
      register: (namespace, key, config) => settings.push({ namespace, key, config }),
      registerMenu: (namespace, key, config) => menus.push({ namespace, key, config }),
      get: () => false
    }
  };
  await import("../scripts/main.js");
  assert.deepEqual([...hooks.keys()], ["init", "ready"]);
  hooks.get("init")();
  hooks.get("ready")();
  assert.equal(settings.length, 2);
  assert.equal(menus[0].config.restricted, true);
  assert.ok(menus[0].config.type.prototype instanceof ApplicationV2);
  assert.equal(Object.isFrozen(module.api), true);
  assert.deepEqual(module.api.openBuilder(), { force: true });
  game.user.isGM = false;
  assert.throws(() => module.api.openBuilder(), /Only a GM/);
  assert.ok(menus[0].config.type.DEFAULT_OPTIONS.actions.preview);
  assert.ok(menus[0].config.type.DEFAULT_OPTIONS.actions.build);
});
