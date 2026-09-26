import { MODULE_ID } from "../constants.js";
import { logger } from "../core/logger.js";
import { isMerchantToken } from "./model.js";
import { MerchantShopApplication } from "./shop-app.js";
import { merchantPointerHandlers } from "./pointer-entry.js";

let detach = () => {};
let openShop;
let lastOpen = 0;

export function openMerchantShop(token) {
  if (!isMerchantToken(token) || !token.visible || !token.isVisible) return;
  if (openShop?.tokenId === token.id && Date.now() - lastOpen < 300) return;
  lastOpen = Date.now();
  if (openShop?.rendered) void openShop.close();
  openShop = new MerchantShopApplication(token);
  openShop.tokenId = token.id;
  void openShop.refreshStock().catch(error => {
    logger.error("Could not open merchant", error);
    ui.notifications.error("Could not open the shop. See the browser console for details.");
  });
}

/** One canvas listener, replaced on scene changes; never changes token ownership or HUD classes. */
function attachCanvas() {
  detach();
  const element = canvas.app?.canvas ?? canvas.app?.view;
  if (!element?.addEventListener) return;
  const handlers = merchantPointerHandlers(canvas, openMerchantShop);
  for (const [name, handler] of Object.entries(handlers)) element.addEventListener(name, handler, true);
  detach = () => {
    for (const [name, handler] of Object.entries(handlers)) element.removeEventListener(name, handler, true);
    handlers.pointercancel();
  };
  logger.debug("Merchant canvas entry attached");
}

export function registerMerchantTokenEntry() {
  Hooks.on("canvasReady", attachCanvas);
  Hooks.on("canvasTearDown", () => detach());
  Hooks.on("createToken", async doc => {
    if (!game.user.isGM || !doc.actorLink || doc.getFlag(MODULE_ID, "merchantEntry")) return;
    if (doc.actor?.getFlag(MODULE_ID, "merchant")?.enabled) await doc.setFlag(MODULE_ID, "merchantEntry", true);
  });
  if (canvas?.ready) attachCanvas();
}
