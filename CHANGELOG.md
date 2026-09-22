# Changelog

All significant changes are documented here. Versions in this file describe repository builds;
they do not imply a public GitHub Release exists.

## 0.2.0-alpha.2 — 2026-09-22 — General Store / Containers review

### Added

- Definitions for all five shops with required builder-only Always / Often / Rarely Stocks notes.
- All eight curated General Store categories and the complete requested planning lists.
- Exactly 13 Containers source records and permanent ID reservations: Backpack, Pouch, Sack,
  Chest, Lockbox, Barrel, Crate, Basket, Bottle, Flask, Waterskin, Clay Jug and Ceramic Jar.
- Original descriptions, local core-icon references, provenance, availability, tags, whole-coin
  prices, adjusted empty weights and explicit contents capacities for each item.
- Native D&D5e container conversion, US liquid-volume mapping and normal contents encumbrance.
- Shop/category builder filters, category counts/plans, pricing-band counts and Merchant Notes display.
- Shared shop/category schemas and conditional item validation; regression coverage for capacities,
  pricing boundaries, metadata isolation, filtered builds and shared identities.
- A Containers review table and updated source contract, file map and live acceptance checklist.

### Changed

- Replaced the empty General Store placeholder with a dedicated Containers source file.
- Updated unused category slugs to the requested General Store taxonomy; no production IDs were renamed.
- Prices now use positive whole cp/sp/gp; cp/sp amounts are 1–9 and 25 gp starts the specialist band.
- Builds still validate the entire catalogue, then operate only on the selected authored entries.
- Module/package version is now `0.2.0-alpha.2`; installation remains via a packaged ZIP.

### Review boundary

- Other categories contain no item records. Merchant Notes never enter generated Item data.
- No stock randomisation, quantity generation, lock automation, liquid consumption or pack deletion.
- No hosted installation manifest, public release, license selection or live Foundry/Forge verification.
- Stop after Containers for owner review.

## 0.2.0-alpha.1 — 2026-09-22 — Sprint 2 framework

### Added

- Foundry V14 / D&D5e 5.3.3 module manifest and modular startup/settings/logging.
- Canonical JSON registry for five future shop types, categories, an empty General Store
  data file and an append-only permanent-ID ledger.
- Shared JSON Schema vocabulary and structural/cross-file validators with actionable locations.
- Deterministic 16-character document identity separate from permanent catalogue identity.
- D&D5e 5.3.3 converter for mundane `loot`, explicitly carrying the 2014 rules baseline,
  adjusted weight, source attribution and multi-shop metadata.
- Active-GM builder with read-only preview, preflight, conflict detection, batched upserts,
  read-back checks, progress, original-lock restoration and last-build records.
- ApplicationV2 settings UI with build confirmation and accessible status report.
- Synthetic tests, 5,000-item validation test, local checks, runtime ZIP tooling and read-only CI.
- Architecture, source-data contract, complete file inventory, test checklist and roadmap.

### Changed

- Expanded the existing one-line README. No prior implementation existed on `main`.

### Explicitly not included

- No production item content, previous ZIP import, combat automation, shop UI or public release.
- No deletion/replacement of compendium documents and no changes to world rules or inventories.
- No live Foundry/Forge verification claim. Installation/upgrade URLs await an actual release.
