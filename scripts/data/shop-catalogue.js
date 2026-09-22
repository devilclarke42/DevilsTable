import { priceBand } from "../validation/item-rules.js";

/** Filter validated source entries without copying items into separate shop catalogues. */
export function selectEntries(catalogue, { shopId = null, categoryId = null } = {}) {
  if (shopId !== null && !catalogue.index.shops.includes(shopId)) throw new Error(`Unknown shop selection: ${shopId}.`);
  if (categoryId !== null && !catalogue.index.categories.includes(categoryId)) throw new Error(`Unknown category selection: ${categoryId}.`);
  const definitions = catalogue.categoryDefinitions.filter(category => category.shop === shopId);
  if (shopId && categoryId && definitions.length && !definitions.some(category => category.id === categoryId)) {
    throw new Error(`Category ${categoryId} is not defined for ${shopId}.`);
  }
  return catalogue.entries.filter(({ item }) =>
    (!shopId || item.shops.includes(shopId)) && (!categoryId || item.category === categoryId));
}

/** Builder-only presentation data. Planned names and Merchant Notes are never inventory. */
export function shopView(catalogue, scope = {}) {
  const shopId = scope.shopId ?? null;
  const categoryId = scope.categoryId ?? null;
  const selected = selectEntries(catalogue, scope);
  const bands = new Map([["Everyday", 0], ["Common", 0], ["Equipment", 0], ["Specialist", 0]]);
  for (const { item } of selected) {
    const band = priceBand(item.price);
    bands.set(band, bands.get(band) + 1);
  }
  const counts = new Map();
  for (const { item } of selectEntries(catalogue, { shopId })) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  const categories = new Map();
  for (const definition of catalogue.categoryDefinitions) {
    if (shopId && definition.shop !== shopId) continue;
    if (!categories.has(definition.id)) categories.set(definition.id, { ...definition });
  }
  for (const id of counts.keys()) {
    if (!categories.has(id)) categories.set(id, { id, name: id, description: "", plannedItems: [] });
  }
  return {
    shops: catalogue.shopDefinitions.map(shop => ({ ...shop, selected: shop.id === shopId })),
    shop: catalogue.shopDefinitions.find(shop => shop.id === shopId) ?? null,
    allShops: shopId === null,
    allCategories: categoryId === null,
    categories: [...categories.values()].map(category => ({
      ...category, count: counts.get(category.id) ?? 0, selected: category.id === categoryId,
      planned: category.plannedItems.join(", ")
    })),
    count: selected.length,
    priceBands: [...bands].map(([name, count]) => ({ name, count })),
    scopeLabel: `${catalogue.shopDefinitions.find(shop => shop.id === shopId)?.name ?? "All shops"} / ${categories.get(categoryId)?.name ?? categoryId ?? "All categories"}`
  };
}
