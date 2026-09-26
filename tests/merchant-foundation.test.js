import test from "node:test";
import assert from "node:assert/strict";
import { appendHistory, publicOffers, sanitizeBasket, coinValue, merchantConfig, ServiceSlots } from "../scripts/merchant/model.js";

const item = (id, overrides = {}) => ({ id, name: `Offer ${id}`, type: "loot", img: "icon.webp",
  system: { quantity: 3, price: { value: 5, denomination: "sp" },
    description: { value: "<p>Safe public description.</p>" } },
  getFlag: (_scope, key) => ({ generatedBy: "devils-table", category: "containers", saleUnit: "one" })[key],
  ...overrides });

test("public projection reads embedded Items, hides arbitrary Item descriptions and never mutates stock", () => {
  const native = item("native", { name: "Private item", getFlag: () => undefined });
  const stock = [item("known"), native];
  const before = JSON.stringify(stock);
  const view = publicOffers({ items: stock });
  assert.equal(view.length, 1);
  assert.equal(view[0].description, "Safe public description.");
  assert.equal(view[0].copper, 50);
  assert.equal(JSON.stringify(stock), before);
});

test("GM recomputes basket against current stock and refuses duplicates, stale and unsafe totals", () => {
  const offers = publicOffers({ items: [item("a")] });
  assert.deepEqual(sanitizeBasket([{ id: "a", quantity: 2 }], offers).total, 100);
  assert.throws(() => sanitizeBasket([{ id: "a", quantity: 4 }], offers), /Stock has changed/);
  assert.throws(() => sanitizeBasket([{ id: "a", quantity: 1 }, { id: "a", quantity: 1 }], offers), /Invalid basket/);
  assert.equal(coinValue({ value: 2.5, denomination: "gp" }), 250);
  assert.equal(coinValue({ value: 0.001, denomination: "gp" }), null);
});

test("bounded history applies to approved and rejected decisions, without discarding unlimited history", () => {
  const history = Array.from({ length: 500 }, (_, id) => ({ id }));
  const bounded = appendHistory(history, { id: "rejected", status: "rejected" }, "last500");
  assert.equal(bounded.length, 500);
  assert.equal(bounded[0].id, 1);
  assert.equal(bounded.at(-1).id, "rejected");
  assert.equal(appendHistory(history, { id: 500 }, "unlimited").length, 501);
  assert.equal(merchantConfig({ type: "npc", getFlag: () => ({ enabled: true }) }).enabled, true);
});

test("two checkout requests share one GM-side slot; another merchant is independent", () => {
  const slots = new ServiceSlots();
  assert.equal(slots.acquire("merchant-a", "first"), true);
  assert.equal(slots.acquire("merchant-a", "second"), false);
  assert.equal(slots.acquire("merchant-b", "second"), true);
  assert.equal(slots.release("merchant-a", "second"), false);
  assert.equal(slots.occupied("merchant-a"), true);
  assert.equal(slots.release("merchant-a", "first"), true);
  assert.equal(slots.acquire("merchant-a", "second"), true);
});
