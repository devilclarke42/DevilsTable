import { compileSchema } from "./schema-validator.js";

/** Builder metadata is validated separately and never sent to an Item converter. */
export function validateShopDefinitions({ index, shopDefinitions, categoryDefinitions, shopsSchema, categoriesSchema }) {
  const errors = [
    ...compileSchema(shopsSchema)(shopDefinitions, "data/shops.json"),
    ...compileSchema(categoriesSchema)(categoryDefinitions, "data/categories.json")
  ];
  if (errors.length) return errors;
  const add = (path, message) => errors.push({ path, message });
  const shopIds = new Set();
  for (const [i, shop] of shopDefinitions.entries()) {
    const path = `data/shops.json[${i}]`;
    if (!index.shops.includes(shop.id)) add(`${path}.id`, "Shop is not registered.");
    if (shopIds.has(shop.id)) add(`${path}.id`, `Duplicate shop definition: ${shop.id}.`);
    shopIds.add(shop.id);
    const stock = new Set();
    for (const [tier, notes] of Object.entries(shop.merchantNotes)) {
      for (const note of notes) {
        const key = note.trim().toLowerCase();
        if (stock.has(key)) add(`${path}.merchantNotes.${tier}`, `Repeated stock guidance: ${note}.`);
        stock.add(key);
      }
    }
  }
  for (const id of index.shops) if (!shopIds.has(id)) add("data/shops.json", `Missing shop definition and Merchant Notes for ${id}.`);
  const keys = new Set();
  for (const [i, category] of categoryDefinitions.entries()) {
    const path = `data/categories.json[${i}]`;
    if (!shopIds.has(category.shop)) add(`${path}.shop`, "Category refers to an undefined shop.");
    if (!index.categories.includes(category.id)) add(`${path}.id`, "Category is not registered.");
    const key = `${category.shop}:${category.id}`;
    if (keys.has(key)) add(path, `Duplicate shop category: ${key}.`);
    keys.add(key);
  }
  return errors;
}
