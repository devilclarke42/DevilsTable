# Complete repository file map

This inventory covers the framework and the General Store / Containers review build.
The empty General Store placeholder was replaced by its first category file; existing
runtime modules were extended in place. Generated data is not included in this inventory.

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
| `data/id-ledger.json` | Append-only reservations for permanent catalogue IDs, including retired IDs; now reserves the 13 Containers IDs. |
| `schemas/catalogue.schema.json` | Structure, allowed fields and safe path formats for the catalogue registry. |
| `schemas/item.schema.json` | Required item fields, field shapes and currently supported converter types. |
| `schemas/shops.schema.json` | Shop fields and required nonempty Merchant Notes tiers. |
| `schemas/categories.schema.json` | Shop category definitions and editorial planning lists. |

## Runtime code

| File | Responsibility |
| --- | --- |
| `scripts/main.js` | Registers settings on `init`; exposes the frozen API; logs startup. No automatic builds. |
| `scripts/constants.js` | Shared module identity, target collection and batch size constants. |
| `scripts/core/logger.js` | Prefixed logging; optional client debug output. |
| `scripts/core/settings.js` | Debug setting, last-build world record and restricted builder menu. |
| `scripts/data/catalogue-loader.js` | Loads all four schemas, shop/category definitions, registry, ledger and content; bounded item-file concurrency; filename-aware errors. |
| `scripts/data/shop-catalogue.js` | Pure selection and builder view model: categories, authored counts, price-band counts and Merchant Notes. |
| `scripts/validation/schema-validator.js` | Small shared schema compiler, supporting only the documented keyword subset and rejecting unknown keywords. |
| `scripts/validation/catalogue-validator.js` | Cross-file uniqueness, permanent-ID reservations, shop/category references and collision checks. |
| `scripts/validation/shop-validator.js` | Structural shop/category validation, complete shop coverage, unique definitions and nonconflicting stock guidance. |
| `scripts/validation/item-rules.js` | Pricing bands and whole-coin limits; conditional loot/container requirements and positive capacity checks. |
| `scripts/builders/document-id.js` | Frozen mapping from permanent IDs to deterministic 16-character Foundry IDs. |
| `scripts/builders/item-factory.js` | Pure D&D5e loot/container conversion, escaped description, exact empty weight and item provenance flags. |
| `scripts/builders/container-factory.js` | Native container fields, source capacities mapped to pounds/cubic feet, ordinary contents encumbrance. |
| `scripts/builders/build-plan.js` | Read-only conflict detection and create/update/unchanged/preserved plan. No deletions. |
| `scripts/builders/generated-fields.js` | Shared comparison of owned fields, narrow HTML serialization equivalence and bounded read-back diagnostics. |
| `scripts/builders/foundry-adapter.js` | Foundry-specific permission/version checks, model preflight, pack operations and saved build record. |
| `scripts/builders/compendium-builder.js` | Orchestrates validation through verification, batched writes, local overlap guard and lock/error cleanup. |
| `scripts/apps/compendium-builder-app.js` | ApplicationV2 GM interface, shop/category selection, stock guidance, confirmation, progress and reports. |
| `templates/compendium-builder.hbs` | Accessible builder layout and action controls. |
| `styles/devils-table.css` | Module-scoped layout, warnings, focus styles and report formatting. |

## Developer tools and tests

| File | Responsibility |
| --- | --- |
| `tools/files.mjs` | Runtime packaging allowlist and safe recursive file enumeration. |
| `tools/validate-data.mjs` | Catalogue/manifest/import/syntax checks and optional historical ID-ledger check. |
| `tools/package.mjs` | Creates and checks a runtime-only ZIP with one correctly placed module manifest. |
| `tests/fixtures/item.json` | One synthetic ordinary-good fixture; never packaged or loaded as production content. |
| `tests/helpers.js` | Catalogue fixture loader and in-memory persistence double. |
| `tests/validation.test.js` | Schema, catalogue, path, ledger and 5,000-item scale checks. |
| `tests/builder.test.js` | Stable conversion, safe planning, idempotence, batches, conflicts and failure-recovery regression checks. |
| `tests/adapter.test.js` | Checks Foundry adapter boundary calls and guards with mocked globals. Not a live runtime test. |
| `tests/startup.test.js` | Imports the runtime with mocked globals and checks hooks, V2 menu registration, API exposure and GM access. |
| `tests/containers.test.js` | Curated category completeness, shop notes isolation, prices, container capacities, filtered reconciliation and shared identities. |
| `tests/read-back.test.js` | Simulated HTML save/rebuild regressions, strict non-HTML fields, mismatch diagnostics and cleanup error preservation. |

## Documentation

| File | Responsibility |
| --- | --- |
| `docs/ARCHITECTURE.md` | Decisions, build flow, API contract, limitations and primary technical references. |
| `docs/SOURCE_DATA.md` | Authoring fields, permanent-ID policy, provenance and future content-review workflow. |
| `docs/TESTING.md` | Automated scope and pending live Foundry/Forge acceptance checklist. |
| `docs/FILE_MAP.md` | This complete file-by-file inventory. |
| `docs/CONTAINERS_REVIEW.md` | Review table for the 13 items, balance decisions, capacity caveats and icon provenance. |

Generated `dist/` ZIPs are disposable developer output. `world.devils-table-items` is generated
inside each Foundry world. Neither is a canonical item source. Empty scratch directories have
no repository identity and are not committed or included in the runtime package.
