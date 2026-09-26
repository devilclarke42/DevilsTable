import { isMerchantToken } from "./model.js";

/** Resolve scene coordinates with Foundry's public API, without reading the private Actor. */
export function merchantAtClientPoint(board, event) {
  if (!board?.ready || board.activeLayer !== board.tokens) return null;
  const point = board.canvasCoordinatesFromClient({ x: event.clientX, y: event.clientY });
  return [...board.tokens.placeables].reverse().find(token =>
    isMerchantToken(token) && token.isVisible && token.visible && !token.isPreview &&
    token.bounds.contains(point.x, point.y)) ?? null;
}

/** DOM events still arrive when Foundry does not permit the token's own right-click action. */
export function merchantPointerHandlers(board, open) {
  let pressed = null;
  return {
    pointerdown(event) {
      pressed = event.button === 2 ? { x: event.clientX, y: event.clientY,
        token: merchantAtClientPoint(board, event) } : null;
    },
    pointerup(event) {
      const start = pressed;
      pressed = null;
      if (event.button !== 2 || !start?.token ||
          Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
      const token = merchantAtClientPoint(board, event);
      if (token === start.token) open(token);
    },
    pointercancel() { pressed = null; },
    contextmenu(event) {
      if (merchantAtClientPoint(board, event)) event.preventDefault();
    }
  };
}
