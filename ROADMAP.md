# Roadmap

## Sprint 2 — Framework implementation

- [x] Module structure, manifest, documentation, settings and logging.
- [x] Canonical JSON registry and permanent-ID/weight/provenance validation.
- [x] Pure mundane-goods converter with explicit 2014 rules.
- [x] GM preview/build UI and bounded, non-deleting compendium updates.
- [x] Regression tests, synthetic scale test, checks and Forge-oriented ZIP packaging.
- [ ] Complete and record the live V14 / D&D5e 5.3.3 Forge acceptance checklist.

Implementation is available for acceptance testing; the target environment is not yet verified.

## Current — General Store / Containers review

- [x] Define all eight curated General Store categories and their planned item lists.
- [x] Require builder-only Merchant Notes for Tavern, General Store, Alchemist, Blacksmith and Black Market.
- [x] Establish whole cp/sp/gp prices and the 25 gp specialist boundary.
- [x] Author exactly 13 Containers with reserved permanent IDs and adjusted empty weights.
- [x] Add native container capacities, shop/category filters and regression coverage.
- [ ] Owner review of prices, weights, descriptions, capacities, stock guidance and icons.
- [ ] Live V14 / D&D5e 5.3.3 Forge acceptance, including contained-item encumbrance.

**Stop here until the Containers review is complete.** Fire & Lighting, Rope & Climbing,
Camping, Writing, Household, Animal and Travel are planning lists only.

## After review — Curated content

- Review the original Tavern material against the canonical schema before any import.
- Agree the next General Store category and review its prices, adjusted weights and source attributions.
- Reserve permanent IDs before publication; test rename and cross-shop behaviour.
- Extend supported converters only when a real item type needs them: consumables,
  tools, weapons and armour each need documented mappings and system tests.

## Later — Catalogue and shop workflows

- Add Tavern, Alchemist, Blacksmith and Black Market catalogues incrementally.
- Expand category plans to other shops without multiplying item identities.
- Design stock quantities, prices and availability workflows as explicit requirements.
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
