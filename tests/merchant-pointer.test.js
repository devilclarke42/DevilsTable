import test from "node:test";
import assert from "node:assert/strict";
import { merchantPointerHandlers } from "../scripts/merchant/pointer-entry.js";

function fixture() {
  const token = { visible: true, isVisible: true, isPreview: false,
    document: { actorLink: true, getFlag: () => true },
    bounds: { contains: (x, y) => x >= 100 && x <= 200 && y >= 100 && y <= 200 } };
  const board = { ready: true, tokens: { placeables: [token] },
    canvasCoordinatesFromClient: p => ({ x: p.x / 2, y: p.y / 2 }) };
  board.activeLayer = board.tokens;
  const opened = [];
  return { token, board, opened, handlers: merchantPointerHandlers(board, t => opened.push(t)) };
}

test("right-click opens visible marked token without Actor access at zoomed coordinates", () => {
  const { token, opened, handlers } = fixture();
  const e = { button: 2, clientX: 300, clientY: 300 };
  handlers.pointerdown(e); handlers.pointerup(e);
  assert.deepEqual(opened, [token]);
  assert.equal(token.actor, undefined);
});

test("right drag, hidden token, other layer, left click and cancelled clicks do not open a shop", () => {
  const { token, board, opened, handlers } = fixture();
  const e = { button: 2, clientX: 300, clientY: 300 };
  handlers.pointerdown(e); handlers.pointerup({ ...e, clientX: 320 });
  token.isVisible = false; handlers.pointerdown(e); handlers.pointerup(e);
  token.isVisible = true; board.activeLayer = {}; handlers.pointerdown(e); handlers.pointerup(e);
  board.activeLayer = board.tokens;
  handlers.pointerdown({ ...e, button: 0 }); handlers.pointerup({ ...e, button: 0 });
  handlers.pointerdown(e); handlers.pointercancel(); handlers.pointerup(e);
  assert.equal(opened.length, 0);
});
