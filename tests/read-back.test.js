import test from "node:test";
import assert from "node:assert/strict";
import { matchesGenerated, generatedDifferences, readBackError } from "../scripts/builders/generated-fields.js";
import { planBuild } from "../scripts/builders/build-plan.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { createBuilder } from "../scripts/builders/compendium-builder.js";
import { loadCatalogue } from "../scripts/data/catalogue-loader.js";
import { catalogue, fixture, fakeAdapter, readJson } from "./helpers.js";

const withDescription = value => ({ system: { description: { value } } });

test("description comparison accepts equivalent quote entities and break-tag serialization", () => {
  const expected = withDescription("<p>A traveller&#39;s &quot;kit&quot;.<br>Next line.</p>");
  for (const html of [
    '<p>A traveller\'s "kit".<br />Next line.</p>',
    "<p>A traveller&apos;s &#34;kit&#34;.<br/>Next line.</p>",
    "<p>A traveller&#x27;s &#x22;kit&#x22;.<br>Next line.</p>",
    "<p>A traveller&#00039;s &#00034;kit&#00034;.<BR />Next line.</p>"
  ]) {
    assert.equal(matchesGenerated(withDescription(html), expected), true);
    assert.deepEqual(generatedDifferences(withDescription(html), expected), []);
  }
});

test("format equivalence is limited to description fields and never hides changed text or markup", () => {
  const expected = withDescription("<p>A traveller&#39;s pack.</p>");
  for (const html of ["<p>A traveller's sack.</p>", '<p class="hidden">A traveller\'s pack.</p>',
    "<div>A traveller's pack.</div>", "<p>A traveller's pack.<script>changed</script></p>",
    "<p>A traveller's  pack.</p>"]) {
    assert.equal(matchesGenerated(withDescription(html), expected), false);
  }
  assert.equal(matchesGenerated(withDescription("<p><b>pack</b></p>"), withDescription("<p>&lt;b&gt;pack&lt;/b&gt;</p>")), false);
  assert.equal(matchesGenerated(withDescription("<p>'</p>"), withDescription("<p>&amp;#39;</p>")), false);
  assert.equal(matchesGenerated({ name: "Traveller's Pack" }, { name: "Traveller&#39;s Pack" }), false);
  assert.equal(matchesGenerated({ system: { source: { custom: "Owner's" } } }, { system: { source: { custom: "Owner&#39;s" } } }), false);
});

test("all 144 production items reconcile after equivalent apostrophe serialization", async () => {
  const data = await loadCatalogue({ readJson });
  const expected = data.entries.map(({ item }) => catalogueEntryToItem(item));
  const saved = structuredClone(expected);
  for (const item of saved) item.system.description.value = item.system.description.value.replaceAll("&#39;", "'");
  const plan = planBuild(expected, saved);
  assert.equal(plan.unchanged, 144);
  assert.deepEqual(plan.update, []);
});

test("a simulated HTML save round-trip verifies and reruns without rewriting items", async () => {
  const data = await loadCatalogue({ readJson });
  const { adapter, state } = fakeAdapter({ hasPack: false });
  const create = adapter.create;
  adapter.create = async (pack, docs) => {
    const result = await create(pack, docs);
    for (const item of state.docs) item.system.description.value = item.system.description.value.replaceAll("&#39;", "'");
    return result;
  };
  const build = createBuilder({ load: () => data, adapter });
  assert.equal((await build({ dryRun: false })).written, 144);
  assert.equal((await build({ dryRun: false })).unchanged, 144);
  assert.equal(state.writes.length, 2);
  assert.equal(state.pack.locked, true);
});

test("prices, weights, capacities and identity metadata remain strictly compared", () => {
  const expected = catalogueEntryToItem(fixture);
  expected.system.capacity = { weight: { value: 30 }, volume: { value: 1 } };
  for (const mutate of [
    doc => { doc.system.price.value = 3; },
    doc => { doc.system.weight.value += 0.000000001; },
    doc => { doc.system.capacity.weight.value = 31; },
    doc => { doc.system.capacity.volume.value = 2; },
    doc => { doc._id = "changed"; },
    doc => { doc.flags["devils-table"].sourceId = "changed"; },
    doc => { doc.flags["devils-table"].shops.reverse(); }
  ]) {
    const saved = structuredClone(expected);
    mutate(saved);
    assert.equal(matchesGenerated(saved, expected), false);
    assert.ok(generatedDifferences(saved, expected).length > 0);
  }
});

test("genuine read-back failures identify the item and field, save details and restore the lock", async () => {
  const { adapter, state } = fakeAdapter();
  const create = adapter.create;
  adapter.create = async (pack, docs) => {
    const result = await create(pack, docs);
    state.docs[0].system.weight.value = 999;
    return result;
  };
  await assert.rejects(createBuilder({ load: catalogue, adapter })({ dryRun: false }), error => {
    assert.match(error.message, /Read-back verification failed for 1 item/);
    assert.match(error.message, /may be partial/);
    assert.deepEqual(error.details, [{
      path: "DT_ITEM_TEST_PARCEL.system.weight.value", message: "Test parcel: expected 0.25; saved 999."
    }]);
    return true;
  });
  assert.equal(state.summaries[0].status, "failed");
  assert.equal(state.summaries[0].details[0].path, "DT_ITEM_TEST_PARCEL.system.weight.value");
  assert.equal(state.pack.locked, true);
});

test("missing saved items and bounded reports remain actionable", () => {
  const doc = catalogueEntryToItem(fixture);
  const missing = readBackError([doc], []);
  assert.equal(missing.details[0].path, fixture.id);
  assert.match(missing.details[0].message, /missing from the saved compendium/);
  const expected = Array.from({ length: 30 }, (_, i) => ({ ...structuredClone(doc), _id: String(i) }));
  const saved = expected.map(item => ({ ...structuredClone(item), name: "Changed ".repeat(100) }));
  const bounded = readBackError(expected, saved);
  assert.equal(bounded.details.length, 21);
  assert.match(bounded.details.at(-1).message, /first 20/);
  assert.ok(bounded.details[0].message.length < 300);
});

test("cleanup failures retain the original mismatch details", async () => {
  const { adapter, state } = fakeAdapter();
  adapter.create = async (_pack, docs) => docs;
  state.hooks.configure = locked => { if (locked) throw new Error("Lock failed"); };
  await assert.rejects(createBuilder({ load: catalogue, adapter })({ dryRun: false }), error => {
    assert.ok(error instanceof AggregateError);
    assert.match(error.message, /restore the pack lock/);
    assert.equal(error.details[0].path, fixture.id);
    return true;
  });
});
