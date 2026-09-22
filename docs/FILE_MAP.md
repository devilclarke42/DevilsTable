# Complete repository file map

Before this sprint, `main` contained only `README.md` with the heading `# Devil's Table`.
That file was expanded; every other tracked file below is additive. The earlier local draft
was not a repository implementation and no earlier item catalogue was imported.

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
| `data/items/general-store.json` | Empty production content array; intentionally no item expansion. |
| `data/id-ledger.json` | Append-only reservations for permanent catalogue IDs, including retired IDs. Starts empty. |
| `schemas/catalogue.schema.json` | Structure, allowed fields and safe path formats for the catalogue registry. |
| `schemas/item.schema.json` | Required item fields, field shapes and currently supported converter types. |

## Runtime code

| File | Responsibility |
| --- | --- |
| `scripts/main.js` | Registers settings on `init`; exposes the frozen API; logs startup. No automatic builds. |
| `scripts/constants.js` | Shared module identity, target collection and batch size constants. |
| `scripts/core/logger.js` | Prefixed logging; optional client debug output. |
| `scripts/core/settings.js` | Debug setting, last-build world record and restricted builder menu. |
| `scripts/data/catalogue-loader.js` | Loads schemas, registry, ledger and registered content; bounded network concurrency; filename-aware errors. |
| `scripts/validation/schema-validator.js` | Small shared schema compiler, supporting only the documented keyword subset and rejecting unknown keywords. |
| `scripts/validation/catalogue-validator.js` | Cross-file uniqueness, permanent-ID reservations, shop/category references and collision checks. |
| `scripts/builders/document-id.js` | Frozen mapping from permanent IDs to deterministic 16-character Foundry IDs. |
| `scripts/builders/item-factory.js` | Pure D&D5e mundane-item conversion, escaped description, exact weight and provenance flags. |
| `scripts/builders/build-plan.js` | Read-only conflict detection and create/update/unchanged/preserved plan. No deletions. |
| `scripts/builders/foundry-adapter.js` | Foundry-specific permission/version checks, model preflight, pack operations and saved build record. |
| `scripts/builders/compendium-builder.js` | Orchestrates validation through verification, batched writes, local overlap guard and lock/error cleanup. |
| `scripts/apps/compendium-builder-app.js` | ApplicationV2 GM interface, confirmation, progress and reports. |
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

## Documentation

| File | Responsibility |
| --- | --- |
| `docs/ARCHITECTURE.md` | Decisions, build flow, API contract, limitations and primary technical references. |
| `docs/SOURCE_DATA.md` | Authoring fields, permanent-ID policy, provenance and future content-review workflow. |
| `docs/TESTING.md` | Automated scope and pending live Foundry/Forge acceptance checklist. |
| `docs/FILE_MAP.md` | This complete file-by-file inventory. |

Generated `dist/` ZIPs are disposable developer output. `world.devils-table-items` is generated
inside each Foundry world. Neither is a canonical item source. Empty scratch directories have
no repository identity and are not committed or included in the runtime package.
