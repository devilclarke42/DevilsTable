# Changelog

All significant changes are documented here. Versions in this file describe repository builds;
they do not imply a public GitHub Release exists.

## 0.2.0-alpha.5 — 2026-09-24 — Shop and category stock RollTables

### Added

- A separate **Build/Rebuild Stock RollTables → Open RollTable Builder** settings button,
  with read-only preview, confirmed build, shop/category filters and an independent last-build record.
- Canonical stock profiles, strict validation and an append-only table-ID ledger. Five whole-shop
  sets and 25 category sets generate 120 native V14 tables: Always, Often, Rarely and Rotating Stock.
- A dedicated world RollTable compendium with stable table/result identities, real references to
  the existing Item compendium, native model preflight and actionable missing-item errors.
- Always tables return every core good in one draw. Rotating tables default to 80% Often,
  15% Rarely and 5% no extra stock. Empty tiers add no item. These are editable project defaults.
- Explicit shop overrides: Lamp Oil is Often at the Alchemist; Lockbox is Often at the Blacksmith;
  Lockbox and Silk Rope are Often at the Black Market. Original item availability is unchanged.
- A read-only **Roll Stock** action/API that includes all Always goods and samples built rotating
  tables without duplicate items, automatic quantities, chat messages or inventory changes.
- Focused table generation, embedded-result reconciliation, interruption/retry, UUID, permission,
  validation and sampling regressions; a stock guide and expanded live acceptance checklist.

### Changed and preserved

- Reused the existing preview/batch/verification/lock lifecycle through small optional extension
  points. Table reconciliation uses explicit embedded-result operations, including removal of
  obsolete owned rows, while preserving Items, whole tables, folders and unrelated data.
- Table comparisons ignore result storage order and accept the existing narrow description-HTML
  equivalence. Custom rows in selected generated tables block writes instead of being removed.
- All 69 canonical item records, prices, weights, IDs and generated Item fields remain unchanged.
  Merchant Notes remain builder-only and never enter either compendium.
- General Store is complete for the agreed list. Other shop tables cover only existing shared
  goods and explicitly report partial coverage; no additional shop catalogue was invented.
- The user reported alpha.4 worked and accepted its prices and goods. New RollTable behavior
  still requires live Foundry/Forge testing. No hosted install manifest or public release was added.

### Validation

- All 171 automated tests pass, including the previous 133 Item/framework regressions.
- Source validation reports 69 Items and 120 stock tables. The verified runtime ZIP contains
  76 files, one module manifest and no tests, developer tools or generated compendium databases.

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
