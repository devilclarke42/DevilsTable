import { MODULE_ID } from "../constants.js";
/** Shared offer policy. Rules live on GM-owned stock/offering flags, never in public payloads. */
export function validateVisibility(input = {mode:"public"}) {
  if (!input || typeof input !== "object" || Array.isArray(input) ||
      Object.keys(input).some(k=>!["mode","minPurchases","revealed"].includes(k)) ||
      !["public","hidden","relationship"].includes(input.mode) ||
      (input.revealed!==undefined && typeof input.revealed!=="boolean") ||
      (input.minPurchases!==undefined && (!Number.isSafeInteger(input.minPurchases)||input.minPurchases<1||input.minPurchases>1000000))) throw Error("Invalid offer visibility policy.");
  return {mode:input.mode,minPurchases:input.minPurchases??3,revealed:input.revealed??false};
}
export function visibleOffer(merchant, character, policy) {
  if (policy === undefined) return true;
  try { validateVisibility(policy); } catch { return false; } // Invalid saved policies fail closed.
  if (policy.mode === "public" || policy.revealed === true) return true;
  if (policy.mode === "hidden") return false;
  if (merchant.getFlag?.(MODULE_ID,"merchant.settings")?.restrictedOffers === true) return true;
  if (!character?.id) return false;
  const memory=merchant.getFlag?.(MODULE_ID,`merchant.relationships.${character.id}`);
  return Number.isSafeInteger(memory?.successfulPurchases) && memory.successfulPurchases >= (policy.minPurchases ?? 3);
}
