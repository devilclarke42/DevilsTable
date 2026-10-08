import { stockProfiles } from "../data/stock-catalogue.js";
import { selectEntries } from "../data/shop-catalogue.js";
/** Counts are source scope, not write counts. Services are references, never Item documents. */
export function generationSummary(data, scope, services = [], tableCount = null) {
  const entries = selectEntries(data, scope);
  const catalogues = scope.shopId ? [scope.shopId] : data.index.shops;
  const work = tableCount === null ? entries.length : tableCount;
  const seconds = Math.max(1, Math.ceil(work * (tableCount === null ? 0.1 : 0.25)));
  return {
    merchantType: data.catalogueDefinitions.find(row => row.id === scope.shopId)?.name ?? "All Merchant Types",
    settlement: "All Settlements",
    catalogues: catalogues.length,
    categories: new Set(entries.map(e => e.item.category)).size,
    products: entries.length,
    services: new Set(services.filter(s => s.catalogues.some(id => catalogues.includes(id))).map(s => s.id)).size,
    tables: tableCount === null ? "Not built here" : tableCount,
    duration: `About ${seconds}–${seconds * 5 + 5} seconds (rough planning estimate; host speed and changed documents vary).`
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

/** Data-driven filters; settlement narrows existing table profiles, never duplicates Items. */
export function builderFilters(data, economy, scope) {
  const settlement = scope.settlement ?? null;
  if (settlement && !economy.settlements.some(row => row.id === settlement)) throw Error("Unknown settlement selection.");
  const profiles = stockProfiles(data).filter(row => (!scope.shopId || row.shop === scope.shopId) &&
    (!settlement || (economy.stockProfiles[row.id]?.settlement ?? economy.defaults.settlement) === settlement));
  return {
    shops: data.catalogueDefinitions.filter(row => data.index.shops.includes(row.id)).sort((a,b) => a.sort-b.sort || a.name.localeCompare(b.name)).map(row => ({...row,selected:row.id === scope.shopId})),
    settlements: [{id:"",name:"All Settlements"}, ...economy.settlements].map(row => ({...row,selected:row.id === (settlement ?? "")})),
    settlementLabel: economy.settlements.find(row => row.id === settlement)?.name ?? "All Settlements",
    profileChoices: profiles.map(row => ({id:row.id,name:row.name,selected:row.id === scope.profileId})),
    profileIds: profiles.map(row => row.id)
  };
}
