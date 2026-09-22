import { MODULE_ID } from "../constants.js";
import { compileSchema } from "../validation/schema-validator.js";

/** The injectable reader keeps filesystem/network details out of catalogue logic. */
export async function readModuleJson(path) {
  const response = await fetch(`modules/${MODULE_ID}/${path}`, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Cannot load ${path}: HTTP ${response.status}.`);
  try { return await response.json(); }
  catch (error) { throw new Error(`Invalid JSON in ${path}: ${error.message}`, { cause: error }); }
}

export async function loadCatalogue({ readJson = readModuleJson } = {}) {
  const [index, itemSchema, catalogueSchema, ledger, shopDefinitions, categoryDefinitions, shopsSchema, categoriesSchema] = await Promise.all([
    readJson("data/catalogue.json"), readJson("schemas/item.schema.json"),
    readJson("schemas/catalogue.schema.json"), readJson("data/id-ledger.json"),
    readJson("data/shops.json"), readJson("data/categories.json"),
    readJson("schemas/shops.schema.json"), readJson("schemas/categories.schema.json")
  ]);
  const errors = compileSchema(catalogueSchema)(index, "data/catalogue.json");
  if (errors.length) throw new Error(errors.map(e => `${e.path}: ${e.message}`).join("\n"));

  // Bounded concurrency prevents hundreds of simultaneous requests on Forge.
  const groups = [];
  for (let offset = 0; offset < index.files.length; offset += 6) {
    const batch = await Promise.all(index.files.slice(offset, offset + 6).map(async file => {
      const items = await readJson(file);
      if (!Array.isArray(items)) throw new Error(`${file}: expected an array of items.`);
      return items.map((item, i) => ({ item, location: `${file}[${i}]` }));
    }));
    groups.push(...batch.flat());
  }
  return { index, itemSchema, catalogueSchema, ledger, shopDefinitions, categoryDefinitions, shopsSchema, categoriesSchema, entries: groups };
}
