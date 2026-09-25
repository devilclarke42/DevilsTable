# Roadmap

This is the detailed implementation and acceptance checklist. The official versioned milestones
and release outcomes are defined in [docs/ROADMAP.md](docs/ROADMAP.md).

## Documentation Foundation

- [x] Publish the nine complete development standards under `docs/`.
- [x] Document permanent identities, content quality, copper/silver pricing and adjusted weights.
- [x] Define merchant frequency/context, quantity conventions, shared icons and release practice.
- [x] Record accepted design decisions and the 0.2.0–1.0 milestone plan.
- [x] Preserve alpha-build history and distinguish implemented behaviour from future requirements.

The documentation sprint changes Markdown only; weighted quantities and compact tables were
implemented and verified in the preceding stock feature change.

## Sprint 2 — Framework implementation

- [x] Module structure, manifest, documentation, settings and logging.
- [x] Canonical JSON registry and permanent-ID/weight/provenance validation.
- [x] Pure mundane-goods converter with explicit 2014 rules.
- [x] GM preview/build UI and bounded, non-deleting compendium updates.
- [x] Regression tests, synthetic scale test, checks and Forge-oriented ZIP packaging.
- [ ] Complete and record the live V14 / D&D5e 5.3.3 Forge acceptance checklist.

Implementation is available for acceptance testing; the target environment is not yet verified.

## Sprint 3 — Complete the General Store

- [x] Finish 144 goods across ten categories, including Tools and Trade Goods.
- [x] Preserve all 69 existing permanent IDs, prices, weights and descriptions.
- [x] Add explicit sale units to the 13 original Containers; require sale units and nonempty tags.
- [x] Reject duplicate normalized display names across the catalogue.
- [x] Add Village, Town, City and Wagon stock selection using shared canonical Items.
- [x] Reuse icons and add twelve lightweight 256×256 WebPs with editable masters.
- [x] Verify the 69-to-144 Item and 20-to-32 table upgrades and unchanged repeat builds.
- [x] Update standards, review tables, changelogs, API guidance and packaging.
- [ ] Record detailed Foundry V14 / D&D5e 5.3.3 / Forge acceptance and Sprint 3 owner review.

Implementation stops at the General Store. Tavern authoring has not started.

## Accepted baseline — Containers and seven-category expansion

- [x] Define all eight curated General Store categories and their planned item lists.
- [x] Require builder-only Merchant Notes for Tavern, General Store, Alchemist, Blacksmith and Black Market.
- [x] Establish whole cp/sp/gp prices and the 25 gp specialist boundary.
- [x] Author exactly 13 Containers with reserved permanent IDs and adjusted empty weights.
- [x] Add native container capacities, shop/category filters and regression coverage.
- [x] User accepted the working Containers build and requested all seven remaining categories.
- [x] Author the remaining 56 approved goods with explicit purchase units and permanent IDs.
- [x] Add supported mundane consumable activities, light metadata and focused validation.
- [x] Verify a 13-to-69 upgrade and repeat build in automated tests.
- [x] User reported alpha.4 worked and accepted the prices and goods.
- [ ] Live V14 / D&D5e 5.3.3 Forge acceptance, including contained-item encumbrance.
- [ ] Live actor-import, completed-use consumption, reusable activity and light metadata checks.

The original eight General Store categories have accepted alpha.4 authored stock. Successful user reports
for alpha.3 and alpha.4 do not complete the detailed live checklist.

## Current — Stock RollTables

- [x] Add canonical stock profiles and permanent table IDs for all five shops.
- [x] Generate Always / Often / Rarely / Rotating sets for each shop with category filters.
- [x] Keep Merchant Notes in the builder and use real Item compendium references.
- [x] Add a separate settings button, preview/build window and independent build record.
- [x] Guarantee core stock and offer duplicate-free rotating lists from built tables.
- [x] Preserve item economics and identities; support safe table/result reconciliation and retries.
- [x] Reduce active output from 120 to 20 tables, retaining IDs and category stock selection.
- [x] Roll weighted sale-unit quantities from price and effective availability.
- [x] Provide a separate reviewed cleanup of unchanged legacy category tables.
- [ ] Review stock tier overrides, 80/15/5 chances and suggested draw counts.
- [ ] Complete live V14 / D&D5e 5.3.3 Forge table build, native draw and repeat-build checks.

Alpha.6 reduced output to 20 active tables. Sprint 3 adds twelve variant tables for 32 active tables. Tavern, Alchemist, Blacksmith and Black
Market remain partial catalogues. Table generation does not create missing shop-specific content.

## After review — Curated content

- Review the original Tavern material against the canonical schema before any import.
- Resolve General Store balance feedback against the canonical JSON and preserve all existing IDs.
- Reserve permanent IDs before publication; test rename and cross-shop behaviour.
- Extend supported converters only when a real item needs them: potions, proficiency tools,
  weapons and armour still need documented mappings and system tests.

## Later — Catalogue and shop workflows

- Add Tavern, Alchemist, Blacksmith and Black Market catalogues incrementally.
- Expand category plans to other shops without multiplying item identities.
- Design saved stock, merchant actors, settlement/quality variations and purchasing workflows.
- Add a reviewed retirement/migration workflow, backups and stronger multi-session coordination.
- Profile read/write memory use and responsiveness inside Foundry with thousands of real items.
- Add localisation and wider runtime compatibility only after tests and review.

## Public release gate

- Select a distribution license and verify rights for text/icons and source attribution.
- Finish live install, upgrade and recovery tests on The Forge.
- Publish versioned ZIP and manifest assets; add real download/update URLs.
- Document migration and rollback policy before declaring a stable release.

No previous catalogue, provisional release asset or untested compatibility claim is inferred
from work outside this repository.
