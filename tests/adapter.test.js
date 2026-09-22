import test from "node:test";
import assert from "node:assert/strict";
import { createFoundryAdapter } from "../scripts/builders/foundry-adapter.js";
import { fixture } from "./helpers.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";

function environment(t) {
  const names = ["game", "CONFIG", "foundry"];
  const previous = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const seen = [];
  class ItemClass {
    constructor(data, context) { seen.push({ data, context }); this.system = { validate: options => seen.push(options) }; }
    validate(options) { seen.push(options); }
    static async createDocuments(data, options) { seen.push(options); data[0].name = "Hook changed"; return data; }
    static async updateDocuments(data, options) { seen.push(options); return data; }
  }
  globalThis.CONFIG = { Item: { documentClass: ItemClass } };
  globalThis.game = {
    user: { id: "gm", isGM: true }, users: { activeGM: { id: "gm" } },
    release: { generation: 14 }, system: { id: "dnd5e", version: "5.3.3" },
    packs: new Map(), settings: { set: async (...args) => { seen.push(args); } }
  };
  globalThis.foundry = { documents: { collections: { CompendiumCollection: {
    createCompendium: async metadata => { seen.push(metadata); return { metadata }; }
  } } } };
  return seen;
}

test("adapter enforces GM, active GM and exact runtime target", t => {
  environment(t);
  const adapter = createFoundryAdapter();
  assert.doesNotThrow(() => adapter.assertCanBuild());
  game.user.isGM = false;
  assert.throws(() => adapter.assertCanBuild(), /Only a GM/);
  game.user.isGM = true;
  game.users.activeGM.id = "other";
  assert.throws(() => adapter.assertCanBuild(), /active GM/);
  game.users.activeGM.id = "gm";
  game.system.version = "5.3.4";
  assert.throws(() => adapter.assertCanBuild(), /targets Foundry/);
  game.system.version = "5.3.3";
  game.release.generation = 13;
  assert.throws(() => adapter.assertCanBuild(), /targets Foundry/);
});
test("adapter preflights strict item and system models without persistence", async t => {
  const seen = environment(t);
  await createFoundryAdapter().validateDocuments([catalogueEntryToItem(fixture)]);
  assert.equal(seen.length, 3);
  assert.equal(seen[0].context.strict, true);
  assert.equal(seen[1].strict, true);
  assert.equal(seen[2].strict, true);
});
test("adapter refuses a non-world or wrong-system target", async t => {
  environment(t);
  const adapter = createFoundryAdapter();
  game.packs.set("world.devils-table-items", { documentName: "Item", metadata: { packageType: "module", system: "dnd5e" } });
  await assert.rejects(adapter.getPack(), /not a D&D5e world/);
  game.packs.get("world.devils-table-items").metadata = { packageType: "world", system: "dnd5e" };
  assert.ok(await adapter.getPack());
});
test("adapter detects invalid pack documents", async t => {
  environment(t);
  await assert.rejects(createFoundryAdapter().readPack({ getDocuments: async () => [], invalidDocumentIds: new Set(["bad"]) }), /invalid documents/);
});
test("document writes cannot mutate the expected source and keep IDs", async t => {
  const seen = environment(t);
  const doc = catalogueEntryToItem(fixture);
  await createFoundryAdapter().create({ collection: "world.devils-table-items" }, [doc]);
  assert.equal(doc.name, fixture.name);
  assert.equal(seen[0].keepId, true);
  assert.equal(seen[0].pack, "world.devils-table-items");
});
