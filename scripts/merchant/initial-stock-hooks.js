import { MODULE_ID } from "../constants.js";
import { merchantConfig } from "./model.js";
import { stockItems, isStockItem } from "./inventory.js";
import { administrationBusy, activeActorWrites, merchantSlots, withAdministration } from "./operation-guard.js";
import { previewInitialFloat, applyInitialFloat } from "./economy.js";
import { logger } from "../core/logger.js";

/** Carry a first-stock hint with the native creation operation; it is never Item source data. */
export function registerInitialStockHooks() {
  Hooks.on("preCreateItem", (item, _data, options) => {
    const actor = item.parent;
    if (!game.user?.isGM || !merchantConfig(actor) || !isStockItem(item) || actor.getFlag(MODULE_ID, "merchant.initialFloat")) return;
    if (!stockItems(actor).length) options.devilsTableFirstStock = true;
  });
  Hooks.on("createItem", (item, options) => {
    const actor = item.parent;
    if (!options.devilsTableFirstStock || !game.user?.isGM || game.users.activeGM?.id !== game.user.id ||
        !merchantConfig(actor) || !isStockItem(item) || actor.getFlag(MODULE_ID, "merchant.initialFloat") ||
        administrationBusy(actor.id) || activeActorWrites.has(actor.id) || merchantSlots.occupied(actor.id)) return;
    void withAdministration(actor, async () => {
      const plan = await previewInitialFloat(actor, { hadStock: false });
      // The hint does not authorize overwriting an existing balance; planning preserves it.
      await applyInitialFloat(actor, plan, {
        [`flags.${MODULE_ID}.merchant.economy`]: plan.inputs,
        [`flags.${MODULE_ID}.merchant.administration.lastStockedAt`]: new Date().toISOString()
      });
    }).catch(error => {
      logger.error("Initial merchant float failed", error);
      ui.notifications.error(`Initial merchant cash could not be initialized: ${error.message}`);
    });
  });
}
