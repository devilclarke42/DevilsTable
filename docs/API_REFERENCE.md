# Public API

**Audience:** extension authors and developers. **Purpose:** distinguish supported exported entry points from internal implementation details.

## Status and lifecycle

The API is exposed on `game.modules.get("devils-table").api` at `init`. It is a supported **prerelease** surface, not a 1.0 stability guarantee. Providers should declare Devil's Table as a required dependency and register synchronously during `setup`, before `ready` begins metadata/service initialization. Load data before that synchronous hook; Foundry does not wait for an async listener. Every client must register the same bundle.

Use exported entry points; do not import internal classes, patch prototypes or write persistence flags as an extension API. Referenced current schema/API shapes must be reviewed when target versions change.

## Exported entry points

| Entry point | Purpose and authority |
| --- | --- |
| `registerCatalogueProvider(providerId, bundle)` | Setup-time copied catalogue/category/shop/item/reserved-ID arrays |
| `registerServiceProvider(bundle)` | Setup-time copied categories/services bundle |
| `registerIntegration(adapter)` | Register isolated optional-module adapter; setup is the documented convention |
| `integrationStatus()` | Read installed/active/enabled/available adapter status and reasons |
| `catalogues()` | Return copied sorted catalogue metadata |
| `loadCatalogue()` | Read combined source, including providers; does not build |
| `validateCatalogue(data)` | Return validation report; does not mutate the world |
| `rebuildCompendiums(options)` | GM Item reconciliation; defaults to dry-run preview |
| `rebuildStockTables(options)` | GM stock-table reconciliation; defaults to preview |
| `rollStock(options)` | GM read-only stock suggestion; requires current built tables |
| `cleanupLegacyStockTables(options)` | GM preview by default; explicit approved IDs required for deletion |
| `openBuilder()`, `openStockBuilder()` | GM content-builder applications |
| `openMerchantBuilder(options)` | GM NPC Builder launcher; supports `actorId` and `tab` |
| `openMerchantManager()` | Compatibility launcher for the Merchant Builder |
| `enableMerchant(actor, availability)` | Low-level GM enablement; does not configure a full business or populate stock |
| `openMerchantShop(token)` | Open a visible linked merchant Token's Shop; returns no transaction authority |

Prefer the Merchant Builder for validated administration. `enableMerchant` is not a substitute for its stale-state/recovery workflow, and no exported call bypasses checkout's authoritative quote/approval.

## Catalogue providers

Provider IDs are unique lowercase kebab-case slugs. A bundle may contain `catalogues`, `categories`, `shops`, `items` and `reservedIds` arrays; omit unused arrays or provide empty arrays. Catalogue/category/shop records follow their matching schemas. Items are complete `schemas/item.schema.json` records, not partial Foundry Items. Reserved IDs include all active/inactive identities owned by the provider.

Categories may extend an existing catalogue; `(catalogue, category id)` identifies them. New catalogue definitions need matching shop metadata for content builders. New category membership is appended by the loader. Duplicate catalogue/category/permanent Item IDs are rejected, not overwritten. Namespace product IDs, for example `DT_ITEM_MYMODULE_PRODUCT`.

```js
// providerBundle is validated plain data supplied by your module.
Hooks.once("setup", () => {
  const api = game.modules.get("devils-table").api;
  api.registerCatalogueProvider("my-module", providerBundle);
});
```

Registration copies data and writes no packs/Actors. Explicit GM builds validate the combined bundle and use the same shared Item pack. Disabling a provider preserves generated/embedded Items; merchants explicitly selecting its missing catalogue fail closed instead of silently selecting another type.

## Services and integrations

Service bundles contain `categories` and `services`, with unique `DT_SERVICE_` IDs and catalogue assignments. Definitions support economic/customer/target requirements, visibility defaults and optional native/integration actions. See [Merchant Services](MERCHANT_SERVICES.md) for fields and [Integration Developers](INTEGRATION_DEVELOPERS.md) for adapter contracts and examples.

## Building and rolling

```js
const api = game.modules.get("devils-table").api;
await api.rebuildCompendiums({ shopId: "general-store" }); // preview
await api.rebuildStockTables({ shopId: "black-market" }); // preview
// After the GM reviews and builds the source/tables:
const result = await api.rollStock({
  shopId: "black-market", profileId: "DT_TABLE_BMK_CAUTIOUS"
});
```

Build selectors include shopId, categoryId and profileId/profileIds where applicable; writes require explicit `dryRun: false`. Item category filters limit products, not settlement-specific copies. Stock tables share whole-profile pools; rolling may filter categoryId and use a smaller categoryDraws count. Omit profileId on a table build to include matching variants; omit it on a roll to use the selected shop's base profile. Invalid cross-shop selections fail before writes. Stock results are suggestions, not inventory mutation.

## Data contracts without public registration APIs

Core merchant templates and stock/economic profiles are validated data in `data/`. GMs can save world templates through the existing Builder. There is **no public stock-profile, merchant-template-provider or Builder-tab registration API**. Do not imply these can be plugged in by mutating internal registries. Internal adapters, form controllers, planners, transaction steps, flags and socket packet shapes are implementation details.

## Related documents

[Source Data](SOURCE_DATA.md), [Stock Tables](STOCK_TABLES.md), [Merchant Data Model](MERCHANT_DATA_MODEL.md), [Architecture](ARCHITECTURE.md).
