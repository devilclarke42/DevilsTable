import { selectEntries } from "./shop-catalogue.js";

export const STOCK_KINDS = ["always", "often", "rarely", "rotating"];
export const STOCK_LABELS = { always: "Always Stock", often: "Often Stock", rarely: "Rarely Stock", rotating: "Rotating Stock" };
const AVAILABILITY_TIERS = { core: "always", variable: "often", "special-order": "rarely" };
const slug = value => value.replaceAll("-", "_").toUpperCase();

/** Freeze this identity convention. Display names, order and probabilities are not identity. */
export function stockTableId(profile, categoryId, kind) {
  return `${profile.id}_${categoryId ? slug(categoryId) : "ALL"}_${kind.toUpperCase()}`;
}

/** Explicit per-shop overrides allow a shared good to have different local availability. */
export function stockGroups(catalogue, profile, categoryId = null) {
  const overrides = new Map(profile.overrides.map(entry => [entry.itemId, entry.tier]));
  const groups = { always: [], often: [], rarely: [] };
  for (const { item } of selectEntries(catalogue, { shopId: profile.shop, categoryId })) {
    groups[overrides.get(item.id) ?? AVAILABILITY_TIERS[item.availability]].push(item);
  }
  // Sorting IDs makes results deterministic when authors reorganise source files.
  for (const items of Object.values(groups)) items.sort((a, b) => a.id.localeCompare(b.id, "en"));
  return groups;
}

/** Every profile has a whole-shop set and one set per explicitly registered category. */
export function stockScopes(catalogue, { shopId = null, categoryId = null } = {}) {
  selectEntries(catalogue, { shopId, categoryId }); // Reuse the public filter guards.
  const scopes = [];
  for (const profile of catalogue.stock.profiles) {
    if (shopId && profile.shop !== shopId) continue;
    const shop = catalogue.shopDefinitions.find(entry => entry.id === profile.shop);
    for (const category of categoryId ? profile.categories.filter(id => id === categoryId) : [null, ...profile.categories]) {
      const categoryName = catalogue.categoryDefinitions.find(entry => entry.id === category)?.name ?? category ?? "All categories";
      scopes.push({ profile, categoryId: category, label: `${shop.name} / ${categoryName}`, groups: stockGroups(catalogue, profile, category) });
    }
  }
  return scopes;
}
