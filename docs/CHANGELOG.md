# Changelog

All notable milestone and release changes are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and package versions follow
[Semantic Versioning](https://semver.org/).

This is the official milestone/release changelog. The root [build changelog](../CHANGELOG.md)
retains detailed alpha implementation history. A milestone entry does not assert that a public
GitHub Release or installation manifest exists. No release dates are invented for unreleased work.

## [Unreleased]

### Added

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

- Documentation now distinguishes normative authoring standards, automated checks and future
  milestones explicitly. Root records retain their existing detailed build history.
- The documentation sprint changes Markdown only; weighted-quantity and compact-table code was
  completed in the preceding stock feature commit.

## [0.2.0] — In Development

Current runtime candidate: **0.2.0-alpha.6**. The numbered General Store milestone is not yet a
stable public release.

### Added

- A modular Foundry V14 / D&D5e 5.3.3 framework with settings, logging, validation, deterministic
  identities, Item/RollTable builders, repeatable reconciliation and Forge-oriented ZIP packaging.
- Five merchant definitions with builder-only Merchant Notes and one canonical product shared
  across appropriate shop assignments.
- All 69 approved General Store goods across eight curated categories, with permanent IDs,
  original descriptions, prices, adjusted weights, icons, availability and source attribution.
- Native supported container and mundane consumable mappings, explicit purchase units,
  constrained utility activities and informational light metadata.
- Separate stock-table settings controls, guaranteed core stock, rotating availability and
  duplicate-free stock lists using real Item compendium references.
- Weighted stock quantities based on effective merchant tier and price band; Rare goods have one
  sale unit 95% of the time and two 5% of the time under the current policy.
- A separately previewed and confirmed legacy-category-table cleanup with protected-data/reference
  checks, exact approval, lock restoration and recovery reporting.

### Changed

- Active RollTable generation was reduced from 120 to 20, retaining four whole-shop tables per
  merchant and filtering their pools for category rolls. No quantity tables are generated.
- Existing Item records/economics and retained whole-shop table identities are preserved by this
  optimisation. All retired table IDs remain reserved.

### Fixed

- False read-back differences caused by equivalent description HTML serialization. Remaining
  mismatches identify source IDs and fields in bounded diagnostics.

### Deprecated

- The 100 alpha.5 category-specific tables. Normal builds preserve existing copies until the GM
  reviews the separate cleanup action; protected or externally referenced tables may remain.

Verification at the current stock feature commit: **204 automated tests passed**. The owner reported
successful prior goods/table builds. Detailed live testing of weighted quantities and cleanup
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
