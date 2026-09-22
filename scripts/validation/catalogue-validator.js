import { compileSchema } from "./schema-validator.js";
import { documentIdFor } from "../builders/document-id.js";

/** Cross-file, registry and permanent-ID checks supplement structural schemas. */
export function validateCatalogue({ index, entries, itemSchema, catalogueSchema, ledger }) {
  const errors = compileSchema(catalogueSchema)(index, "data/catalogue.json");
  const warnings = [];
  const result = () => ({ valid: errors.length === 0, count: entries?.length ?? 0, errors, warnings });
  const add = (path, message) => errors.push({ path, message });
  if (!Array.isArray(entries)) { add("entries", "Expected loaded catalogue entries."); return result(); }
  if (errors.length) return result();
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger?.ids) ||
      ledger.ids.some(id => typeof id !== "string" || !/^DT_ITEM_[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(id)) ||
      new Set(ledger.ids).size !== ledger.ids.length || Object.keys(ledger).some(key => !["schemaVersion", "ids"].includes(key))) {
    add("data/id-ledger.json", "Expected schemaVersion 1 and unique permanent IDs.");
    return result();
  }
  const registered = new Set(ledger.ids);
  const ids = new Map();
  const documents = new Map();
  const shops = new Set(index.shops);
  const categories = new Set(index.categories);
  const validate = compileSchema(itemSchema);
  for (const { item, location } of entries) {
    const itemErrors = validate(item, location);
    errors.push(...itemErrors);
    if (itemErrors.length) continue;
    if (ids.has(item.id)) add(`${location}.id`, `Duplicate ${item.id}; first seen at ${ids.get(item.id)}.`);
    ids.set(item.id, location);
    if (!registered.has(item.id)) add(`${location}.id`, "Permanent ID must be reserved in data/id-ledger.json.");
    if (!categories.has(item.category)) add(`${location}.category`, "Category is not in the catalogue registry.");
    for (const shop of item.shops) if (!shops.has(shop)) add(`${location}.shops`, `Unknown shop: ${shop}.`);
  }
  // Include retired IDs: they must never collide with a new active document.
  for (const id of registered) {
    const documentId = documentIdFor(id);
    if (documents.has(documentId)) add("data/id-ledger.json", `Foundry ID collision: ${id} / ${documents.get(documentId)}.`);
    documents.set(documentId, id);
  }
  const retired = ledger.ids.filter(id => !ids.has(id));
  if (retired.length) warnings.push(`${retired.length} reserved IDs are inactive; existing generated documents will be preserved.`);
  if (!entries.length) warnings.push("The production catalogue is intentionally empty. Building will make no changes.");
  return result();
}
