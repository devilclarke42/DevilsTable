import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "./helpers.js";

test("startup registers a restricted V2 menu and a read-only-default API without building", async t => {
  const names = ["foundry", "Hooks", "game", "canvas"];
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
  globalThis.Hooks = { once: (event, handler) => hooks.set(event, handler), on: () => {} };
  globalThis.canvas = { ready: false };
  globalThis.game = {
    modules: new Map([["devils-table", module]]), user: { isGM: true },
    socket: { on: () => {} },
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
  assert.equal(settings.length, 5);
  assert.equal(menus.length, 3);
  assert.equal(menus.find(menu => menu.key === "stockTableBuilder").config.restricted, true);
  assert.equal(menus.find(menu => menu.key === "merchantManager").config.restricted, true);
  assert.equal(menus.find(menu => menu.key === "stockTableBuilder").config.label, "Open RollTable Builder");
  assert.ok(menus.find(menu => menu.key === "compendiumBuilder").config.type.prototype instanceof ApplicationV2);
  assert.equal(Object.isFrozen(module.api), true);
  assert.deepEqual(module.api.openBuilder(), { force: true });
  assert.deepEqual(module.api.openStockBuilder(), { force: true });
  assert.equal(typeof module.api.rebuildStockTables, "function");
  assert.equal(typeof module.api.rollStock, "function");
  assert.equal(typeof module.api.cleanupLegacyStockTables, "function");
  t.mock.method(globalThis, "fetch", async url => ({
    ok: true, json: () => readJson(String(url).replace("modules/devils-table/", ""))
  }));
  const App = menus.find(menu => menu.key === "compendiumBuilder").config.type;
  const app = new App();
  const initial = await app._prepareContext({});
  assert.equal(initial.shop.id, "general-store");
  assert.equal(initial.count, 144);
  assert.equal(initial.categories.length, 10);
  assert.equal(initial.blocked, false);
  await App.DEFAULT_OPTIONS.actions.selectCategory.call(app, null, { dataset: { category: "fire-lighting" } });
  assert.equal((await app._prepareContext({})).count, 17);
  await App.DEFAULT_OPTIONS.actions.selectShop.call(app, null, { dataset: { shop: "alchemist" } });
  const alchemist = await app._prepareContext({});
  assert.equal(alchemist.count, 6);
  assert.equal(alchemist.allCategories, true);
  assert.equal(alchemist.shop.name, "Village Alchemist");
  const StockApp = menus.find(menu => menu.key === "stockTableBuilder").config.type;
  const stockApp = new StockApp();
  const stockContext = await stockApp._prepareContext({});
  assert.equal(stockContext.tableCount, 4);
  assert.equal(stockContext.setCount, 1);
  assert.equal(stockContext.oftenChance, 80);
  assert.equal(stockContext.rarelyChance, 15);
  assert.ok(StockApp.DEFAULT_OPTIONS.actions.rollStock);
  assert.ok(StockApp.DEFAULT_OPTIONS.actions.cleanup);
  assert.deepEqual(stockContext.profileChoices.map(profile => profile.name), ["Village General Store", "Town General Store", "City General Store", "Merchant Wagon"]);
  await StockApp.DEFAULT_OPTIONS.actions.selectProfile.call(stockApp, null, { dataset: { profile: "DT_TABLE_GS_WAGON" } });
  assert.equal((await stockApp._prepareContext({})).profiles[0].name, "Merchant Wagon");
  const wagonContext = await stockApp._prepareContext({});
  assert.match(wagonContext.scopeLabel, /^Merchant Wagon \/ /);
  assert.equal(wagonContext.categories.reduce((sum, category) => sum + category.count, 0), 133);
  assert.equal((await stockApp._prepareContext({})).tableCount, 4);
  await StockApp.DEFAULT_OPTIONS.actions.selectProfile.call(stockApp, null, { dataset: { profile: "" } });
  assert.equal((await stockApp._prepareContext({})).tableCount, 16);
  assert.equal((await stockApp._prepareContext({})).rollBlocked, true);
  await StockApp.DEFAULT_OPTIONS.actions.selectShop.call(stockApp, null, { dataset: { shop: "" } });
  assert.equal((await stockApp._prepareContext({})).tableCount, 32);
  assert.equal((await stockApp._prepareContext({})).rollBlocked, true);
  await StockApp.DEFAULT_OPTIONS.actions.selectShop.call(stockApp, null, { dataset: { shop: "general-store" } });
  await StockApp.DEFAULT_OPTIONS.actions.selectCategory.call(stockApp, null, { dataset: { category: "travel" } });
  assert.equal((await stockApp._prepareContext({})).tableCount, 4);
  globalThis.fetch = async () => ({ ok: false, status: 404 });
  const failed = await new App()._prepareContext({});
  assert.equal(failed.blocked, true);
  assert.match(failed.catalogueError, /HTTP 404/);
  game.user.isGM = false;
  assert.throws(() => module.api.openBuilder(), /Only a GM/);
  assert.throws(() => module.api.openStockBuilder(), /Only a GM/);
  assert.throws(() => module.api.openMerchantManager(), /Only a GM/);
  assert.ok(App.DEFAULT_OPTIONS.actions.preview);
  assert.ok(App.DEFAULT_OPTIONS.actions.build);
});
