import { compileSchema } from "./schema-validator.js";
import { validateCatalogue } from "./catalogue-validator.js";
import { documentIdFor } from "../builders/document-id.js";
import { STOCK_KINDS, stockTableId } from "../data/stock-catalogue.js";
import { validateQuantities } from "./quantity-validator.js";

/** Validate profiles and cross-file links before generating any RollTable documents. */
export function validateStockCatalogue(catalogue) {
  const base = validateCatalogue(catalogue);
  const errors = [...base.errors];
  const warnings = [...base.warnings];
  const result = () => ({ valid: errors.length === 0, count: base.count, errors, warnings });
  if (!base.valid) return result();
  errors.push(...compileSchema(catalogue.stockSchema)(catalogue.stock, "data/stock.json"));
  errors.push(...validateQuantities(catalogue));
  if (errors.length) return result();
  const add = (path, message) => errors.push({ path, message });
  const { stock, tableLedger } = catalogue;
  if (stock.oftenChance + stock.rarelyChance > 100 || stock.oftenChance <= stock.rarelyChance) {
    add("data/stock.json", "Often must be more likely than Rarely, and their percentages must total at most 100.");
  }
  if (tableLedger?.schemaVersion !== 1 || !Array.isArray(tableLedger?.ids)
      || tableLedger.ids.some(id => typeof id !== "string" || !/^DT_TABLE_[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(id))
      || new Set(tableLedger.ids).size !== tableLedger.ids.length
      || Object.keys(tableLedger).some(key => !["schemaVersion", "ids"].includes(key))) {
    add("data/table-id-ledger.json", "Expected schemaVersion 1 and unique permanent table IDs.");
    return result();
  }
  const items = new Map(catalogue.entries.map(({ item }) => [item.id, item]));
  const shops = new Set();
  const prefixes = new Set();
  const reserved = new Set(tableLedger.ids);
  const active = new Set();
  for (const [index, profile] of stock.profiles.entries()) {
    const path = `data/stock.json.profiles[${index}]`;
    if (!catalogue.index.shops.includes(profile.shop) || shops.has(profile.shop)) add(path, "Each registered shop requires exactly one stock profile.");
    if (prefixes.has(profile.id)) add(`${path}.id`, "Stock profile identity is duplicated.");
    shops.add(profile.shop);
    prefixes.add(profile.id);
    if (profile.draws > 50 || profile.categoryDraws > 50) add(path, "Suggested draw counts must be between 1 and 50.");
    for (const category of profile.categories) {
      if (!catalogue.index.categories.includes(category)) add(`${path}.categories`, `Unknown category: ${category}.`);
    }
    for (const { item } of catalogue.entries) {
      if (item.shops.includes(profile.shop) && !profile.categories.includes(item.category)) add(`${path}.categories`, `Missing category for ${item.id}: ${item.category}.`);
    }
    const overrides = new Set();
    for (const entry of profile.overrides) {
      if (overrides.has(entry.itemId)) add(`${path}.overrides`, `Duplicate override for ${entry.itemId}.`);
      overrides.add(entry.itemId);
      const item = items.get(entry.itemId);
      if (!item || !item.shops.includes(profile.shop)) add(`${path}.overrides`, `${entry.itemId} must be an active item tagged for this shop.`);
    }
    for (const category of [null]) {
      for (const kind of STOCK_KINDS) {
        const id = stockTableId(profile, category, kind);
        if (active.has(id)) add(path, `Duplicate generated table identity: ${id}.`);
        active.add(id);
        if (!reserved.has(id)) add("data/table-id-ledger.json", `Reserve the permanent table ID: ${id}.`);
      }
    }
    if (profile.coverage === "partial") warnings.push(`${profile.shop}: tables cover authored shared goods only; this shop's full catalogue is not yet authored.`);
  }
  for (const shop of catalogue.index.shops) if (!shops.has(shop)) add("data/stock.json.profiles", `Missing stock profile: ${shop}.`);
  const hashed = new Map();
  for (const id of reserved) {
    const hash = documentIdFor(id);
    if (hashed.has(hash)) add("data/table-id-ledger.json", `Table document ID collision: ${id} / ${hashed.get(hash)}.`);
    hashed.set(hash, id);
  }
  const inactive = tableLedger.ids.filter(id => !active.has(id));
  if (inactive.length) warnings.push(`${inactive.length} table IDs are inactive and remain reserved. Normal builds preserve existing legacy tables; use the separate cleanup preview to review removal.`);
  return result();
}
