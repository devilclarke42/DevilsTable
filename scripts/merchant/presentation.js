import { merchantConfig } from "./model.js";

export const DEFAULT_MERCHANT_PORTRAIT = "icons/svg/mystery-man.svg";
const viewers = new Map();

/** Public allowlist only; never spread Actor data or merchant flags into a socket packet. */
export function merchantPresentation(actor) {
  return { portrait: typeof actor.img === "string" && actor.img.trim() ? actor.img : DEFAULT_MERCHANT_PORTRAIT,
    availability: merchantConfig(actor)?.availability ?? "closed" };
}
export function subscribePresentation(actorId, callback) {
  const callbacks = viewers.get(actorId) ?? new Set();
  callbacks.add(callback); viewers.set(actorId, callbacks);
  return () => { callbacks.delete(callback); if (!callbacks.size) viewers.delete(actorId); };
}
export function receivePresentation({ actorId, presentation }) {
  if (!presentation || typeof presentation.portrait !== "string" || typeof presentation.availability !== "string") return;
  for (const callback of viewers.get(actorId) ?? []) callback({ portrait: presentation.portrait, availability: presentation.availability });
}
/** Private Actor changes are projected by the GM; players need no Actor ownership. */
export function registerPresentationUpdates(isCoordinator, publish) {
  Hooks.on("updateActor", (actor, changed) => {
    if (!isCoordinator() || !merchantConfig(actor)) return;
    const nested = changed.flags?.["devils-table"]?.merchant ?? changed["flags.devils-table.merchant"];
    const hasStatus = nested && ("availability" in nested || "enabled" in nested);
    if (!("img" in changed) && !hasStatus && !("flags.devils-table.merchant.availability" in changed)
        && !("flags.devils-table.merchant.enabled" in changed)) return;
    const packet = { type: "presentation", actorId: actor.id, presentation: merchantPresentation(actor) };
    receivePresentation(packet); // The originating GM's local shop also updates.
    publish(packet);
  });
}
