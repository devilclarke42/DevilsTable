# Changelog

All notable milestone and release changes are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and package versions follow
[Semantic Versioning](https://semver.org/).

This is the official milestone/release changelog. The root [build changelog](../CHANGELOG.md)
retains detailed alpha implementation history. A milestone entry does not assert that a public
GitHub Release or installation manifest exists. No release dates are invented for unreleased work.

## [0.3.0-alpha.4] — 2026-09-28 — Merchant Builder (Sprint 9)

### Added

- Single-panel GM Merchant Builder, editable settings and live generation estimates.
- Data-defined settlement/prosperity scaling, five built-in presets and private custom templates.
- Independent stock, float and notes regeneration; editable confirmed native cash previews.
- NPC-preserving conversion, stock maintenance, summaries and access to existing advanced controls.
- Infinite-stock offer configuration and relationship defaults for new customers.
- Merchant Guide and regression coverage for preservation, privacy, generation and panel actions.

### Changed

- Merchant Builder is the primary GM entry point; existing administration/recovery remains accessible.
- Existing stock and cash planners accept builder policy without duplicating catalogue Items.
- Tavern source content and activation state are unchanged. Restock scheduling and greetings remain deferred.

## [0.3.0-alpha.3] — 2026-09-28

### Added

- GM Merchant Summary and confirmed Empty Stock in the Shop Administration view.
- JSON-driven initial native currency float with one-time initialization and preservation safeguards.
- Shared administration/transaction guards and regression tests.

### Changed

- Public branding to Devil's Table: Trade & Merchants; internal identities remain stable.
- Descriptive Item catalogue, stock RollTable and private transaction history display names.
- Administration documentation, terminology, architecture and live acceptance checklist.
- No Tavern content, catalogue activation or new merchant gameplay changes.

This is a packaged development candidate, not a claim of a published GitHub Release or live validation.

## [0.3.0] — In Development

### Revised Sprint 8 scope

- `0.3.0-alpha.2` introduces the catalogue framework and data-driven Merchant UX. The active
  build returns to 144 General Store Items; the previous Tavern draft and every ID remain preserved
  as deferred review material. Existing world documents are preserved. No new Tavern content.
- Added provider registration, category metadata/visibility, live public-field search, catalogue
  selection and persistent basket pricing summaries. One shared Item compendium remains.
- Documented services and Merchant Builder integration boundaries without implementing them.
- Added [Project State](PROJECT_STATE.md) and the [extension contract](CATALOGUE_FRAMEWORK.md).
- Live acceptance of the framework candidate is pending. The alpha.1 entries below are historical.

### Added

- `0.3.0-alpha.1`: Sprint 8 Tavern catalogue with 152 new products in 19 menu categories and
  31 shared supplies (183 Tavern offerings, 296 unique catalogue Items).
- Live merchant portrait header using the Actor image, exact scene-token name and status, with
  a generic silhouette fallback and no new player Actor permissions.
- [Complete Tavern review and acceptance checklist](TAVERN_REVIEW.md).

### Changed

- Existing Tavern profile has complete authored coverage, eight dependable essentials and
  rotating menu choices with weighted quantities. Four Tavern tables and 32 total tables remain.
- General Store source is preserved. The Item upgrade creates 152 and preserves 144; the table
  upgrade updates four and preserves 28. Repeated builds converge. All 289 automated tests pass.
- Owner confirms alpha.25 works in their setup. New Tavern/portrait live checks remain pending.

## [Unreleased]

### Added

- `0.2.0-alpha.25` Sprint 7 interaction candidate: percentage pricing and immediate previews,
  independent character/shop modifiers, GM-approved native negotiation/theft rolls with private
  DCs, recoverable theft transfer, private counters and advisory merchant confidence. See the
  [operation and live acceptance report](merchant/SPRINT_7_INTERACTIONS.md). 282 automated tests
  pass; Sprint 7 live acceptance remains pending. Purchases/rejections/recovery were confirmed
  by the owner in the preceding transaction fixes.

- `0.2.0-alpha.14` Sprint 6 transaction candidate: real buying/selling, native currency,
  funds checks, GM price review, recoverable inventory writes, private ledger and merchant
  counters. 254 automated tests pass; live acceptance is pending.

- `0.2.0-alpha.8` Sprint 5 proof build: GM NPC merchant setup, separate player Shop UI, public
  Actor Item projection, local basket, checkout requests and GM review with one service slot.
  Approvals/rejections record GM-only demonstration receipts; Items and currency are unchanged.
- Sprint 5 prerequisite [validation report](merchant/SPRINT_5_VALIDATION.md) documenting the
  unavailable live Foundry environment, exact multiplayer proof steps and D&D5e 5.3.3 native
  currency schema inspection; historical prerequisite findings; subsequent user tests confirmed browsing and rejection.
- Sprint 4's approved [Merchant System design](merchant/MERCHANT_SYSTEM_SPECIFICATION.md),
  data model, UI wireframes, workflow diagrams, technical trade-offs and implementation roadmap.
  This remains the long-term design; current runtime status is documented in the Sprint 6 report.
- The Documentation Foundation: complete Content Standard, Price Guide, Weight Guide, Merchant
  Standard, Icon Standard, Design Decisions, Release Process, milestone Roadmap and this Changelog.
- Official conventions for permanent IDs, sale units, plain-language descriptions, categories,
  tags, shop sharing, provenance, validation and reviewed source-driven generation.
- Copper/silver economy and Variant Encumbrance guidance with examples from the actual catalogue.
- Shared-icon standards covering new 256×256 WebP artwork, existing core/SVG compatibility,
  asset budgets, deduplication and provenance review.
- Merchant frequency/context definitions, current implementation boundaries, quantity rules,
  upgrade guidance and release acceptance gates.

### Changed

- Merchant design specifies transaction history retention choices (Last 100, Last 500 by
  default, Last 1000 and Unlimited) without copying receipts into merchant Actor flags.
- Sprint 4 review specified a GM-only merchant Actor, dedicated player Shop UI, native D&D5e
  currency with optional change checking, per-character memory with companion links, private
  rejected-trade receipts and five merchant availability states. Live multiplayer proofs precede code.
- Documentation now distinguishes normative authoring standards, automated checks and future
  milestones explicitly. Root records retain their existing detailed build history.
- The Documentation Foundation sprint changed Markdown only; weighted-quantity and compact-table code was
  completed in the preceding stock feature commit.

## [0.2.0] — In Development

Current runtime candidate: **0.2.0-alpha.14**. The numbered General Store milestone is not yet a
stable public release.

### Added

- A modular Foundry V14 / D&D5e 5.3.3 framework with settings, logging, validation, deterministic
  identities, Item/RollTable builders, repeatable reconciliation and Forge-oriented ZIP packaging.
- Five merchant definitions with builder-only Merchant Notes and one canonical product shared
  across appropriate shop assignments.
- 144 finished General Store goods across ten curated categories, with permanent IDs,
  original descriptions, prices, adjusted weights, icons, availability and source attribution.
- 75 Sprint 3 additions, twelve lightweight 256×256 WebP icons, merchant-specific exclusions,
  tier overrides and private notes, required sale units/nonempty tags and duplicate-name validation.
- Native supported container and mundane consumable mappings, explicit purchase units,
  constrained utility activities and informational light metadata.
- Separate stock-table settings controls, guaranteed core stock, rotating availability and
  duplicate-free stock lists using real Item compendium references.
- Weighted stock quantities based on effective merchant tier and price band; Rare goods have one
  sale unit 95% of the time and two 5% of the time under the current policy.
- A separately previewed and confirmed legacy-category-table cleanup with protected-data/reference
  checks, exact approval, lock restoration and recovery reporting.

### Changed

- Alpha.6 reduced active generation from 120 to 20. Sprint 3 extends that compact framework
  to 32 tables for eight profiles, including Village, Town, City and Wagon. Category rolls
  filter shared pools; no quantity tables or duplicate Item documents are generated.
- All 69 accepted Item identities/economics are preserved; thirteen Containers gain explicit
  sale units. The existing twenty whole-shop table identities remain, with three Village pool updates. All retired table IDs remain reserved.

### Fixed

- False read-back differences caused by equivalent description HTML serialization. Remaining
  mismatches identify source IDs and fields in bounded diagnostics.

### Deprecated

- The 100 alpha.5 category-specific tables. Normal builds preserve existing copies until the GM
  reviews the separate cleanup action; protected or externally referenced tables may remain.

Sprint 3 verification: **226 automated tests**, 144 Items and 32 active tables. Both alpha.6
upgrade paths and unchanged repeat builds are covered. The owner reported
successful prior goods/table builds. Detailed live testing of the new catalogue, variants, quantities and cleanup
remains required, and no verified-compatibility claim is inferred from the automated result.

## [0.1.0] — Foundation milestone

This heading records the requested initial foundation stage. Repository history contains an initial
README and subsequent project-name correction before the runnable `0.2.0-alpha.1` framework; it does
not provide evidence of a separately packaged 0.1.0 release. No release date or binary is asserted.

### Added

- The initial Devil's Table repository and project identity that preceded the modular framework.

The canonical JSON pipeline, builders and production catalogue belong to the documented 0.2.0
development history above, rather than being retroactively claimed as a shipped 0.1.0 implementation.

[Unreleased]: https://github.com/devilclarke42/DevilsTable/compare/2464ecc928939bd0875993d0d598af796f8bfac8...main
[0.2.0]: ../CHANGELOG.md
[0.1.0]: https://github.com/devilclarke42/DevilsTable/commit/02b101e87adad4ccf606817903597669a160b5e7
