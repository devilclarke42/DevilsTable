import { BATCH_SIZE, FLAG_SCOPE, TABLE_PACK_COLLECTION } from "../constants.js";
import { loadStockCatalogue } from "../data/stock-loader.js";
import { requireValidStock } from "./roll-table-builder.js";
import { stockTableDocuments } from "./roll-table-factory.js";
import { normalizedTable, planRollTables } from "./roll-table-plan.js";
import { matchesGenerated } from "./generated-fields.js";
import { createRollTableAdapter } from "./roll-table-adapter.js";
import { withStockOperation } from "./stock-operation.js";

const REFERENCE = /Compendium\.world\.devils-table-stock-tables\.RollTable\.([A-Za-z0-9]{16})/g;
const foreignFlags = document => Object.keys(document.flags ?? {}).some(key => key !== FLAG_SCOPE);

/** Only unchanged, reserved alpha.5 category tables qualify; preserve known incoming links. */
export function planLegacyCleanup(catalogue, existing, worldTables, selection = {}) {
  const expected = stockTableDocuments(catalogue, selection, { legacyCategories: true });
  const reserved = new Set(catalogue.tableLedger.ids);
  const saved = new Map(existing.map(table => [table._id, table]));
  const remove = new Map();
  const preserved = [];
  for (const table of expected) {
    const actual = saved.get(table._id);
    if (!actual || !reserved.has(table.flags[FLAG_SCOPE].sourceId)) continue;
    if (actual.folder || foreignFlags(actual) || (actual.results ?? []).some(foreignFlags)
        || !matchesGenerated(normalizedTable(actual), normalizedTable(table))) {
      preserved.push({ id: actual._id, name: actual.name, reason: "Edited, organised or unrecognised legacy table; left untouched." });
    } else remove.set(actual._id, { id: actual._id, name: actual.name, sourceId: table.flags[FLAG_SCOPE].sourceId });
  }
  // Retained legacy tables may themselves reference other legacy tables: preserve the whole chain.
  const incoming = [...existing.map(table => ({ table, local: true })), ...worldTables.map(table => ({ table, local: false }))]
    .map(({ table, local }) => ({ id: table._id, name: table.name, local,
      targets: [...JSON.stringify(table).matchAll(REFERENCE)].map(match => match[1]) }));
  let changed;
  do {
    changed = false;
    for (const source of incoming) {
      if (source.local && remove.has(source.id)) continue;
      for (const id of source.targets) {
        if (!remove.has(id)) continue;
        preserved.push({ ...remove.get(id), reason: `Referenced by retained RollTable: ${source.name}.` });
        remove.delete(id);
        changed = true;
      }
    }
  } while (changed);
  return { removable: [...remove.values()], preserved };
}

const sameIds = (a, b) => Array.isArray(a) && a.length === b.length
  && JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

/** Explicit preview/approval is required. Ordinary builds never delete whole tables. */
export function createLegacyTableCleanup({ load = loadStockCatalogue, adapter = null } = {}) {
  return withStockOperation(async function ({ dryRun = true, approvedIds = [], shopId = null, categoryId = null } = {}) {
    const io = adapter ?? createRollTableAdapter();
    io.assertCanBuild();
    const catalogue = await load();
    requireValidStock(catalogue);
    const selection = { shopId, categoryId };
    const active = stockTableDocuments(catalogue, selection);
    await io.validateDocuments(active);
    const pack = await io.getPack();
    if (!pack) throw new Error("Build the compact shop tables before previewing legacy cleanup.");
    const inspect = async () => {
      const existing = await io.readPack(pack);
      const plan = planRollTables(active, existing);
      if (plan.create.length || plan.update.length) throw new Error("Build/Rebuild the compact shop tables before legacy cleanup.");
      return planLegacyCleanup(catalogue, existing, await io.readWorldTables(), selection);
    };
    const plan = await inspect();
    const summary = { status: dryRun ? "preview" : "complete", at: new Date().toISOString(), pack: TABLE_PACK_COLLECTION,
      scope: selection, ...plan, deleted: 0,
      warnings: ["Reference checks cover this pack and world RollTables. Review journal, macro and other-compendium links before removing legacy tables."] };
    if (dryRun) return summary;
    const ids = plan.removable.map(table => table.id);
    if (!sameIds(approvedIds, ids)) throw new Error("Cleanup selection changed or was not approved. Preview and confirm the exact removal list again.");
    const locked = pack.locked;
    let restore = false;
    let failure;
    try {
      if (ids.length && locked) { restore = true; await io.configure(pack, false); }
      for (let offset = 0; offset < ids.length; offset += BATCH_SIZE) {
        io.assertCanBuild();
        const current = await inspect();
        const remaining = ids.slice(offset);
        if (!sameIds(current.removable.map(table => table.id), remaining)) throw new Error("Legacy tables or references changed during cleanup. Preview again before continuing.");
        const batch = ids.slice(offset, offset + BATCH_SIZE);
        const deleted = await io.deleteLegacy(pack, batch);
        summary.deleted += deleted.length;
        if (deleted.length !== batch.length) throw new Error("A Foundry hook prevented one or more legacy table deletions.");
      }
      const actual = await io.readPack(pack);
      if (actual.some(table => ids.includes(table._id))) throw new Error("Legacy table removal failed read-back verification.");
      const verification = planRollTables(active, actual);
      if (verification.create.length || verification.update.length) throw new Error("Active shop tables changed during cleanup. Rebuild them before continuing.");
      return summary;
    } catch (error) {
      failure = error;
      error.message += " Cleanup may be partial. No Items were deleted. Preview again to review the remaining legacy tables.";
      summary.status = "failed";
      summary.error = error.message;
      throw error;
    } finally {
      const errors = [];
      if (restore) {
        try { await io.configure(pack, locked); }
        catch (error) { errors.push(new Error(`Could not restore the pack lock: ${error.message}. Restore it manually.`)); }
      }
      if (errors.length) { summary.status = "failed"; summary.error = [failure?.message, ...errors.map(error => error.message)].filter(Boolean).join("\n"); }
      try { await io.saveCleanupSummary(summary); }
      catch (error) { errors.push(new Error(`Could not save the cleanup record: ${error.message}.`)); }
      if (errors.length) throw new AggregateError([failure, ...errors].filter(Boolean), [failure?.message, ...errors.map(error => error.message)].filter(Boolean).join("\n"));
    }
  });
}

export const cleanupLegacyStockTables = createLegacyTableCleanup();
