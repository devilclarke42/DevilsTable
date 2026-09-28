import { withAdministration } from "./operation-guard.js";
import { previewInitialFloat, assertFloatCurrent, applyInitialFloat } from "./economy.js";
import { MODULE_ID, PACK_COLLECTION } from "../constants.js";
import { rollStockList } from "../stock/stock-roller.js";
import { merchantConfig } from "./model.js";
import { logger } from "../core/logger.js";


function authorize(actor) {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) throw new Error("Only the active GM may populate stock.");
  if (!merchantConfig(actor)) throw new Error("Enable this NPC as a merchant first.");
}

function sourceIds(actor) {
  return new Set([...actor.items].map(item => item.getFlag(MODULE_ID, "sourceId")).filter(Boolean));
}

/** Roll once for a GM preview. Existing source identities, including zero-stock offers, are preserved. */
export async function previewMerchantStock(actor, scope, { roll = rollStockList, planFloat = previewInitialFloat } = {}) {
  authorize(actor);
  const stock = await roll(scope);
  const existing = sourceIds(actor);
  return { actorId: actor.id, float: await planFloat(actor, { profileId: stock.profileId }), profileName: stock.profileName, profileId: stock.profileId,
    items: stock.items.map(item => ({ ...item, skip: existing.has(item.id) })) };
}

/** Explicitly approved population only: copy referenced compendium Items into the existing NPC. */
export async function applyMerchantStock(actor, preview, { resolve = uuid => fromUuid(uuid) } = {}) {
  authorize(actor);
  if (preview?.actorId !== actor.id || !Array.isArray(preview.items) || preview.items.length > 500) {
    throw new Error("Invalid stock preview. Roll a new preview for this merchant.");
  }
  return withAdministration(actor, async () => {
    const float = preview.float ?? await previewInitialFloat(actor, { profileId: preview.profileId });
    assertFloatCurrent(actor, float);
    const seen = new Set();
    const existing = sourceIds(actor);
    const planned = [];
    for (const row of preview.items) {
      if (typeof row.id !== "string" || seen.has(row.id) || !Number.isSafeInteger(row.quantity) || row.quantity < 1 ||
          typeof row.uuid !== "string" || !row.uuid.startsWith(`Compendium.${PACK_COLLECTION}.Item.`)) {
        throw new Error("Invalid item reference or quantity in the stock preview.");
      }
      seen.add(row.id);
      if (row.skip || existing.has(row.id)) continue;
      const item = await resolve(row.uuid);
      if (item?.documentName !== "Item" || item.getFlag(MODULE_ID, "sourceId") !== row.id) {
        throw new Error(`Cannot resolve ${row.name}. Rebuild the Item compendium and roll a new preview.`);
      }
      const data = item.toObject();
      delete data._id;
      delete data.folder;
      delete data.ownership;
      data.system.quantity = row.quantity;
      data.flags ??= {};
      data.flags[MODULE_ID] ??= {};
      data.flags[MODULE_ID].offer = { origin: "generated", sourceUuid: row.uuid,
        stockProfileId: preview.profileId, restockEnabled: false };
      // Native D&D5e containers cannot stack: each is an independent embedded Item.
      const count = data.type === "container" ? row.quantity : 1;
      if (data.type === "container") data.system.quantity = 1;
      planned.push({ sourceId: row.id, data, count });
    }
    // Re-read after asynchronous resolution; manual additions since preview must not be duplicated.
    authorize(actor);
    assertFloatCurrent(actor, float);
    const current = sourceIds(actor);
    const additions = planned.filter(row => !current.has(row.sourceId));
    if (additions.length) {
      await actor.createEmbeddedDocuments("Item", additions.flatMap(row =>
        Array.from({ length: row.count }, () => structuredClone(row.data))));
      for (const { sourceId, data, count } of additions) {
        const found = actor.items.filter(item => item.getFlag(MODULE_ID, "sourceId") === sourceId);
        if (found.length !== count || found.some(item => item.system.quantity !== data.system.quantity)) {
          throw new Error("Stock read-back failed. Some additions may have succeeded; review inventory before retrying. Existing source IDs will be skipped.");
        }
      }
    }
    if (additions.length) {
      await applyInitialFloat(actor, float, {
        [`flags.${MODULE_ID}.merchant.economy`]: float.inputs,
        [`flags.${MODULE_ID}.merchant.administration.lastStockedAt`]: new Date().toISOString()
      });
    }
    logger.debug("Merchant stock populated", { merchant: actor.id, created: additions.length, profile: preview.profileId });
    return { created: additions.length, skipped: preview.items.length - additions.length };
  });
}
