import { MODULE_ID, PACK_COLLECTION } from "../constants.js";
import { rollStockList } from "../stock/stock-roller.js";
import { merchantConfig } from "./model.js";
import { logger } from "../core/logger.js";

const busy = new Set();

function authorize(actor) {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) throw new Error("Only the active GM may populate stock.");
  if (!merchantConfig(actor)) throw new Error("Enable this NPC as a merchant first.");
}

function sourceIds(actor) {
  return new Set([...actor.items].map(item => item.getFlag(MODULE_ID, "sourceId")).filter(Boolean));
}

/** Roll once for a GM preview. Existing source identities, including zero-stock offers, are preserved. */
export async function previewMerchantStock(actor, scope, { roll = rollStockList } = {}) {
  authorize(actor);
  const stock = await roll(scope);
  const existing = sourceIds(actor);
  return { actorId: actor.id, profileName: stock.profileName, profileId: stock.profileId,
    items: stock.items.map(item => ({ ...item, skip: existing.has(item.id) })) };
}

/** Explicitly approved population only: copy referenced compendium Items into the existing NPC. */
export async function applyMerchantStock(actor, preview, { resolve = uuid => fromUuid(uuid) } = {}) {
  authorize(actor);
  if (preview?.actorId !== actor.id || !Array.isArray(preview.items) || preview.items.length > 500) {
    throw new Error("Invalid stock preview. Roll a new preview for this merchant.");
  }
  if (busy.has(actor.id)) throw new Error("This merchant is already being populated.");
  busy.add(actor.id);
  try {
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
      planned.push({ sourceId: row.id, data });
    }
    // Re-read after asynchronous resolution; manual additions since preview must not be duplicated.
    authorize(actor);
    const current = sourceIds(actor);
    const additions = planned.filter(row => !current.has(row.sourceId));
    if (additions.length) {
      await actor.createEmbeddedDocuments("Item", additions.map(row => row.data));
      for (const { sourceId, data } of additions) {
        const found = actor.items.filter(item => item.getFlag(MODULE_ID, "sourceId") === sourceId);
        if (found.length !== 1 || found[0].system.quantity !== data.system.quantity) {
          throw new Error("Stock read-back failed. Some additions may have succeeded; review inventory before retrying. Existing source IDs will be skipped.");
        }
      }
    }
    logger.debug("Merchant stock populated", { merchant: actor.id, created: additions.length, profile: preview.profileId });
    return { created: additions.length, skipped: preview.items.length - additions.length };
  } finally { busy.delete(actor.id); }
}
