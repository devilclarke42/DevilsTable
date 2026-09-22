# Changelog

All significant changes are documented here. Versions in this file describe repository builds;
they do not imply a public GitHub Release exists.

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
