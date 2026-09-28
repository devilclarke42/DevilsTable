/** Display names are independent from collection IDs and saved document UUIDs. */
export const COMPENDIUM_NAMES = Object.freeze({
  "world.devils-table-items": { type: "Item", label: "Devil's Table — Master Item Catalogue" },
  "world.devils-table-stock-tables": { type: "RollTable", label: "Devil's Table — Merchant Stock RollTables" },
  "world.devils-table-transactions": { type: "JournalEntry", label: "Devil's Table — Transaction History (GM Only)" }
});

/** V14 has no documented metadata-rename method. Project only our packs' public title accessor.
 * New packs receive the native label at creation. Existing packs retain their metadata and UUIDs.
 * No global prototype patch, pack duplication, document mutation or permission change is involved.
 */
export function applyCompendiumNames() {
  for (const [id, definition] of Object.entries(COMPENDIUM_NAMES)) {
    const pack = game.packs?.get(id);
    if (!pack || pack.documentName !== definition.type || pack.metadata?.packageType !== "world") continue;
    if (pack.title === definition.label) continue;
    Object.defineProperty(pack, "title", { configurable: true, get: () => definition.label });
  }
  globalThis.ui?.packs?.render?.();
}
