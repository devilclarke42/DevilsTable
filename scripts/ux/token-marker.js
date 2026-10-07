import { MODULE_ID } from "../constants.js";
const markers = new WeakMap();
/** GM-local canvas decoration. No status effects, document flags or token image edits. */
export function updateMerchantTokenMarker(token) {
  let marker = markers.get(token);
  const merchant = game.user?.isGM && token.document?.actorLink && token.actor?.type === "npc"
    && token.actor.getFlag(MODULE_ID, "merchant")?.enabled;
  if (!merchant || token.destroyed) {
    if (marker && !marker.destroyed) { marker.parent?.removeChild(marker); marker.destroy(); }
    markers.delete(token); return;
  }
  if (!marker || marker.destroyed || marker.parent !== token) {
    if (marker && !marker.destroyed) marker.destroy();
    marker = new PIXI.Text("SHOP", {fontFamily:"Arial",fontSize:14,fontWeight:"bold",fill:0xffdf86,stroke:0x111111,strokeThickness:4});
    marker.eventMode = "none"; marker.anchor.set(1, 0); token.addChild(marker); markers.set(token, marker);
  }
  marker.position.set(Math.max(0, token.w - 3), 3);
  marker.scale.set(Math.min(1.25, Math.max(0.5, token.w / 100)));
  marker.visible = token.visible !== false;
}
export function registerMerchantTokenMarkers() {
  const update = token => { try { updateMerchantTokenMarker(token); } catch (error) { console.error("Devil's Table token marker", error); } };
  const refresh = () => { for (const token of globalThis.canvas?.tokens?.placeables ?? []) update(token); };
  Hooks.on("drawToken", update);
  Hooks.on("refreshToken", update);
  Hooks.on("updateActor", refresh);
  Hooks.on("updateToken", doc => { if (doc.object) update(doc.object); });
  Hooks.on("canvasReady", refresh);
  Hooks.on("destroyToken", token => {
    const marker = markers.get(token); if (marker && !marker.destroyed) marker.destroy(); markers.delete(token);
  });
  refresh();
}
