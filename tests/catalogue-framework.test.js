import test from "node:test";
import assert from "node:assert/strict";
import { CatalogueRegistry, matchesOffer, catalogueRegistry } from "../scripts/catalogues/registry.js";
import { registerCatalogueProvider, activateCatalogues } from "../scripts/catalogues/extensions.js";
import { loadCatalogue } from "../scripts/data/catalogue-loader.js";
import { validateCatalogue } from "../scripts/validation/catalogue-validator.js";
import { quoteTrade, purchaseOffers } from "../scripts/merchant/trade-model.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { readJson, fixture, fakeAdapter } from "./helpers.js";

const icon = "icons/svg/item-bag.svg";
const catalogue = { id: "test-provider", name: "Test Provider", icon, sort: 500,
  categories: ["visible", "empty", "secret"], fallbackCategory: { id: "other", name: "Other goods", icon }, metadata: {} };
const categories = ["visible", "empty", "secret"].map((id, sort) => ({ id, catalogue: catalogue.id, shop: catalogue.id,
  name: id === "visible" ? "Useful Things" : id, description: "Provider category.", plannedItems: [], icon, sort, visible: id !== "secret" }));
const actor = { getFlag: () => ({ catalogueId: catalogue.id }), items: [] };
const offers = [{ id: "a", name: "Thread", description: "For delicate repairs", tags: ["tailoring"], category: "visible", catalogues: [catalogue.id], quantity: 1 },
  { id: "b", name: "Hidden", category: "secret", catalogues: [catalogue.id], quantity: 1 },
  { id: "c", name: "Manual goods", category: "native", quantity: 1 },
  { id: "d", name: "Wrong shop", category: "visible", catalogues: ["elsewhere"], quantity: 1 }];

test("registered data drives sorted populated tabs, visibility, membership and compatible manual goods", () => {
  const r = new CatalogueRegistry(); r.register({ catalogues: [catalogue], categories });
  const view = r.project(actor, offers);
  assert.deepEqual(view.items.map(i => i.id), ["a", "c"]);
  assert.deepEqual(view.categories.map(c => c.name), ["Useful Things", "Other goods"]);
  for (const query of ["thread", "delicate", "tailoring", "useful things"]) assert.equal(matchesOffer(view.items[0], query), true);
  assert.equal(matchesOffer(view.items[0], "thread", "other"), false);
  const copy = r.list(); copy[0].name = "Changed"; assert.equal(r.get(catalogue.id).name, "Test Provider");
  assert.equal(offers[0].categoryName, undefined);
  assert.deepEqual(r.project(actor, []).categories, []);
});
test("bad or colliding registry bundles fail atomically", () => {
  const r = new CatalogueRegistry();
  assert.throws(() => r.register({ catalogues: [catalogue], categories: categories.slice(1) }), /Undefined/);
  assert.deepEqual(r.list(), []);
  r.register({ catalogues: [catalogue], categories });
  assert.throws(() => r.register({ catalogues: [catalogue], categories }), /duplicate/);
  assert.equal(r.list().length, 1);
});
test("active source excludes deferred Tavern while retaining every permanent identity", async () => {
  const data = await loadCatalogue({ readJson });
  assert.equal(data.entries.length, 144); assert.equal(data.ledger.ids.length, 296);
  assert.equal(data.index.deferredFiles.length, 19);
  assert.equal(validateCatalogue(data).valid, true);
  assert.ok(!data.entries.some(({ item }) => item.id.startsWith("DT_ITEM_TAV_")));
});
test("provider data builds once in the shared pack and hidden categories cannot be purchased", async () => {
  const item = { ...structuredClone(fixture), id: "DT_ITEM_TEST_PROVIDER_THREAD", name: "Provider Thread", category: "visible", shops: [catalogue.id] };
  registerCatalogueProvider("test-provider", { catalogues: [catalogue], categories, items: [item], reservedIds: [item.id],
    shops: [{ id: catalogue.id, name: "Provider Merchant", description: "A test merchant profile.", merchantNotes: {
      alwaysStocks: ["Thread"], oftenStocks: ["Needles"], rarelyStocks: ["Silk"] } }] });
  const data = await loadCatalogue({ readJson });
  assert.equal(validateCatalogue(data).valid, true);
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const build = createBuilder({ load: () => data, adapter });
  await build({ dryRun: false, shopId: catalogue.id }); assert.equal(state.docs.length, 1);
  await build({ dryRun: false }); assert.equal(state.docs.length, 145);
  assert.equal((await build({ dryRun: false })).unchanged, 145);
  activateCatalogues(data);
  const merchant = { type: "npc", getFlag: (_scope, key) => key === "merchant" ? { enabled: true, catalogueId: catalogue.id, settings: {} } : null,
    items: categories.filter(c => c.id !== "empty").map(c => ({ id: c.id, name: c.name, img: icon, type: "loot",
      system: { quantity: 1, price: { value: 1, denomination: "sp" }, description: { value: "Public" } },
      getFlag: (_scope, key) => ({ generatedBy: "devils-table", category: c.id, shops: [catalogue.id], tags: ["tailoring"] })[key] })) };
  assert.deepEqual(purchaseOffers(merchant).map(i => i.id), ["visible"]);
  assert.throws(() => quoteTrade(merchant, { items: [] }, { lines: [{ id: "secret", quantity: 1 }] }, null, { settlement: false }), /Stock has changed/);
  assert.equal(catalogueRegistry.project(merchant, purchaseOffers(merchant)).catalogue.name, "Test Provider");
});
