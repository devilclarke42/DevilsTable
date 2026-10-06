import { selectEntries } from "../data/shop-catalogue.js";
/** Counts are source scope, not write counts. Services are references, never Item documents. */
export function generationSummary(data, scope, services = [], tableCount = null) {
  const entries = selectEntries(data, scope);
  const catalogues = scope.shopId ? [scope.shopId] : data.index.shops;
  return {
    catalogues: catalogues.length,
    categories: new Set(entries.map(e => e.item.category)).size,
    products: entries.length,
    services: new Set(services.filter(s => s.catalogues.some(id => catalogues.includes(id))).map(s => s.id)).size,
    tables: tableCount,
    duration: "Depends on world size and host; live progress appears below."
  };
}
/** Shared native selects, avoiding ever-growing grids of selection buttons. */
export function bindBuilderSelectors(app, actions) {
  app.element?.querySelectorAll("[data-builder-select]").forEach(select => {
    select.addEventListener("change", () => {
      const key = select.dataset.builderSelect;
      void actions[key]?.(select.value);
    });
  });
}
