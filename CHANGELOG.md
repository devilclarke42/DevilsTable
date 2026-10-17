# Changelog

**Audience:** users and maintainers. **Purpose:** describe meaningful changes by release candidate; this is the only changelog. Candidate labels do not imply a stable release. Detailed historical investigations remain in Git.

## Unreleased

### Added

- Eight core essentials: Component Pouch, Spellbook, Herbalism Kit, Navigator's Tools, Quiver, Crossbow Bolt Case, Rigid Ladder (10 ft.) and Pole (10 ft.). Native tool/container mappings reuse the shared catalogue and stock framework.
- Thirty-four additional adventuring products, including clothing, twelve focus/symbol variants and a ten-use Healer's Kit.
- Fifteen missing artisan tool sets, all ten SRD instruments, and eleven grain/textile/spice/bullion commodities. Shared bullion uses existing merchant memberships and visibility rules.
- Generic optional consumable use limits and native trinket equipment support; existing generated Item output is preserved.
- Official source price/weight comparisons, conservative stock assignments, preserved released-item snapshots and core-content coverage tracking: 203/241 SRD units represented.
- Seven equipment-pack contents manifests and a documented fulfilment proposal; populated-container purchases and livestock remain deferred pending a safe reviewed representation.

### Repository consolidation

### Changed

- Consolidated documentation into current GM, author and developer guides; added project philosophy, contribution guidance, API boundaries and known limitations.
- Replaced duplicated sprint/pathway plans with one milestone roadmap and one user-facing changelog.
- Archived useful content/source audits, removed superseded implementation specifications and unused deferred stock policy, and corrected documentation/provenance references.
- Added internal documentation checks and excluded historical archives from runtime ZIPs. Runtime behaviour, permanent identities and version remain unchanged.

## Release candidates

### 0.3.29

- Simplified version numbering, changed the installed module ID to `devils-table-merchants` and credited Devilclarke as author.
- Updated runtime paths, API references and packaging to use the new module ID. Existing worlds using the previous ID require migration of saved flags/settings before continuing.


### 0.3.0-alpha.29

- Added installer/update manifest URLs, verified Foundry 14 / D&D5e 5.3.3 metadata and a validated alpha-release publishing workflow. Packages now use fixed file times for reproducible retry verification.


### 0.3.0-alpha.28

- Fence assortments now guarantee practical goods and retain low per-product quantities.

### 0.3.0-alpha.27

- Fence catalogue, services, profiles and shared restricted-offer policies.

### 0.3.0-alpha.26

- Alchemist products, commissioned services and native healing potions.

### 0.3.0-alpha.25

- Sidebar startup ordering.

### 0.3.0-alpha.24

- Actors sidebar entry.

### 0.3.0-alpha.23

- .

### 0.3.0-alpha.22

- Merchant menu access.

### 0.3.0-alpha.21

- 2026-10-08.

### 0.3.0-alpha.20

- Net save ability.

### 0.3.0-alpha.19

- Activity unit defaults.

### 0.3.0-alpha.18

- Native equipment read-back.

### 0.3.0-alpha.17

- Blacksmith Catalogue & Services.

### 0.3.0-alpha.16

- Sheet menu compatibility.

### 0.3.0-alpha.15

- Merchant entry and indicators.

### 0.3.0-alpha.14

- UX & Workflow Polish.

### 0.3.0-alpha.13

- Tavern Completion.

### 0.3.0-alpha.12

- Accommodation checkout times.

### 0.3.0-alpha.11

- Compact checkout review.

### 0.3.0-alpha.10

- Optional Integration Framework.

### 0.3.0-alpha.9

- Merchant Identity and Automatic Tagging.

### 0.3.0-alpha.8

- Tavern Services.

### 0.3.0-alpha.7

- Merchant Services framework.

### 0.3.0-alpha.6

- Builder tabs, cash workflow and merchant reset.

### 0.3.0-alpha.5

- Shop container display and Builder close fix.

### 0.3.0-alpha.4

- Merchant Builder.

### 0.3.0-alpha.3

- Project consolidation.

### 0.3.0-alpha.2

- Catalogue framework and merchant UX.

### 0.3.0-alpha.1

- Tavern catalogue and merchant presentation.

### 0.2.0-alpha.25

- Merchant interactions.

### 0.2.0-alpha.24

- Player confirmation of revised offers.

### 0.2.0-alpha.23

- Explicit creator ownership.

### 0.2.0-alpha.22

- Serializable Item comparisons.

### 0.2.0-alpha.21

- Compare native property sets.

### 0.2.0-alpha.20

- Isolate Item constructor defaults.

### 0.2.0-alpha.19

- Native gear conversion and recovery.

### 0.2.0-alpha.18

- Native container stock.

### 0.2.0-alpha.17

- Transfer diagnostics and setup tabs.

### 0.2.0-alpha.16

- Existing receipt review handling.

### 0.2.0-alpha.15

- Approval form repair.

### 0.2.0-alpha.14

- transaction candidate.

### 0.2.0-alpha.13

- Review persistence and control alignment.

### 0.2.0-alpha.12

- Stock relay diagnostics and readable totals.

### 0.2.0-alpha.11

- Optional merchant population.

### 0.2.0-alpha.10

- Shop window first render.

### 0.2.0-alpha.9

- Merchant token entry fix.

### 0.2.0-alpha.8

- merchant proof build.

### 0.2.0-alpha.7

- Complete General Store.

### 0.2.0-alpha.6

- Weighted quantities and compact stock tables.

### 0.2.0-alpha.5

- Shop and category stock RollTables.

### 0.2.0-alpha.4

- Complete General Store categories.

### 0.2.0-alpha.3

- Read-back comparison fix.

### 0.2.0-alpha.2

- General Store / Containers review.

### 0.2.0-alpha.1

- Initial source/catalogue validation framework.

## Earlier foundations

Initial candidates established JSON authoring, adjusted weights, deterministic compendium builds, the General Store catalogue and shared stock tables. No stable 0.1.0, 0.2.0 or 0.3.0 release is inferred from old milestone headings.

See [Release Process](docs/RELEASE_PROCESS.md) for packaging/publication gates and [Roadmap](ROADMAP.md) for direction.
