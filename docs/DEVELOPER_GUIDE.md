# Developer Guide

**Audience:** first-time code contributors and maintainers. **Purpose:** explain the working environment, layout and conventions.

## Setup

Use Node.js 20 or later; CI uses Node 24. The project is native ES modules with no npm dependencies. Python 3 is required by the HTML regression helper; packaging requires `zip` and `unzip`. Foundry and D&D5e are runtime dependencies, not bundled development libraries.

```sh
npm run check
npm run package
```

`check` validates documentation, source, manifests, imports and JavaScript syntax, then runs tests. `package` performs those checks and creates the versioned runtime ZIP under `dist/`. The archive has one `devils-table-merchants/` root and one manifest.

## Repository layout

| Path | Purpose |
| --- | --- |
| `data/` | Canonical product arrays, registries, economic/stock policy, presets and ID ledgers |
| `schemas/` | Deliberately bounded source-schema vocabulary |
| `scripts/` | Foundry runtime ES modules; entry point is `scripts/main.js` |
| `templates/` | Handlebars templates used by ApplicationV2 interfaces |
| `styles/` | Module-scoped UI styling |
| `assets/icons/` | Shared original runtime artwork |
| `tests/` | Node tests, Foundry model doubles and intentional historical regression fixtures |
| `tools/` | Source/docs checks, packaging and reproducible artwork utilities |
| `docs/` | Permanent guides and isolated provenance archive |
| `.github/workflows/` | Validation, ID-history checks and test ZIP artifacts |
| `dist/` | Ignored generated ZIP output; never canonical source |

There is no need for empty `src/`, `packs/` or `lang/` placeholders. Runtime code already has a clear `scripts/` home; packs are generated in the world. Localisation is not implemented and belongs to future scope.

## Coding conventions

Use relative ES-module imports and lowercase kebab-case names. Keep pure functions injectable so meaningful behaviour can be tested without running Foundry. Use native document APIs and supported D&D5e field shapes. Validate before mutation, await writes, verify the saved state and preserve unrelated fields.

Keep UI controllers/templates distinct from data, pricing and transfer logic. New merchant differences should be expressible as data. External module knowledge belongs in `scripts/integrations/`. Do not add global prototype patches, inline scripts in JSON, silent fallbacks to unrelated catalogues or a parallel currency/inventory system.

Guard GM administration against active trades and unresolved recovery; detect stale editable state. Public projections should use explicit fields rather than spreading private documents. Treat dictionaries and saved IDs as untrusted inputs until validated. See [Architecture](ARCHITECTURE.md).

## Content and identities

Register source files in `data/catalogue.json`; `data/catalogues.json` defines merchant types. Add permanent reservations without removing retired IDs. Keep the ID hash mapping and collection identifiers stable. Display names and file locations can change without identity migration. See [Source Data](SOURCE_DATA.md) and [Stock Tables](STOCK_TABLES.md).

## Documentation conventions

Use one authoritative page per subject, with an audience/purpose statement and task-oriented sections. Link rather than copying another guide. Put current behaviour in permanent guides, meaningful user changes in the root changelog and direction in the root roadmap. Clearly label historical provenance. Do not add temporary sprint/pathway documents to the installed module.

## Extensions and release work

Use [Public API](API_REFERENCE.md) and [Integration Developers](INTEGRATION_DEVELOPERS.md) rather than importing implementation classes. Pre-release APIs remain subject to documented change. For verification and publication follow [Testing](TESTING.md) and [Release Process](RELEASE_PROCESS.md). Contributors start with [CONTRIBUTING.md](../CONTRIBUTING.md).
