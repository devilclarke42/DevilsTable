import { selectEntries } from "./shop-catalogue.js";

export const STOCK_KINDS = ["always", "often", "rarely", "rotating"];
export const STOCK_LABELS = { always: "Always Stock", often: "Often Stock", rarely: "Rarely Stock", rotating: "Rotating Stock" };
const AVAILABILITY_TIERS = { core: "always", variable: "often", "special-order": "rarely" };
const slug = value => value.replaceAll("-", "_").toUpperCase();

/** Named variants inherit one shop catalogue; they never introduce new Item identities. */
export function stockProfiles(catalogue) {
  return catalogue.stock.profiles.flatMap(({ variants = [], ...base }) => {
    const shop = catalogue.shopDefinitions.find(entry => entry.id === base.shop);
    const primary = { ...base, name: shop.name, description: shop.description,
      merchantNotes: shop.merchantNotes, excludedItems: [], isVariant: false };
    return [primary, ...variants.map(variant => ({ ...primary, ...variant, isVariant: true,
      overrides: [...new Map([...base.overrides, ...variant.overrides].map(entry => [entry.itemId, entry])).values()] }))];
  });
}

/** Freeze this identity convention. Display names, order and probabilities are not identity. */
export function stockTableId(profile, categoryId, kind) {
  return `${profile.id}_${categoryId ? slug(categoryId) : "ALL"}_${kind.toUpperCase()}`;
}

/** Explicit per-shop overrides allow a shared good to have different local availability. */
export function stockGroups(catalogue, profile, categoryId = null) {
  const overrides = new Map(profile.overrides.map(entry => [entry.itemId, entry.tier]));
  const excluded = new Set(profile.excludedItems ?? []);
  const groups = { always: [], often: [], rarely: [] };
  for (const { item } of selectEntries(catalogue, { shopId: profile.shop, categoryId })) {
    if (excluded.has(item.id)) continue;
    groups[overrides.get(item.id) ?? AVAILABILITY_TIERS[item.availability]].push(item);
  }
  // Sorting IDs makes results deterministic when authors reorganise source files.
  for (const items of Object.values(groups)) items.sort((a, b) => a.id.localeCompare(b.id, "en"));
  return groups;
}

/** Four tables per profile. Categories filter shared pools; legacy scopes exist only for cleanup. */
export function stockScopes(catalogue, { shopId = null, categoryId = null, profileId = null } = {}, { legacyCategories = false } = {}) {
  selectEntries(catalogue, { shopId, categoryId }); // Reuse the public filter guards.
  const profiles = stockProfiles(catalogue);
  if (profileId && !profiles.some(profile => profile.id === profileId && (!shopId || profile.shop === shopId))) {
    throw new Error(`Unknown stock profile selection: ${profileId}.`);
  }
  const scopes = [];
  for (const profile of profiles) {
    if (shopId && profile.shop !== shopId) continue;
    if (profileId && profile.id !== profileId) continue;
    if (legacyCategories && profile.isVariant) continue;
    const categories = legacyCategories
      ? profile.categories.filter(id => !categoryId || id === categoryId) : [null];
    for (const category of categories) {
      const categoryName = catalogue.categoryDefinitions.find(entry => entry.id === category)?.name ?? category ?? "All categories";
      scopes.push({ profile, categoryId: category, label: `${profile.name} / ${categoryName}`, groups: stockGroups(catalogue, profile, category) });
    }
  }
  return scopes;
}
