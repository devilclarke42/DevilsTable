/** Public catalogue metadata only. No Actors, stock quantities or private merchant state. */
const clone = value => structuredClone(value);
const slug = value => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const ordered = rows => rows.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
const image = value => typeof value === "string" && /^(?:icons|modules|systems)\/[\w./-]+\.(?:webp|svg|png|jpg)$/.test(value) && !value.includes("..");
export class CatalogueRegistry {
  #catalogues = new Map();
  #categories = new Map();
  register({ catalogues = [], categories = [] }) {
    // Stage and validate the complete bundle before publishing any part of it.
    const next = new Map(this.#catalogues), cats = new Map(this.#categories);
    for (const input of catalogues) {
      const row = clone(input);
      if (!slug(row.id) || typeof row.name !== "string" || !row.name.trim() || !image(row.icon) ||
          !Number.isSafeInteger(row.sort) || !Array.isArray(row.categories) || row.categories.some(id => !slug(id)) ||
          new Set(row.categories).size !== row.categories.length || next.has(row.id)) throw Error(`Invalid or duplicate catalogue: ${row.id}.`);
      if (row.categories.includes(row.fallbackCategory?.id) || !row.fallbackCategory || !slug(row.fallbackCategory.id) || typeof row.fallbackCategory.name !== "string" || !image(row.fallbackCategory.icon)) throw Error(`Missing fallback category: ${row.id}.`);
      next.set(row.id, row);
    }
    for (const input of categories) {
      const row = clone(input), parent = row.catalogue ?? row.shop, key = `${parent}:${row.id}`;
      if (!slug(row.id) || !next.has(parent) || (row.shop && row.shop !== parent) || typeof row.name !== "string" || !row.name.trim() ||
          !image(row.icon) || !Number.isSafeInteger(row.sort) || typeof row.visible !== "boolean" || cats.has(key)) throw Error(`Invalid or duplicate category: ${key}.`);
      row.catalogue = parent; cats.set(key, row);
    }
    for (const row of next.values()) {
      if (row.categories.some(id => !cats.has(`${row.id}:${id}`))) throw Error(`Undefined category in ${row.id}.`);
    }
    for (const row of cats.values()) if (!next.get(row.catalogue).categories.includes(row.id)) throw Error(`Unlisted category: ${row.catalogue}:${row.id}.`);
    this.#catalogues = next; this.#categories = cats;
  }
  list() { return clone(ordered([...this.#catalogues.values()])); }
  get(id) { return clone(this.#catalogues.get(id) ?? null); }
  categories(id) { return clone(ordered([...this.#categories.values()].filter(row => row.catalogue === id))); }
  /** Resolve legacy merchants without writing flags or rebuilding inventory. */
  resolve(actor) {
    const explicit = actor.getFlag?.("devils-table", "merchant")?.catalogueId;
    if (explicit) return this.get(explicit); // Missing provider must not silently select another catalogue.
    const votes = new Map();
    for (const item of actor.items ?? []) {
      const memberships = item.getFlag?.("devils-table", "shops");
      if (Array.isArray(memberships)) for (const id of memberships) votes.set(id, (votes.get(id) ?? 0) + 1);
    }
    return this.list().sort((a, b) => (votes.get(b.id) ?? 0) - (votes.get(a.id) ?? 0))[0] ?? null;
  }
  project(actor, offers) {
    const catalogue = this.resolve(actor);
    if (!catalogue) return { catalogue: null, categories: [], items: actor.getFlag?.("devils-table", "merchant")?.catalogueId ? [] : offers };
    const definitions = this.categories(catalogue.id), byId = new Map(definitions.map(row => [row.id, row]));
    const items = offers.flatMap(item => {
      if (item.catalogues?.length && !item.catalogues.includes(catalogue.id)) return [];
      const category = byId.get(item.category) ?? catalogue.fallbackCategory;
      if (category.visible === false) return [];
      return [{ ...item, category: category.id, categoryName: category.name }];
    });
    const populated = new Set(items.map(item => item.category));
    const categories = [...definitions, catalogue.fallbackCategory].filter(row => row.visible !== false && populated.has(row.id))
      .map(({ id, name, icon }) => ({ id, name, icon }));
    return { catalogue: { id: catalogue.id, name: catalogue.name, icon: catalogue.icon }, categories, items };
  }
}
export const catalogueRegistry = new CatalogueRegistry();

/** Search is public projection only; no hidden Actor fields are indexed. */
export function matchesOffer(item, query, category = "") {
  return (!category || item.category === category) && `${item.name} ${item.description} ${(item.tags ?? []).join(" ")} ${item.categoryName ?? item.category}`
    .normalize("NFKC").toLocaleLowerCase().includes(query.normalize("NFKC").trim().toLocaleLowerCase());
}
