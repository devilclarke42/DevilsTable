# Complete repository file map

This inventory covers the framework, 144-item General Store, stock RollTable workflow and official
development standards.
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
| `CHANGELOG.md` | Detailed alpha-build history and documentation changes; milestone history lives under `docs/`. |
| `ROADMAP.md` | Implementation checklists and remaining live QA; versioned milestones live under `docs/`. |

## Canonical data and schemas

| File | Responsibility |
| --- | --- |
| `data/catalogue.json` | Versioned registry of source files, five shop tags, categories, rules baseline and weight policy. |
| `data/shops.json` | Five shop definitions with required builder-only Merchant Notes in three stock tiers. |
| `data/categories.json` | Ten curated General Store categories, descriptions and planned item names. |
| `data/items/general-store/containers.json` | The 13 authored Containers records: identities, text, economics, empty weights, capacities, icons and metadata. |
| `data/items/general-store/fire-lighting.json` | 17 lights, fuels and fire-making goods with explicit burn/use conventions. |
| `data/items/general-store/rope-climbing.json` | Ten ropes, anchors and climbing supplies with explicit lengths and bundle sizes. |
| `data/items/general-store/camping.json` | 21 bedding, shelter and cooking/tableware entries, including four native vessels. |
| `data/items/general-store/writing.json` | 13 writing and sealing goods, including a filled consumable ink bottle. |
| `data/items/general-store/household.json` | 18 cleaning, sewing and laundry goods, including a native wash bucket. |
| `data/items/general-store/animal.json` | 12 feed, grooming and tack supplies, including a feed bag and daily ration. |
| `data/items/general-store/travel.json` | 13 walking, navigation and signalling items, including the specialist compass and spyglass. |
| `data/items/general-store/tools.json` | 16 ordinary hand tools, measuring aids and workshop supplies; no invented tool proficiency or weapon conversion. |
| `data/items/general-store/trade-goods.json` | Eleven measured raw materials with explicit lengths, areas, mass and packaging conventions. |
| `data/id-ledger.json` | Append-only reservations for permanent catalogue IDs, including retired IDs; now reserves all 144 General Store IDs. |
| `data/stock.json` | Canonical chances, five base shops plus three General Store variants, private variant notes, exclusions, draws and inherited tier overrides. |
| `data/table-id-ledger.json` | Append-only reservations for 132 permanent stock table IDs (32 active, 100 retired), independent of the Item ledger. |
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
| `scripts/data/stock-catalogue.js` | Stable table identities, inherited merchant variants, scope filters, exclusions and effective tier mapping. |
| `scripts/validation/schema-validator.js` | Small shared schema compiler, supporting only the documented keyword subset and rejecting unknown keywords. |
| `scripts/validation/catalogue-validator.js` | Cross-file ID and normalized display-name uniqueness, reservations, shop/category references and collisions. |
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
| `scripts/apps/roll-table-builder-app.js` | Separate ApplicationV2 GM window with shop/profile/category filters, coverage notices, preview, confirmed table build and read-only Roll Stock action. |
| `templates/compendium-builder.hbs` | Accessible builder layout and action controls. |
| `templates/roll-table-builder.hbs` | Table builder controls, tier probabilities, builder-only Merchant Notes, stock report and independent last-build record. |
| `styles/devils-table.css` | Module-scoped layout, warnings, focus styles and report formatting. |

## Developer tools and tests

| File | Responsibility |
| --- | --- |
| `tools/files.mjs` | Runtime packaging allowlist and safe recursive file enumeration. |
| `tools/validate-data.mjs` | Catalogue/stock/manifest/import/syntax checks, generated table identity checks and optional history checks for both ID ledgers. |
| `tools/package.mjs` | Creates and checks a runtime-only ZIP with one correctly placed module manifest. |
| `tools/render-general-store-icons.py` | Editable original vector masters and optional Inkscape/Pillow export to twelve 256×256 WebPs; excluded from runtime. |
| `tests/fixtures/general-store-alpha6-hashes.json` | Frozen hashes of all 69 accepted source records, with baseline commit provenance. |
| `tests/fixtures/core-icon-references.json` | Reviewed core icon paths and source references; does not assert live asset resolution. |
| `tests/sprint3.test.js` | Original-content preservation, both upgrades, required metadata/assets, name uniqueness, merchant variants, quantities and historical cleanup protection. |
| `tests/fixtures/item.json` | One synthetic ordinary-good fixture; never packaged or loaded as production content. |
| `tests/helpers.js` | Catalogue fixture loader and in-memory persistence double. |
| `tests/validation.test.js` | Schema, catalogue, path, ledger and 5,000-item scale checks. |
| `tests/builder.test.js` | Stable conversion, safe planning, idempotence, batches, conflicts and failure-recovery regression checks. |
| `tests/adapter.test.js` | Checks Foundry adapter boundary calls and guards with mocked globals. Not a live runtime test. |
| `tests/startup.test.js` | Imports the runtime with mocked globals and checks hooks, V2 menu registration, API exposure and GM access. |
| `tests/containers.test.js` | Curated category completeness, shop notes isolation, prices, container capacities, filtered reconciliation and shared identities. |
| `tests/read-back.test.js` | Simulated HTML save/rebuild regressions, strict non-HTML fields, mismatch diagnostics and cleanup error preservation. |
| `tests/general-store.test.js` | Purchase units, consumable modes, light metadata, new vessels, activity identity, strict validation and Containers-to-full-catalogue upgrades. |
| `tests/stock-tables.test.js` | Native table shape, permanent UUIDs, stock tiers/chances, notes isolation, filtered builds, retry convergence, profile validation and duplicate-free read-only sampling. |
| `tests/roll-table-adapter.test.js` | Mocked native preflight, missing references, target guards, embedded create/update/delete, preserved metadata, batching and interrupted-row recovery. |
| `tests/stock-quantities.test.js` | Exhaustive percentile distributions, price/scarcity trends, category selection, sale-unit handling and invalid policies. |
| `tests/legacy-table-cleanup.test.js` | Eligible legacy cleanup with 32 active tables, exact approval, protected edits/dependency chains, concurrency, failure and retry. |

## Documentation

| File | Responsibility |
| --- | --- |
| `docs/CONTENT_STANDARD.md` | Official item authoring standard: permanent IDs, naming, descriptions, sale units, fields, categories, tags, shops and validation. |
| `docs/PRICE_GUIDE.md` | Copper/silver economy, denomination bands, purchase-unit comparisons and stock-band effects. |
| `docs/WEIGHT_GUIDE.md` | Variant Encumbrance rationale, adjusted weights, official comparisons, contents and capacity conventions. |
| `docs/MERCHANT_STANDARD.md` | Merchant experience, shared products, Merchant Notes, frequency/context definitions and current stock/quantity behaviour. |
| `docs/ICON_STANDARD.md` | Shared icon policy, new 256×256 WebP standards, legacy compatibility, deduplication and provenance. |
| `docs/DESIGN_DECISIONS.md` | Durable accepted decisions with their rationale, consequences and migration boundaries. |
| `docs/RELEASE_PROCESS.md` | Validation, builders, compendiums, RollTables, upgrade acceptance, versioning, changelogs and ZIP/publication gates. |
| `docs/ROADMAP.md` | Official 0.2.0–1.0 milestones, current status and explicit acceptance criteria. |
| `docs/CHANGELOG.md` | Official Keep a Changelog milestone/release history, including honest foundation and in-development status. |
| `docs/ARCHITECTURE.md` | Decisions, build flow, API contract, limitations and primary technical references. |
| `docs/SOURCE_DATA.md` | Authoring fields, permanent-ID policy, provenance and future content-review workflow. |
| `docs/TESTING.md` | Automated scope and pending live Foundry/Forge acceptance checklist. |
| `docs/FILE_MAP.md` | This complete file-by-file inventory. |
| `docs/CONTAINERS_REVIEW.md` | Review table for the 13 items, balance decisions, capacity caveats and icon provenance. |
| `docs/GENERAL_STORE_REVIEW.md` | All 56 additional prices, weights, purchase units and IDs; mechanics choices and source/icon references. |
| `docs/SPRINT_3_REVIEW.md` | Current 144-item review table, category totals, profile decisions, artwork provenance and upgrade evidence. |
| `docs/STOCK_TABLES.md` | Stock coverage, table counts, tier rules, separate settings workflow, native draws, defaults for review and rebuild policy. |
| `docs/merchant/MERCHANT_SYSTEM_SPECIFICATION.md` | Sprint 4 proposed persistent NPC merchant experience, access, state and review boundaries. |
| `docs/merchant/DATA_MODEL.md` | Proposed Actor/embedded Item flags, PC relationships, receipts, wallet and coin modes. |
| `docs/merchant/UI_WIREFRAMES.md` | Player, GM, negotiation, restock and history interface sketches in accessible tables. |
| `docs/merchant/WORKFLOW_DIAGRAMS.md` | Checkout, negotiation, restock, multiplayer authority and recovery paths. |
| `docs/merchant/TECHNICAL_JUSTIFICATION.md` | Requirement challenges, native Foundry decisions, limits and primary references. |
| `docs/merchant/IMPLEMENTATION_ROADMAP.md` | Review gate, blocking V14 proofs, phased implementation and migration/performance plan. |

## Original module artwork

Each SVG and WebP is an original project icon, with no remote dependency. The distribution license for
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
| `assets/icons/buttons.webp` | Wooden Buttons; 256×256 WebP |
| `assets/icons/candle-holder.webp` | Candle Holder (sold empty); 256×256 WebP |
| `assets/icons/candle-snuffer.webp` | Candle Snuffer; 256×256 WebP |
| `assets/icons/clothes-pegs.webp` | Clothes Pegs; 256×256 WebP |
| `assets/icons/comb.webp` | Comb; 256×256 WebP |
| `assets/icons/crowbar.webp` | Crowbar; 256×256 WebP |
| `assets/icons/document-case.webp` | Document Case; 256×256 WebP |
| `assets/icons/hinges.webp` | Door Hinges; 256×256 WebP |
| `assets/icons/mortar-pestle.webp` | Mortar and Pestle; 256×256 WebP |
| `assets/icons/thimble.webp` | Thimble; 256×256 WebP |
| `assets/icons/whetstone.webp` | Whetstone; 256×256 WebP |
| `assets/icons/writing-tablet.webp` | Shared by Wax Tablet and Slate; 256×256 WebP |

Generated `dist/` ZIPs are disposable developer output. `world.devils-table-items` and
`world.devils-table-stock-tables` are generated inside each Foundry world. None is a canonical
source. Empty scratch directories have
no repository identity and are not committed or included in the runtime package.
