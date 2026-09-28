# Catalogue framework

Sprint 8 separates merchant type, category presentation and reusable Item identity. This document
is the extension contract for `0.3.0-alpha.2`. Historical Sprint 8 note: services and the Merchant Builder were design
boundaries, not implemented features.

## Ownership of data

| Layer | Canonical responsibility | Storage |
| --- | --- | --- |
| Authoring | Complete descriptions, mechanics, permanent IDs, prices and adjusted weights | Source JSON and append-only ID ledger |
| Catalogue | Merchant-type name, icon, category membership and presentation order | `data/catalogues.json` |
| Category | Label, icon, parent catalogue, order and visibility | `data/categories.json` |
| Reusable Item | Generated D&D5e document with stable UUID and catalogue tags | **Only** `world.devils-table-items` |
| Live stock | Embedded Items and their current quantities | Merchant NPC Actor Item collection |
| Merchant configuration | Selected catalogue, availability, pricing, private memory and recovery | `flags.devils-table` |

A catalogue is a merchant type, such as General Store. A category is an organisational group
within that catalogue, such as Containers. A stock profile determines which shared Items to
select and how many. These are distinct identities. Category membership never creates another
Item, pack or set of per-category RollTables.

`data/catalogue.json` remains the source-file index for compatibility. Its plural counterpart,
`data/catalogues.json`, defines merchant types. Do not confuse those files. `files` is the active
build list; `deferredFiles` preserves unreviewed sources without building them. Deferred IDs remain
reserved. Existing world documents are preserved by the builder's non-deleting reconciliation.

## Definition contract

Catalogue records require `id`, `name`, `icon`, `sort`, `categories`, `fallbackCategory` and
`metadata`. IDs are lowercase hyphenated slugs. Names are nonblank. Icons reference packaged
module/system/core images; remote URLs and traversal paths are rejected. `sort` is a nonnegative
integer. `categories` contains unique category IDs. `fallbackCategory` contains an `id`, `name`
and `icon` for compatible unclassified goods; it must not collide with a defined category.
`metadata` is public JSON reserved for future descriptive integration. Never put secrets in it.

Category records require `id`, `catalogue`, `shop`, `name`, `icon`, `sort`, `visible`, `description`
and `plannedItems`. Identity is the pair `(catalogue, id)`, so a shared category slug may appear
in several catalogues with different labels or order. `shop` is a compatibility alias of
`catalogue` and must equal it; existing builder APIs still use the original name. `visible` is a
boolean. `plannedItems` may be empty for third-party or manually stocked categories. Plans are
builder guidance only and do not manufacture inventory.

Existing Item `shops` tags now mean catalogue membership. They remain named `shops` in source
JSON and generated flags to avoid rewriting accepted Items or breaking existing integrations.
`category` remains one stable classification slug. A shared product lists multiple catalogue IDs
in `shops`; each catalogue supplies a matching category definition. Do not copy the product or
change its permanent ID. Source validation rejects duplicate names, IDs and invalid memberships.

## Runtime projection and access

At ready, each client loads four small metadata/schema files. Item sources are loaded only for
validation and builder operations. A malformed registry prevents merchant service startup and
reports the error; it never starts a partly registered catalogue. Definitions are copied at the
API boundary. Registration is closed once initialization begins; reload after changing providers.

The active GM reads the merchant's existing Item collection. Public offers retain the existing
quantity, price and approved-description checks, then apply catalogue membership and category
visibility. A zero-stock Item cannot populate a tab. The GM sends an allowlisted projection:
public items, category labels/icons, catalogue identity, portrait, availability and numeric pricing
terms. No Actor sheet, notes, relationship record, DC, stock policy or recovery data is exposed.

Players do not need Actor ownership. A compatible manually added Item still needs its existing
approved public description; unclassified goods appear under the data-defined fallback category.
Unknown category slugs do not create arbitrary tabs. Hidden categories are excluded from the
same `publicOffers` function used for checkout and theft validation, so a forged basket cannot
purchase a hidden item.

Newly configured merchants save `merchant.catalogueId` through Merchant Administration. Legacy merchants
are inferred from their embedded Items' `shops` memberships: greatest membership count wins,
then catalogue sort order. An empty legacy merchant uses the first catalogue by sort order.
This read-only fallback does not migrate or copy inventory. Review and explicitly select a
catalogue for a mixed-stock legacy merchant. If an explicit provider catalogue is unavailable,
its offers fail closed; enable the provider or select another valid catalogue as GM.

The header uses the Actor portrait and the **scene token's exact name**. GM-projected portrait
and availability changes and local token-name updates refresh open headers. A generic silhouette
handles absent or broken portraits. The flexible context row reserves room for later presentation
features without implementing greetings, reputation, factions or badges.

Search checks public names, descriptions, tags and category display names, with case-insensitive
Unicode normalization. Input events filter existing rows without replacing the input or basket.
Categories remain visible while searching if stocked, even when the current query has no match.
Refresh recomputes stock and removes empty tabs or stale basket lines. Browsing does not reserve
stock. Existing GM-authoritative checkout, consent, locking and recovery remain unchanged.

The inventory and basket scroll independently. The basket shows original purchase subtotal,
merchant/character/negotiation modifiers, adjusted purchases, sales and the net payment in
formatted D&D5e denominations. Per-unit rounding matches checkout. The existing currency formatter
uses familiar gold/silver/copper display without changing native Actor currency settlement.

## Third-party registration

Call `game.modules.get("devils-table").api.registerCatalogueProvider(providerId, bundle)`
synchronously during Foundry's `setup` hook, after Devil's Table exposes its API during `init`
and before `ready` starts metadata initialization. Declare Devil's Table as a required dependency.
Load the provider's JSON before making this call; Foundry does not wait for an asynchronous hook
listener. Every client must register the same bundle. Foundry's lifecycle ordering is documented
in the [V14 setup hook](https://foundryvtt.com/api/functions/hookEvents.setup.html).

The provider ID is a unique lowercase hyphenated module slug. The bundle contains:

| Property | Contents |
| --- | --- |
| `catalogues` | New catalogue definitions using `schemas/catalogues.schema.json` |
| `categories` | Category definitions using `schemas/categories.schema.json` |
| `shops` | One builder Merchant Notes record for each new catalogue, using `schemas/shops.schema.json` |
| `items` | Complete canonical source records using `schemas/item.schema.json`; no partial Items |
| `reservedIds` | Every permanent Item ID owned by the provider, including inactive IDs |

All arrays may be empty when irrelevant. New categories may target an existing catalogue; the
loader adds those category IDs to its category list. Duplicate catalogue/category keys are
rejected rather than overwritten. A provider may add Items to an existing catalogue without
registering another shop or catalogue. Providers should use a unique uppercase ID segment, such
as `DT_ITEM_MYMODULE_PRODUCT_NAME`, and retain their own append-only ledger under version control.

Registration copies data; it does not write packs or Actors. The ordinary explicit GM builder
loads provider Items, validates the entire combined source, checks collisions and writes the same
shared Item pack. Invalid provider Items block building before writes. Source converter support
is unchanged: authored loot, containers and supported consumables. Other compatible D&D5e Item
types can still be manually stocked under the existing public-description policy.

`api.catalogues()` returns copied, sorted definitions. Do not mutate these copies expecting a
world change. Disabling a provider does not delete generated or embedded Items. Its explicitly
selected merchants stop offering goods until the provider returns or the GM changes selection.

Stock-table generation remains optional for provider catalogues. Core stock profiles remain
required and validated. Provider catalogues without a stock profile can use the Item builder and
manual stocking; this sprint does not expose a new stock-profile registration API.

## Future Merchant Builder

A future builder request should select catalogue ID, settlement profile ID, stock-size preset,
wealth preset and restock profile ID. These are references to data definitions, not switches on
shop names. Catalogue `metadata` can contain provider-owned namespaced preset references; it
must not hold live stock. The future builder resolves one shared Item UUID per source identity
and creates ordinary embedded Items only after GM approval. Availability and quantities remain
stock-profile concerns. No new generator or restock behavior ships in Sprint 8.

## Services boundary (implemented in Sprint 10A)

Services have a separate registry/category model and coexist with Item products in the Shop.
They use the existing checkout and native currency pipeline, never an Item compendium.
The current contract is [Merchant Services](MERCHANT_SERVICES.md); its setup-time provider API
supports JSON definitions and optional native document integrations. The original future-only
proposal is superseded by this implemented boundary.

## Acceptance and limitations

Automated coverage exercises provider-only catalogue creation, shared pack convergence, deferred
identity preservation, visibility enforcement, manual goods, search fields, basket preservation,
public transport and exact token naming. The established two/three/five-client checkout and
rollback tests remain in the suite. These are test doubles, not live Foundry multiplayer proof.

Live review must confirm player browsing of a GM-only NPC, category labels/order, empty tabs,
search focus, basket scrolling at common window sizes, portrait/token rename propagation,
percentage totals, and one approved transaction from each of two competing player clients.
Refresh stock after remote inventory or catalogue-selection changes. Stock changes are not pushed
continuously in this sprint. No Tavern expansion or service execution is authorized by this release.
