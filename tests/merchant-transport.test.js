import test from "node:test";
import assert from "node:assert/strict";
import { formatCopper } from "../scripts/merchant/currency.js";

test("cost display converts totals without changing coin accounting", () => {
  for (const [value, expected] of [[0,"0 cp"],[9,"9 cp"],[10,"1 sp"],[14,"1 sp 4 cp"],
    [99,"9 sp 9 cp"],[100,"1 gp"],[114,"1 gp 1 sp 4 cp"],[1000,"10 gp"]]) {
    assert.equal(formatCopper(value), expected);
  }
  assert.equal(formatCopper(-1), "Unavailable");
});

test("separate GM and player services relay public stock without player Actor access", async t => {
  const previous = globalThis.game;
  t.after(() => { globalThis.game = previous; });
  const gm = { id: "gm", isGM: true, active: true };
  const player = { id: "player", isGM: false, active: true };
  const users = [gm, player];
  const queue = [], handlers = new Map();
  let acknowledgements = 0;
  function client(user) {
    return { user, users, settings: { get: () => false }, socket: {
      on(channel, callback) { handlers.set(user.id, callback); },
      emit(channel, packet, acknowledge) {
        assert.equal(channel, "module.devils-table");
        assert.equal(typeof acknowledge, "function");
        acknowledgements++; acknowledge({});
        queue.push({ target: user.isGM ? "player" : "gm", packet });
      }
    } };
  }
  const gmGame = client(gm), playerGame = client(player);
  const actor = { id: "merchant", type: "npc", name: "Test Merchant",
    getFlag: () => ({ enabled: true, availability: "open" }),
    items: [{ id: "rope", name: "Rope", type: "loot", img: "rope.webp",
      system: { quantity: 3, price: { value: 14, denomination: "cp" } },
      getFlag: (_scope, key) => key === "offer" ? { publicDescription: "A rope." } : undefined }] };
  gmGame.actors = new Map([[actor.id, actor]]);
  gmGame.scenes = new Map([["scene", { tokens: new Map([["token", {
    actorId: actor.id, actorLink: true, getFlag: () => true
  }]]) }]]);
  // Any attempt to use the private merchant Actor on the player client fails this test.
  Object.defineProperty(playerGame, "actors", { get() { throw Error("Private Actors inaccessible"); } });
  const gmService = await import("../scripts/merchant/service.js?gm-transport-test");
  const playerService = await import("../scripts/merchant/service.js?player-transport-test");
  globalThis.game = gmGame; gmService.initialiseMerchantService();
  globalThis.game = playerGame; playerService.initialiseMerchantService();
  let result;
  playerService.merchantRequest("browse", { sceneId: "scene", tokenId: "token" }, msg => { result = msg; });
  while (queue.length) {
    const { target, packet } = queue.shift();
    globalThis.game = target === "gm" ? gmGame : playerGame;
    handlers.get(target)(structuredClone(packet));
    await new Promise(resolve => setImmediate(resolve));
  }
  assert.equal(result.merchant, "Test Merchant");
  assert.equal(result.items[0].name, "Rope");
  assert.equal(result.items[0].copper, 14);
  assert.equal(acknowledgements, 2);
  assert.equal(result.items[0].flags, undefined);
});
