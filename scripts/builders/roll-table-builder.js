import { TABLE_PACK_COLLECTION } from "../constants.js";
import { loadStockCatalogue } from "../data/stock-loader.js";
import { validateStockCatalogue } from "../validation/stock-validator.js";
import { createBuilder } from "./compendium-builder.js";
import { createRollTableAdapter } from "./roll-table-adapter.js";
import { stockTableDocuments } from "./roll-table-factory.js";
import { planRollTables, tableReadBackError } from "./roll-table-plan.js";

export function requireValidStock(catalogue) {
  const validation = validateStockCatalogue(catalogue);
  if (!validation.valid) {
    const error = new Error(`Stock validation failed (${validation.errors.length} errors). No tables were written.`);
    error.details = validation.errors;
    throw error;
  }
  return validation;
}

/** Reuse the existing preview/batch/verification/lock lifecycle without changing Item output. */
export function createStockTableBuilder(options = {}) {
  return createBuilder({
    load: loadStockCatalogue, adapterFactory: createRollTableAdapter, collection: TABLE_PACK_COLLECTION,
    planner: planRollTables, verificationError: tableReadBackError,
    prepare(catalogue, scope) {
      const validation = requireValidStock(catalogue);
      const warnings = validation.warnings.filter(message => !message.includes("tables cover authored") || !scope.shopId || message.startsWith(`${scope.shopId}:`));
      return { documents: stockTableDocuments(catalogue, scope), warnings };
    },
    ...options
  });
}

export const rebuildStockTables = createStockTableBuilder();
