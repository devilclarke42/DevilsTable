import test from "node:test";
import assert from "node:assert/strict";
import { compileSchema } from "../scripts/validation/schema-validator.js";
import { loadCatalogue, readModuleJson } from "../scripts/data/catalogue-loader.js";
import { validateCatalogue } from "../scripts/validation/catalogue-validator.js";
import { catalogue, fixture, readJson } from "./helpers.js";

test("empty production catalogue validates without including fixtures", async () => {
  const data = await loadCatalogue({ readJson });
  const result = validateCatalogue(data);
  assert.equal(result.valid, true);
  assert.equal(result.count, 0);
  assert.match(result.warnings[0], /empty/);
});

test("valid fixture supports multiple shops and adjusted pounds", async () => {
  assert.equal(validateCatalogue(await catalogue()).valid, true);
});

for (const field of Object.keys(fixture)) {
  test(`required field: ${field}`, async () => {
    const data = await catalogue();
    delete data.entries[0].item[field];
    assert.equal(validateCatalogue(data).valid, false);
  });
}

const invalid = {
  "malformed permanent ID": item => { item.id = "rope"; },
  "negative weight": item => { item.weight.value = -1; },
  "non-numeric weight": item => { item.weight.value = "1"; },
  "nonfinite price": item => { item.price.value = Infinity; },
  "negative price": item => { item.price.value = -1; },
  "unknown currency": item => { item.price.denomination = "gold"; },
  "blank description": item => { item.description = "   "; },
  "unknown shop": item => { item.shops = ["unknown"]; },
  "empty shops": item => { item.shops = []; },
  "duplicate shop tags": item => { item.shops = ["tavern", "tavern"]; },
  "unknown category": item => { item.category = "unknown"; },
  "duplicate tags": item => { item.tags = ["test", "test"]; },
  "remote icon": item => { item.icon = "https://example.com/icon.png"; },
  "icon traversal": item => { item.icon = "icons/../secret.png"; },
  "unknown property": item => { item.prcie = 10; },
  "unsupported mechanics": item => { item.mechanics.type = "weapon"; },
  "unexplained weight": item => { item.weight.notes = ""; },
  "unsupported units": item => { item.weight.units = "kg"; },
  "missing source license": item => { delete item.source.license; }
};
for (const [label, mutate] of Object.entries(invalid)) {
  test(`rejects ${label}`, async () => {
    const data = await catalogue();
    mutate(data.entries[0].item);
    assert.equal(validateCatalogue(data).valid, false);
  });
}

test("duplicates are detected across files", async () => {
  const data = await catalogue([fixture, fixture]);
  data.entries[1].location = "other-file.json[0]";
  assert.ok(validateCatalogue(data).errors.some(e => /Duplicate/.test(e.message)));
});
test("unreserved IDs and malformed ledgers are rejected", async () => {
  const data = await catalogue();
  data.ledger.ids = [];
  assert.equal(validateCatalogue(data).valid, false);
  data.ledger = null;
  assert.equal(validateCatalogue(data).valid, false);
});
test("null items yield validation errors rather than crashes", async () => {
  assert.equal(validateCatalogue(await catalogue([null])).valid, false);
});
test("retired IDs stay reserved", async () => {
  const data = await catalogue([]);
  data.ledger.ids.push(fixture.id);
  assert.equal(validateCatalogue(data).valid, true);
  assert.ok(validateCatalogue(data).warnings.some(text => /inactive/.test(text)));
});
test("registry blocks traversal before fetching item files", async () => {
  const visited = [];
  await assert.rejects(loadCatalogue({ readJson: async path => {
    visited.push(path);
    const value = await readJson(path);
    if (path === "data/catalogue.json") value.files = ["../../private.json"];
    return value;
  } }), /required format/);
  assert.ok(!visited.includes("../../private.json"));
});
test("loader rejects a non-array source file", async () => {
  await assert.rejects(loadCatalogue({ readJson: path => path.includes("data/items/") ? {} : readJson(path) }), /expected an array/);
});
test("HTTP and parse failures name the source file", async t => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false, status: 404 }));
  await assert.rejects(readModuleJson("missing.json"), /missing.json: HTTP 404/);
  globalThis.fetch = async () => ({ ok: true, json: () => { throw new Error("bad"); } });
  await assert.rejects(readModuleJson("broken.json"), /Invalid JSON in broken.json/);
});
test("schema compiler rejects unsupported constraints rather than ignoring them", () => {
  assert.throws(() => compileSchema({ type: "string", format: "email" }), /Unsupported schema keyword/);
  assert.throws(() => compileSchema({ type: "anything" }), /Unsupported schema type/);
});
test("schema catches extra nested fields and zero remains a valid weight", async () => {
  const data = await catalogue();
  data.entries[0].item.weight.value = 0;
  assert.equal(validateCatalogue(data).valid, true);
  data.entries[0].item.weight.extra = true;
  assert.equal(validateCatalogue(data).valid, false);
});
test("5,000-item catalogue validates with unique document identities", async () => {
  const items = Array.from({ length: 5000 }, (_, i) => ({ ...fixture, id: `DT_ITEM_TEST_SCALE_${i}` }));
  assert.equal(validateCatalogue(await catalogue(items)).valid, true);
});
