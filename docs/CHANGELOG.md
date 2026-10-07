# Changelog

All notable milestone and release changes are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and package versions follow
[Semantic Versioning](https://semver.org/).

This is the official milestone/release changelog. The root [build changelog](../CHANGELOG.md)
retains detailed alpha implementation history. A milestone entry does not assert that a public
GitHub Release or installation manifest exists. No release dates are invented for unreleased work.

## 0.3.0-alpha.15 — 2026-10-07 — Merchant entry and indicators

### Fixed

- Move the exposed Actor header button into the native three-dot menu as **Make Merchant - DT**, opening the Builder for the relevant supported NPC.
- Resolve Actor Directory entries across Actor, document and entry ID layouts; display an explicit GM-only Merchant badge.
- Add a GM-only SHOP marker on linked merchant tokens, refreshed on Actor/token changes and removed when disabled.
- Preserve Actor ownership, token images, inventory and all merchant state.

### Validation

- Automated menu targeting and token marker lifecycle regression checks pass. Live Foundry visual confirmation remains pending.

## 0.3.0-alpha.14 — 2026-10-06 — UX & Workflow Polish

### Added

- GM-only Devil's Table tab on supported NPC sheets, with explicit settings Save using the existing Builder validation and administration locks.
- Direct NPC header and Actor Directory Builder entry, direct Services entry, and a compact Directory merchant badge.
- Optional Dice So Nice local presentation of native merchant interaction rolls through a separate Integration Manager presentation allowlist.
- Shared source generation summaries and a documented interface review and live acceptance checklist.

### Changed

- Compact native catalogue, category and profile selectors replace large content-builder button grids.
- Merchant/profile guidance and legacy maintenance are collapsed; progress reports and resizable windows remain bounded.
- Disabling a merchant preserves inventory, money, relationships and history while disabling existing linked-token entry.
- No catalogue, Item identity, trading mechanics or compendium layout changes. No dedicated sidebar added.

### Validation

- Automated regression checks accompany packaging. Live Foundry/Forge sheet rendering, visual accessibility and Dice So Nice acceptance remain pending.

## 0.3.0-alpha.13 — 2026-10-04 — Tavern Completion

### Added

- Sixteen products: four soups, four fish servings, four imported drinks and four taproom supplies, all with reserved IDs, reviewed prices, purchase units and adjusted weights.
- Tavern membership for six existing supplies: Travel Rations, Waterskin, Firewood, Bedroll, Mess Kit and Flint & Steel. No duplicated Items or changes to their mechanics, prices or weights.
- Meeting Room Hire, Secure Storage, Courier Message and Package Holding, bringing services to sixteen.
- Five additional stock variants and five additional Tavern presets, with distinct menus, prices, private optional stories, suggested greetings and trading notes.
- Tavern Guide, complete service reference and alpha.12 upgrade regression coverage.
- One original 256×256 WebP smoking-pipe icon using the existing module vector style; all other icons reused.

### Changed

- The Tavern has 205 products (168 Tavern-authored, 37 shared), nine presets and six stock profiles. Module totals: 312 Items, 16 services, 52 Stock tables; older identities remain reserved.
- Shop descriptions expand on demand, category controls use a compact scrolling row, narrow windows retain inventory and basket panes, and Add controls have descriptive accessible labels.
- New room configuration preselects available supported integrations while retaining existing opt-outs. Actual room names/doors still require GM configuration.
- Specialist service eligibility omits default horse stabling and weekly lodging; profile changes remain editable in Builder.

### Validation

- All 376 automated tests pass, covering canonical data, upgrade/rebuild convergence, mixed trades, preset selection, integration absence and rental lifecycle. Live Foundry V14 / D&D5e 5.3.3 / Forge acceptance remains pending.

## 0.3.0-alpha.12 — 2026-10-01 — Accommodation checkout times

### Added

- Per-merchant accommodation checkout time in Builder Setup, defaulting to 10:00, including portable custom templates.
- GM purchase-only checkout-time override, with player reconfirmation when rental terms change.
- Public room checkout terms and retained receipt details; explicit one-night and seven-night service metadata.

### Changed

- New room bookings end at the configured clock time after the booked number of nights, rather than a full-day interval from approval. Both key expiry and Calendaria use that endpoint.
- Existing booking endpoints remain unchanged. Custom calendars use native clock components and validate clock bounds.
- Room booking administration calculates remaining days using the calendar day length.

## 0.3.0-alpha.11 — 2026-09-29 — Compact checkout review

### Changed

- Collapsed shop, character, negotiation and checkout modifiers plus the pricing breakdown under “Pricing modifiers and breakdown”.
- Per-line percentage controls now expand under “Adjust this line’s price”.
- Basket quantities, quoted prices, final total, Recalculate and approval controls remain visible. Expanded review content scrolls normally.
- Pricing calculations, revised-offer acceptance and transaction behaviour are unchanged.

## 0.3.0-alpha.10 — 2026-09-29 — Optional Integration Framework

### Added

- Optional Integration Manager with module/API detection, independent opt-outs, serialized dispatch and failure isolation.
- Sequential service actions for native Item grants, macros, journals, RollTables, effects and registered integrations; configurable stop/continue and no automatic replay.
- Lock & Key multi-door rental keys, scoped access revocation and persistent/checkout/manual policies.
- Calendaria private check-in/check-out notes, configurable accommodation duration and recoverable private booking records.
- Integration settings/status and GM booking checkout/recovery; room configuration in Builder Services.
- Integration user/developer guides and fallback, expiry, partial-failure and shared-door concurrency tests.

### Fixed

- Catalogue icon and shop-type label align horizontally.
- Shop title reflects the exact token name and optional business name, including live updates.

### Compatibility

- Neither integration is required. Missing modules skip optional actions without cancelling service payment.
- Existing execution maps, service prices, catalogue IDs, identity data and native transaction settlement remain compatible.
- Live Foundry/Forge integration acceptance is pending; calendar notes do not enforce room capacity.

## 0.3.0-alpha.9 — 2026-09-29 — Merchant Identity and Automatic Tagging

### Added

- Builder Identity tab with live native name, portrait, race/species, creature type, class, size, alignment, biography summary and token information.
- Derived read-only System Tags and separately validated, GM-only editable Merchant Tags.
- Merchant-only business name, title and public/shop descriptions, with explicit player-safe presentation updates.
- Builder guide, complete stored-field ownership audit and live acceptance checklist.

### Changed

- Services moved into a top-level Builder tab with shared form logic, immediate search, category/status filters, grouping and usage statistics.
- Optional temporary service availability is checked at checkout; existing offers default to available.
- Stale service edits are rejected; native identity updates preserve unsaved business drafts.
- Native Actor data, source catalogue content, receipts and recovery evidence are preserved. No bulk migration or new gameplay systems.

## 0.3.0-alpha.8 — 2026-09-29 — Tavern Services

### Added

- Twelve record-only Tavern services across Accommodation, Food Services, Stable, Facilities and Hospitality.
- Recommended price ranges, purchase units and suggested durations, with backward-compatible service validation.
- Data-driven default service seeding on Builder Save, preserving manual removals, disabled offers and price overrides.
- Poor Hamlet Tavern, Town Inn and Luxury City Inn presets; updated Roadside Tavern notes.
- Production service tests and Tavern setup/pricing documentation.

### Changed

- Activated the existing 152 Tavern food/drink source records and complete Tavern stock profile without editing Item identities or contents.
- Shop and GM review display service units/durations; service availability text no longer implies unlimited room capacity.
- Active totals: 296 Items, 12 services, 32 stock tables; one shared Item compendium.

## 0.3.0-alpha.7 — 2026-09-28 — Merchant Services framework

### Added

- Validated, separate service/category JSON definitions, world authoring and setup-time provider registration.
- Services Shop tab, shared search and mixed product/service baskets with existing GM approval and pricing.
- Builder service category generation, manual offerings, enabled controls and native-denomination price overrides.
- Transactional service purchase/revenue counters, last purchase dates and popularity statistics.
- Optional native Macro, JournalEntry, RollTable and ActiveEffect execution after payment, with persisted attempted/result states and no automatic replay.
- Service integration tests, authoring guide and live Foundry acceptance checklist. No Tavern service content added.

### Changed

- Private receipts distinguish products/services and show post-payment execution outcomes.
- Automatic retention preserves completed-payment receipts whose optional service actions still need attention.

## 0.3.0-alpha.6 — 2026-09-28 — Builder tabs, cash workflow and merchant reset

### Added

- Setup, Stock, Cash and Manage tabs with direct access and Back/Next navigation.
- Manual proposed-stock quantity overrides; zero omits an addition.
- Confirmed Reset Merchant: clears merchant configuration, relationships, offer overrides and this NPC's retained receipts, while preserving ordinary NPC data, inventory and currency.
- Reset refuses active checkout/recovery; partial failures leave the shop disabled for retry.

### Fixed

- Manual cash generation now rolls a replacement preview for existing finite-funds merchants instead of silently returning a preservation status.
- When stock adds no new goods, its uncommitted cash preview remains available to apply separately.
- Existing close-button and grouped-container behaviour retained.

## 0.3.0-alpha.5 — 2026-09-28 — Shop container display and Builder close fix

### Fixed

- Builder busy controls no longer disable Foundry's window close button; pending work does not reopen a closed panel.
- Mechanically identical empty container offers display one Shop row and a combined available quantity.
- Basket grouping retains separate native Item IDs for approval and safe transfer; distinct or occupied containers remain separate.

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
