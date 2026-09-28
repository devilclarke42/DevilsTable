import { MODULE_ID } from "../constants.js";
import { merchantConfig, ServiceSlots } from "./model.js";
export const merchantSlots = new ServiceSlots();
export const activeActorWrites = new Set();
const administration = new Set();
export const administrationBusy = id => administration.has(id);
export function assertAdministrator(actor, { allowUnconverted = false } = {}) {
  if (!game.user?.isGM || game.users.activeGM?.id !== game.user.id) throw Error("Only the active GM may administer inventory or cash.");
  if (actor?.type !== "npc") throw Error("Select a standard NPC Actor.");
  if (!allowUnconverted && !merchantConfig(actor)) throw Error("Enable this NPC as a merchant first.");
}
export async function withAdministration(actor, operation, options = {}) {
  assertAdministrator(actor, options);
  if (administration.has(actor.id) || activeActorWrites.has(actor.id) || merchantSlots.occupied(actor.id) || actor.getFlag(MODULE_ID, "transactionPending")) {
    throw Error("The merchant is serving a customer or needs recovery. Finish that operation first.");
  }
  administration.add(actor.id);
  try { return await operation(); }
  finally { administration.delete(actor.id); }
}
