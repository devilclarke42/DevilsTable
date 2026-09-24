# Complete repository file map

This inventory covers the framework, 69-item General Store and generated stock RollTable workflow.
Existing modules were extended in place, with separate table conversion, persistence and UI helpers.
Generated compendiums and ZIPs are not included in this inventory.

## Root and automation

| File | Responsibility |
| --- | --- |
| `module.json` | Foundry identity, framework version, target versions, runtime entry points and project links. No nonexistent release URLs or verification claim. |
| `package.json` | Node development commands; no npm dependencies. Not needed by Foundry. |
| `.gitignore` | Excludes dependencies, generated ZIPs and build output from commits. |
| `.github/workflows/validate.yml` | Runs checks/tests, enforces append-only ID history and uploads a module ZIP. Read-only repository permissions; pinned actions; no release publishing. |
| `README.md` | Project status, install/build instructions, safety contract and documentation entry point. |
| `CHANGELOG.md` | Exact Sprint 2 additions and exclusions. |
| `ROADMAP.md` | Completion gates, remaining live QA and future content/system work. |

## Canonical data and schemas

| File | Responsibility |
| --- | --- |
| `data/catalogue.json` | Versioned registry of source files, five shop tags, categories, rules baseline and weight policy. |
| `data/shops.json` | Five shop definitions with required builder-only Merchant Notes in three stock tiers. |
| `data/categories.json` | Eight curated General Store categories, descriptions and planned item names. |
| `data/items/general-store/containers.json` | The 13 authored Containers records: identities, text, economics, empty weights, capacities, icons and metadata. |
| `data/items/general-store/fire-lighting.json` | 12 lights, fuels and fire-making goods with explicit burn/use conventions. |
| `data/items/general-store/rope-climbing.json` | Six ropes, anchors and climbing supplies with explicit lengths and bundle sizes. |
| `data/items/general-store/camping.json` | 11 bedding, shelter and cooking/tableware entries, including four native vessels. |
| `data/items/general-store/writing.json` | Seven writing and sealing goods, including a filled consumable ink bottle. |
| `data/items/general-store/household.json` | Nine cleaning, sewing and laundry goods, including a native wash bucket. |
| `data/items/general-store/animal.json` | Six feed, grooming and tack supplies, including a feed bag and daily ration. |
| `data/items/general-store/travel.json` | Five walking, navigation and signalling items, including the specialist compass and spyglass. |
| `data/id-ledger.json` | Append-only reservations for permanent catalogue IDs, including retired IDs; now reserves all 69 General Store IDs. |
| `data/stock.json` | Canonical stock chances, five shop profiles, category scopes, draw counts, coverage notices and explicit per-shop availability overrides. |
| `data/table-id-ledger.json` | Append-only reservations for 120 permanent stock table IDs, independent of the Item ledger. |
| `data/stock-quantities.json` | Weighted percentile quantity profiles and the complete effective-tier/price-band matrix, measured in sale units. |
| `schemas/catalogue.schema.json` | Structure, allowed fields and safe path formats for the catalogue registry. |
| `schemas/item.schema.json` | Required item fields, field shapes and currently supported converter types. |
| `schemas/shops.schema.json` | Shop fields and required nonempty Merchant Notes tiers. |
| `schemas/categories.schema.json` | Shop category definitions and editorial planning lists. |
| `schemas/stock.schema.json` | Strict structural stock profile contract shared by runtime and Node checks. |
| `schemas/stock-quantities.schema.json` | Structural contract for quantity profiles, outcomes and mapping rules. |

## Runtime code

| File | Responsibility |
| --- | --- |
| `scripts/main.js` | Registers settings on `init`; exposes the frozen API; logs startup. No automatic builds. |
| `scripts/constants.js` | Shared module identity, Item/RollTable target collections and batch size constants. |
| `scripts/core/logger.js` | Prefixed logging; optional client debug output. |
| `scripts/core/settings.js` | Debug setting, separate last-build records and separate restricted Item/RollTable builder menus. |
| `scripts/data/catalogue-loader.js` | Loads all four schemas, shop/category definitions, registry, ledger and content; bounded item-file concurrency; filename-aware errors. |
| `scripts/data/shop-catalogue.js` | Pure selection and builder view model: categories, authored counts, price-band counts and Merchant Notes. |
| `scripts/data/stock-loader.js` | Loads stock policy, schema and table ledger alongside the unchanged Item catalogue loader. |
| `scripts/data/stock-catalogue.js` | Stable table identity convention, shop/category scope selection, availability mapping and per-shop tier overrides. |
| `scripts/validation/schema-validator.js` | Small shared schema compiler, supporting only the documented keyword subset and rejecting unknown keywords. |
| `scripts/validation/catalogue-validator.js` | Cross-file uniqueness, permanent-ID reservations, shop/category references and collision checks. |
| `scripts/validation/shop-validator.js` | Structural shop/category validation, complete shop coverage, unique definitions and nonconflicting stock guidance. |
| `scripts/validation/item-rules.js` | Pricing bands and whole-coin limits; conditional type/subtype, capacity, use-mode and light consistency checks. |
| `scripts/validation/stock-validator.js` | Full catalogue plus stock validation: chances, coverage, overrides, draw bounds, profile identity and table reservations/collisions. |
| `scripts/validation/quantity-validator.js` | Distribution totals/bounds, unique mappings, complete tier/price coverage, scarcity trends and rare-stock limits. |
| `scripts/builders/document-id.js` | Frozen mapping from permanent IDs to deterministic 16-character Foundry IDs. |
| `scripts/builders/item-factory.js` | Pure D&D5e conversion routing, escaped descriptions, exact weights, sale-unit/light metadata and provenance flags. |
| `scripts/builders/container-factory.js` | Native container fields, source capacities mapped to pounds/cubic feet, ordinary contents encumbrance. |
| `scripts/builders/consumable-factory.js` | Native mundane food/trinket utility activities, stable embedded IDs and explicit consuming/reusable semantics. |
| `scripts/builders/build-plan.js` | Read-only conflict detection and create/update/unchanged/preserved plan. No deletions. |
| `scripts/builders/generated-fields.js` | Shared comparison of owned fields, narrow HTML serialization equivalence and bounded read-back diagnostics. |
| `scripts/builders/foundry-adapter.js` | Foundry-specific permission/version checks, model preflight, pack operations and saved build record. |
| `scripts/builders/compendium-builder.js` | Orchestrates validation through verification, batched writes, local overlap guard and lock/error cleanup. |
| `scripts/builders/roll-table-factory.js` | Pure conversion into four native V14 tables per scope; real UUID references, Always ranges, weighted rotating tiers and operational descriptions. |
| `scripts/builders/roll-table-plan.js` | Order-independent result comparison, generated-row ownership/identity checks and table read-back diagnostics. |
| `scripts/builders/roll-table-adapter.js` | Native preflight, referenced-Item checks, separate table pack, bounded embedded-result reconciliation and independent saved build record. |
| `scripts/builders/roll-table-builder.js` | Stock validation and table preparation wired into the shared build lifecycle through optional extension points. |
| `scripts/builders/stock-operation.js` | Shared client overlap guard for stock builds and legacy cleanup. |
| `scripts/builders/legacy-table-cleanup.js` | Exact preview/approval, protected-data/reference planning and bounded verified deletion of superseded category tables. |
| `scripts/stock/stock-roller.js` | Read-only stock lists from current built tables; all Always goods, bounded rotating draws, duplicate prevention and no rare promotion on empty tiers. |
| `scripts/stock/stock-quantities.js` | One checked percentile quantity roll per selected item using its effective tier and canonical price band. |
| `scripts/apps/compendium-builder-app.js` | ApplicationV2 GM interface, shop/category selection, stock guidance, confirmation, progress and reports. |
| `scripts/apps/roll-table-builder-app.js` | Separate ApplicationV2 GM window with shop/category filters, coverage notices, preview, confirmed table build and read-only Roll Stock action. |
| `templates/compendium-builder.hbs` | Accessible builder layout and action controls. |
| `templates/roll-table-builder.hbs` | Table builder controls, tier probabilities, builder-only Merchant Notes, stock report and independent last-build record. |
| `styles/devils-table.css` | Module-scoped layout, warnings, focus styles and report formatting. |

## Developer tools and tests

| File | Responsibility |
| --- | --- |
| `tools/files.mjs` | Runtime packaging allowlist and safe recursive file enumeration. |
| `tools/validate-data.mjs` | Catalogue/stock/manifest/import/syntax checks, generated table identity checks and optional history checks for both ID ledgers. |
| `tools/package.mjs` | Creates and checks a runtime-only ZIP with one correctly placed module manifest. |
| `tests/fixtures/item.json` | One synthetic ordinary-good fixture; never packaged or loaded as production content. |
| `tests/helpers.js` | Catalogue fixture loader and in-memory persistence double. |
| `tests/validation.test.js` | Schema, catalogue, path, ledger and 5,000-item scale checks. |
| `tests/builder.test.js` | Stable conversion, safe planning, idempotence, batches, conflicts and failure-recovery regression checks. |
| `tests/adapter.test.js` | Checks Foundry adapter boundary calls and guards with mocked globals. Not a live runtime test. |
| `tests/startup.test.js` | Imports the runtime with mocked globals and checks hooks, V2 menu registration, API exposure and GM access. |
| `tests/containers.test.js` | Curated category completeness, shop notes isolation, prices, container capacities, filtered reconciliation and shared identities. |
| `tests/read-back.test.js` | Simulated HTML save/rebuild regressions, strict non-HTML fields, mismatch diagnostics and cleanup error preservation. |
| `tests/general-store.test.js` | Purchase units, consumable modes, light metadata, new vessels, activity identity, strict validation and 13-to-69 upgrades. |
| `tests/stock-tables.test.js` | Native table shape, permanent UUIDs, stock tiers/chances, notes isolation, filtered builds, retry convergence, profile validation and duplicate-free read-only sampling. |
| `tests/roll-table-adapter.test.js` | Mocked native preflight, missing references, target guards, embedded create/update/delete, preserved metadata, batching and interrupted-row recovery. |
| `tests/stock-quantities.test.js` | Exhaustive percentile distributions, price/scarcity trends, category selection, sale-unit handling and invalid policies. |
| `tests/legacy-table-cleanup.test.js` | Safe 120-to-20 upgrades, exact approval, protected edits/dependency chains, concurrency, failure and retry. |

## Documentation

| File | Responsibility |
| --- | --- |
| `docs/ARCHITECTURE.md` | Decisions, build flow, API contract, limitations and primary technical references. |
| `docs/SOURCE_DATA.md` | Authoring fields, permanent-ID policy, provenance and future content-review workflow. |
| `docs/TESTING.md` | Automated scope and pending live Foundry/Forge acceptance checklist. |
| `docs/FILE_MAP.md` | This complete file-by-file inventory. |
| `docs/CONTAINERS_REVIEW.md` | Review table for the 13 items, balance decisions, capacity caveats and icon provenance. |
| `docs/GENERAL_STORE_REVIEW.md` | All 56 additional prices, weights, purchase units and IDs; mechanics choices and source/icon references. |
| `docs/STOCK_TABLES.md` | Stock coverage, table counts, tier rules, separate settings workflow, native draws, defaults for review and rebuild policy. |

## Original module artwork

Each SVG is an original project icon, with no remote dependency. The distribution license for
original project material remains pending. Core icon references are supplied by Foundry itself.

| File | Depicts / used for |
| --- | --- |
| `assets/icons/bedroll-strap.svg` | Buckled leather strap / Bedroll Strap |
| `assets/icons/brush.svg` | Bristled grooming brush / Brush |
| `assets/icons/chalk.svg` | White chalk sticks / Chalk |
| `assets/icons/charcoal.svg` | Charcoal pieces / Charcoal |
| `assets/icons/compass.svg` | Magnetic needle and dial / Compass |
| `assets/icons/curry-comb.svg` | Ridged metal grooming comb / Curry Comb |
| `assets/icons/flint-steel.svg` | Flint, striker and sparks / Flint & Steel; Tinderbox |
| `assets/icons/mop.svg` | Cloth mop / Mop |
| `assets/icons/needle.svg` | Sewing needle and thread / Needle |
| `assets/icons/plate.svg` | Wooden plate / Wooden Plate |
| `assets/icons/sealing-stamp.svg` | Hand stamp and wax seal / Sealing Stamp |
| `assets/icons/sewing-kit.svg` | Cloth wallet and sewing implements / Sewing Kit |
| `assets/icons/spoon.svg` | Wooden spoon / Spoon |
| `assets/icons/thread.svg` | Spool of thread / Thread |
| `assets/icons/washboard.svg` | Ribbed wash board / Wash Board |

Generated `dist/` ZIPs are disposable developer output. `world.devils-table-items` and
`world.devils-table-stock-tables` are generated inside each Foundry world. None is a canonical
source. Empty scratch directories have
no repository identity and are not committed or included in the runtime package.
