import { FLAG_SCOPE, MODULE_ID } from "../constants.js";
import { documentIdFor } from "./document-id.js";
import { planBuild } from "./build-plan.js";
import { readBackError } from "./generated-fields.js";

/** Result order is storage detail; ID, reference, range and weight remain strict. */
export function normalizedTable(table) {
  return { ...table, results: [...(table.results ?? [])].sort((a, b) => String(a._id).localeCompare(String(b._id), "en")) };
}

export function assertManagedResults(table) {
  const flags = table.flags?.[FLAG_SCOPE];
  if (flags?.generatedBy !== MODULE_ID || flags.kind !== "stock-table") throw new Error(`Not a generated stock table: ${table.name}.`);
  const ids = new Set();
  for (const result of table.results ?? []) {
    const row = result.flags?.[FLAG_SCOPE];
    if (row?.generatedBy !== MODULE_ID || !row.sourceId?.startsWith(`${flags.sourceId}_`)) {
      throw new Error(`${table.name} contains an unmanaged result. Keep custom results in a separate table; edit canonical stock JSON for generated tables.`);
    }
    if (result._id !== documentIdFor(row.sourceId) || ids.has(result._id)) throw new Error(`Result identity conflict in ${table.name}: ${result._id}.`);
    ids.add(result._id);
  }
}

export function planRollTables(documents, existing) {
  const selected = new Set(documents.map(doc => doc.flags[FLAG_SCOPE].sourceId));
  for (const table of documents) assertManagedResults(table);
  for (const table of existing) {
    if (table.flags?.[FLAG_SCOPE]?.generatedBy === MODULE_ID && selected.has(table.flags[FLAG_SCOPE].sourceId)) assertManagedResults(table);
  }
  return planBuild(documents.map(normalizedTable), existing.map(normalizedTable));
}

export function tableReadBackError(expected, actual) {
  const error = readBackError(expected.map(normalizedTable), actual.map(normalizedTable));
  error.message = error.message.replace("item(s)", "table(s)");
  return error;
}
