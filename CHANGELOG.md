# Changelog

All significant changes are documented here. Versions in this file describe repository builds;
they do not imply a public GitHub Release exists.

## 0.2.0-alpha.4 — 2026-09-23 — Complete General Store categories

### Added

- 56 canonical items: Fire & Lighting (12), Rope & Climbing (6), Camping (11), Writing (7),
  Household (9), Animal (6) and Travel (5). The General Store now contains all 69 approved items.
- Permanent ID reservations, original descriptions, whole cp/sp/gp prices, adjusted weights and
  rationales, icons, availability, provenance, tags and shared-shop membership for each new item.
- Explicit purchase units for lengths, bundles, kits, filled goods and empty vessels. The schema's
  optional `saleUnit` field preserves compatibility with the original 13 records.
- A small native D&D5e consumable converter: eight goods consume one completed sale unit;
  four reusable lights and the climber's kit have non-consuming utility activities. Owning-item
  consumption references survive actor imports; item and activity IDs are deterministic.
- Structured light range, shape, fuel and duration metadata, with validation for compatible
  modes and total dim reach. No automatic token lighting, burn timer, fuel transfer or attack rolls.
- Six native containers outside the Containers category: Cooking Pot, Camp Kettle, Cup, Bowl,
  Wash Bucket and Feed Bag. Contents contribute ordinary carried weight.
- 15 original module-owned SVG icons; other icons reference the verified core library.
- General Store review tables, source/mapping documentation and focused upgrade/activity regressions.

### Validation and scope

- All 69 records validate and 133 automated tests pass. A simulated upgrade creates 56 items,
  leaves 13 unchanged and then converges to 69 unchanged on rerun. Existing Containers JSON and
  generated fields are unchanged; no IDs are renamed and no builder deletion is introduced.
- The user reported success after the alpha.3 read-back fix. Full environment details were not
  supplied; new alpha.4 content, utility activities and icons still need live Foundry/Forge acceptance.
- Merchant Notes remain builder-only. The price mix is 31 copper, 27 silver and 11 gold purchases.
- Installation remains a versioned custom-package ZIP; no hosted install manifest, public release,
  distribution-license selection or additional shop catalogue was created.

## 0.2.0-alpha.3 — 2026-09-23 — Read-back comparison fix

### Fixed

- Description comparison now accepts equivalent apostrophe/quotation-mark HTML entities and
  `<br>` serialization. The old literal comparison produced false updates for Backpack and
  Waterskin when simulating a server save that decoded apostrophe entities.
- Preview, build reconciliation and read-back verification share the same narrow comparison.
  Prices, weights, capacities, IDs, metadata, description text and other markup stay strict.
- Genuine verification failures now identify source IDs, field paths and expected/saved values,
  with bounded output. The saved build record and cleanup errors retain these details.

### Validation and scope

- Added regressions for equivalent HTML saves, idempotent reruns, real field drift, missing Items,
  bounded reports and lock-restoration failures. The original tests used exact-copy persistence
  doubles and did not model server-side HTML serialization.
- All 13 source records, permanent IDs, economics and category scope are unchanged.
- Alpha.2's user-reported live read-back failure is recorded. The exact live field was not included
  in that report; this patch fixes a reproduced comparison bug and makes any other cause visible.
- Live Foundry/Forge retesting remains pending. ZIP-only installation continues; no hosted manifest
  or public release was created.

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
