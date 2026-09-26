import test from "node:test";
import assert from "node:assert/strict";
import { previewMerchantStock, applyMerchantStock } from "../scripts/merchant/populate-stock.js";

function setup(t) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "game");
  t.after(() => { if (previous) Object.defineProperty(globalThis, "game", previous); else delete globalThis.game; });
  globalThis.game = { user: { id: "gm", isGM: true }, users: { activeGM: { id: "gm" } }, settings: { get: () => false } };
  const row = id => ({ id, name: id, quantity: 7, uuid: `Compendium.world.devils-table-items.Item.${id}` });
  const embedded = (id, quantity) => ({ system: { quantity }, getFlag: (_scope, key) => key === "sourceId" ? id : null });
  const actor = { id: "merchant", type: "npc", items: [embedded("existing", 2)],
    getFlag: () => ({ enabled: true }),
    async createEmbeddedDocuments(type, data) {
      assert.equal(type, "Item");
      for (const item of data) {
        assert.equal(item._id, undefined);
        this.items.push(embedded(item.flags["devils-table"].sourceId, item.system.quantity));
      }
    } };
  const roll = async () => ({ profileName: "Village", profileId: "DT_TABLE_GS", items: [row("existing"), row("new")] });
  const resolve = async uuid => ({ documentName: "Item", getFlag: () => uuid.split(".").at(-1),
    toObject: () => ({ _id: "original", name: "new", system: { quantity: 1 }, flags: { "devils-table": { sourceId: "new" } } }) });
  return { actor, roll, resolve };
}

test("population previews without writes, preserves existing quantities and does not duplicate on retry", async t => {
  const { actor, roll, resolve } = setup(t);
  const preview = await previewMerchantStock(actor, {}, { roll });
  assert.equal(actor.items.length, 1);
  assert.equal(preview.items[0].skip, true);
  assert.deepEqual(await applyMerchantStock(actor, preview, { resolve }), { created: 1, skipped: 1 });
  assert.equal(actor.items[0].system.quantity, 2);
  assert.equal(actor.items[1].system.quantity, 7);
  assert.deepEqual(await applyMerchantStock(actor, preview, { resolve }), { created: 0, skipped: 2 });
});

test("population checks role, actor target and missing source documents before writes", async t => {
  const { actor, roll } = setup(t);
  const preview = await previewMerchantStock(actor, {}, { roll });
  await assert.rejects(applyMerchantStock(actor, { ...preview, actorId: "wrong" }), /Invalid stock preview/);
  await assert.rejects(applyMerchantStock(actor, preview, { resolve: async () => null }), /Cannot resolve/);
  assert.equal(actor.items.length, 1);
  game.user.isGM = false;
  await assert.rejects(applyMerchantStock(actor, preview), /Only the active GM/);
});

test("a manual addition after preview is preserved and skipped at apply", async t => {
  const { actor, roll, resolve } = setup(t);
  const preview = await previewMerchantStock(actor, {}, { roll });
  actor.items.push({ system: { quantity: 22 }, getFlag: () => "new" });
  assert.deepEqual(await applyMerchantStock(actor, preview, { resolve }), { created: 0, skipped: 2 });
  assert.equal(actor.items[1].system.quantity, 22);
});

test("container population creates individual quantity-one Items and skips them on retry", async t => {
  const { actor, roll, resolve } = setup(t);
  const containers = async uuid => {
    const doc = await resolve(uuid);
    const data = doc.toObject(); data.type = "container";
    return { ...doc, toObject: () => structuredClone(data) };
  };
  const preview = await previewMerchantStock(actor, {}, { roll });
  assert.deepEqual(await applyMerchantStock(actor, preview, { resolve: containers }), { created: 1, skipped: 1 });
  assert.equal(actor.items.length, 8);
  assert.ok(actor.items.slice(1).every(item => item.system.quantity === 1));
  assert.deepEqual(await applyMerchantStock(actor, preview, { resolve: containers }), { created: 0, skipped: 2 });
  assert.equal(actor.items.length, 8);
});
