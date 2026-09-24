import { loadCatalogue, readModuleJson } from "./catalogue-loader.js";

/** Stock profiles are separate canonical data; item authoring and builds stay independent. */
export async function loadStockCatalogue({ readJson = readModuleJson } = {}) {
  const [catalogue, stock, stockSchema, tableLedger, quantities, quantitiesSchema] = await Promise.all([
    loadCatalogue({ readJson }), readJson("data/stock.json"),
    readJson("schemas/stock.schema.json"), readJson("data/table-id-ledger.json"),
    readJson("data/stock-quantities.json"), readJson("schemas/stock-quantities.schema.json")
  ]);
  return { ...catalogue, stock, stockSchema, tableLedger, quantities, quantitiesSchema };
}
