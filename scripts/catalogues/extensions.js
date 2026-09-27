import { compileSchema } from "../validation/schema-validator.js";
import { CatalogueRegistry, catalogueRegistry } from "./registry.js";
const providers = new Map();
let sealed = false;
/** Register synchronously during setup, before ready. Items use the existing source schema and shared builder. */
export function registerCatalogueProvider(id, bundle) {
  if (sealed) throw Error("Register catalogue providers during setup, before ready.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || providers.has(id)) throw Error("Invalid or duplicate catalogue provider.");
  if (!bundle || typeof bundle !== "object" || Array.isArray(bundle) ||
      Object.keys(bundle).some(key => !["catalogues", "categories", "shops", "items", "reservedIds"].includes(key)) ||
      Object.values(bundle).some(value => !Array.isArray(value))) throw Error("Provider bundles contain only catalogue/category/shop/item/reserved-ID arrays.");
  providers.set(id, structuredClone(bundle));
}
export function extendCatalogue(data) {
  data.externalCatalogueIds = [];
  for (const [id, bundle] of providers) {
    const { catalogues = [], categories = [], shops = [], items = [], reservedIds = [] } = structuredClone(bundle);
    data.externalCatalogueIds.push(...catalogues.map(row => row.id));
    data.catalogueDefinitions.push(...catalogues);
    data.categoryDefinitions.push(...categories);
    appendCategoryMembership(data.catalogueDefinitions, categories);
    data.shopDefinitions.push(...shops);
    data.index.shops.push(...catalogues.map(row => row.id));
    data.index.categories = [...new Set([...data.index.categories, ...categories.map(row => row.id)])];
    data.ledger.ids.push(...reservedIds);
    data.entries.push(...items.map((item, n) => ({ item, location: `provider:${id}[${n}]` })));
  }
  return data;
}
export function validateRegistry(data) {
  try {
    const errors = compileSchema(data.cataloguesSchema)(data.catalogueDefinitions, "data/catalogues.json");
    if (errors.length) return errors;
    const ids = new Set(data.catalogueDefinitions.map(row => row.id));
    if (data.index.shops.some(id => !ids.has(id)) || [...ids].some(id => !data.index.shops.includes(id))) {
      return [{ path: "catalogues", message: "Catalogue definitions must match the registered shop identities." }];
    }
    new CatalogueRegistry().register({ catalogues: data.catalogueDefinitions, categories: data.categoryDefinitions }); return []; }
  catch (error) { return [{ path: "catalogues", message: error.message }]; }
}
export function activateCatalogues(data) {
  catalogueRegistry.register({ catalogues: data.catalogueDefinitions, categories: data.categoryDefinitions });
  sealed = true;
}

/** Startup reads metadata only; source Items are loaded by validation/build operations. */
export async function initialiseCatalogues(readJson) {
  sealed = true;
  const [catalogues, categories, cataloguesSchema, categoriesSchema] = await Promise.all([readJson("data/catalogues.json"), readJson("data/categories.json"),
    readJson("schemas/catalogues.schema.json"), readJson("schemas/categories.schema.json")]);
  for (const bundle of providers.values()) {
    catalogues.push(...structuredClone(bundle.catalogues ?? []));
    const added = structuredClone(bundle.categories ?? []);
    categories.push(...added);
    appendCategoryMembership(catalogues, added);
  }
  const errors = [...compileSchema(cataloguesSchema)(catalogues), ...compileSchema(categoriesSchema)(categories)];
  if (errors.length) throw Error(errors.map(e => `${e.path}: ${e.message}`).join("\n"));
  activateCatalogues({ catalogueDefinitions: catalogues, categoryDefinitions: categories });
}

function appendCategoryMembership(catalogues, categories) {
  for (const category of categories) {
    const parent = catalogues.find(row => row.id === (category.catalogue ?? category.shop));
    if (parent && !parent.categories.includes(category.id)) parent.categories.push(category.id);
  }
}
