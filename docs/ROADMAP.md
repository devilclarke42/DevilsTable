# Roadmap

## Sprint 10C — Optional integration candidate

Implemented in `0.3.0-alpha.10`: optional manager, ordered fulfilment, Lock & Key room access, Calendaria accommodation notes, booking checkout/recovery and integration settings. Live Foundry/Forge acceptance remains pending. Room capacity, reservations, automated restocking, business hours and other module adapters remain future work.


## Sprint 11A — Merchant Identity candidate

Implemented in `0.3.0-alpha.9`: native-derived identity/System Tags, separate business metadata/Merchant Tags, dedicated Identity and Services tabs, service filters/availability and data ownership documentation. Live Foundry/Forge review remains pending. Full business profiles, disguises, faction/reputation systems and settlement generation remain future work; this sprint adds no new gameplay.


## Sprint 10B — Tavern Services candidate

Implemented in `0.3.0-alpha.8`: twelve services, editable Tavern presets and data-driven default selection. Existing food/drink sources are active. Await live Foundry review; reservations, capacity scheduling and service automation remain future work.


## Sprint 10A — Merchant Services framework candidate

Implemented in `0.3.0-alpha.7`: separate definitions, shared basket/payment review, service administration, usage statistics and optional post-payment native integrations. Await live Foundry review before starting Tavern service content (Sprint 10B). No new trading mechanics or Tavern services are bundled.


## Sprint 9 — Merchant Builder candidate: 0.3.0-alpha.4

- [x] Single editable panel; preserve existing NPC data during conversion.
- [x] Data-driven configuration, stock estimates and independent stock/float/notes previews.
- [x] Built-in presets and private portable custom templates.
- [x] Native funds, infinite-stock configuration, relationship defaults and inventory administration.
- [x] Documentation and automated regression coverage.
- [ ] Live Foundry/Forge acceptance using the [Merchant Guide](MERCHANT_GUIDE.md#maintenance-and-acceptance).

Automatic restocking, greetings and template import/export remain future work. The service framework is now implemented; merchant-specific service content follows review.
Existing catalogue milestones and Tavern content are unchanged.


## Sprint 8A — Consolidation candidate: 0.3.0-alpha.3

- [x] Trade & Merchants branding with stable module/source/collection identities.
- [x] Reviewed compendium names and documented existing-pack display aliases.
- [x] GM Merchant Summary, confirmed Empty Stock and shared transaction guards.
- [x] Data-driven initial native cash float with existing-wallet and repeat-grant protection.
- [x] Documentation, regression coverage and unchanged Tavern content.
- [ ] Live Foundry/Forge acceptance: [checklist](MERCHANT_ADMINISTRATION.md#validation-and-live-acceptance).

Future economy work may use settlement, prosperity and merchant profile for stock/rarity/restocking;
none of those systems is implemented here. Existing catalogue milestones are unchanged.


This is the official versioned milestone plan. Milestones describe outcomes and acceptance gates,
not promised dates. Each catalogue is built in curated, reviewable categories; permanent identities,
source provenance and the development standards apply throughout.

Current work is the revised **Sprint 8 Catalogue Framework & Merchant UX**, candidate
`0.3.0-alpha.2`. The active catalogue contains 144 General Store Items. The previously authored
Tavern draft is preserved but deferred until framework review. Merchant services and the full
Merchant Builder remain future work. See [Project State](PROJECT_STATE.md).

**Sprint 4 review:** the owner approved the Merchant System design with required changes as the next
development priority, before Tavern content. The
[Merchant System roadmap](merchant/IMPLEMENTATION_ROADMAP.md) documents this sequencing, live
proof gates and the unresolved milestone-numbering choice. The table below records the existing approved
version plan; no milestone has been silently renumbered. Sprint 6 transfers and Sprint 7 interactions now ship as alpha candidates. The owner confirmed
purchases, rejection and recovery; live Sprint 7 acceptance remains open. See the
[Sprint 7 report](merchant/SPRINT_7_INTERACTIONS.md).

| Milestone | Focus | Status |
| --- | --- | --- |
| 0.2.0 | General Store | In development; Sprint 3 implemented, live acceptance and review pending |
| 0.3.0 | Tavern | Deferred draft preserved; framework review precedes further content |
| 0.4.0 | Alchemist | Planned; dedicated content and mechanics remain |
| 0.5.0 | Blacksmith | Planned; dedicated content and mechanics remain |
| 0.6.0 | Black Market | Planned; dedicated content and access design remain |
| 0.7.0 | Merchant RollTables | Foundations implemented early; full availability design remains |
| 0.8.0 | Merchant Builder | Planned; saved merchant instances and stock workflows remain |
| 0.9.0 | Economy | Planned; broader balance and merchant pricing remain |
| 1.0 | Stable Release | Planned; all release and support gates must pass |

## 0.2.0 — General Store

Deliver the ten-category General Store: Containers, Lighting & Fire, Rope & Climbing, Camping,
Writing, Tools, Household, Animal Supplies, Travel and Trade Goods. Retain permanent IDs, polished descriptions,
explicit purchase units, copper/silver-friendly prices, adjusted weights and shared icon references.

The current 144 goods, Item builder, validation, settings, logging, native supported mappings and
packaging provide this foundation. Stock tools use 32 active tables with weighted quantities: sixteen for Village, Town, City and Wagon,
and sixteen for existing partial merchant catalogues. Sprint 3 adds 75 goods and completes this
authoring scope. Tavern authoring resumes after Sprint 8 framework review; milestone numbers are unchanged.

**Exit gate:** complete the detailed V14 / D&D5e 5.3.3 Forge checks, verify unchanged rebuilds and
upgrades, review quantity balance/cleanup, and resolve any content or runtime issues before declaring
the numbered milestone complete. Successful user reports are recorded alongside specific test evidence.

## 0.3.0 — Tavern

The earlier candidate authored 152 menu products; that draft and its IDs are preserved as deferred
review material. Revised Sprint 8 builds the catalogue framework first. Its four Tavern tables
currently select shared supplies only. Review the framework before resuming the Tavern scope.
See [Tavern review](TAVERN_REVIEW.md) for the historical candidate.

Author curated food, bread/staples, meals, drinks and travel provisions with clear portions, containers,
prices and weights. Reuse existing vessels, lighting, household goods and animal supplies. Review
any earlier Tavern drafts against the canonical schema before importing them.

**Exit gate:** a believable food-and-drink-led catalogue, supported consumable behaviour, documented
packaging and depletion, original/attributed descriptions, and complete merchant coverage. Do not
fill the Tavern with equipment simply to raise its item count.

## 0.4.0 — Alchemist

Build reviewed categories of mundane alchemical supplies, preparations and appropriate potions.
Extend native converters only for mechanics actually required by accepted products, including
2014 effects, activation, consumption and provenance. Reuse existing bottles, flasks and shared goods.

**Exit gate:** supported effects behave correctly on actor imports, prices/weights are reviewed,
unsupported mechanics are not disguised as loot, and the Alchemist's dedicated stock is complete
for its agreed categories.

## 0.5.0 — Blacksmith

Add curated tools, metalwork, repairs and the agreed weapon/armour scope. Distinguish mundane repair
supplies from proficiency tools, and document native type mappings before introducing those Items.
Keep material, durability, price and encumbrance differences coherent.

**Exit gate:** native system data and any activities are verified, existing shared goods retain IDs,
and equipment descriptions do not imply unsupported mechanical bonuses or services as inventory Items.

## 0.6.0 — Black Market

Define a reviewed catalogue and merchant behaviour for restricted trade, scarce goods and unusual
sourcing. Keep physical product identity separate from fictional legality, trust, location and price
quotes. Reuse canonical goods where they are the same product.

**Exit gate:** the catalogue has a clear role, access/availability decisions are documented, ordinary
shared goods are not automatically labelled illegal, and no duplicate product records exist merely
to represent another seller.

## 0.7.0 — Merchant RollTables

Complete the availability model across the authored merchants, including a supported distinction
between Common and Uncommon and explicit handling of Seasonal, Imported and Illegal context.
Retain guaranteed essentials, bounded weighted quantities and category filtering without generating
an unnecessary table for every category, item or quantity profile.

**Exit gate:** the implemented schema matches the merchant standard, native references resolve,
probability/quantity distributions have reviewed evidence, empty pools behave predictably, and old
table versions migrate without silently breaking references. The existing four-table-per-shop
foundation is a starting point, not completion of this milestone.

## 0.8.0 — Merchant Builder

Create a GM workflow for named merchant instances, accepted stock snapshots, quantities and explicit
overrides. Choose and document persistence and supported merchant integrations before implementing
them. Reference canonical Item IDs; separate merchant state from catalogue authoring.

**Exit gate:** saved stock survives reload, quantities and overrides are editable without source
duplication, restocking is explicit, permissions are clear, and supported inventory/purchasing flows
cannot silently duplicate goods or lose stock. Include recovery and migration tests for saved instances.

## 0.9.0 — Economy

Evaluate prices and supply across whole journeys and campaigns. Add reviewed merchant/settlement
adjustments, trade margins, buying/selling behaviour and rounding rules where useful. Preserve the
role of copper and silver and keep canonical base prices distinct from a merchant's current quote.

**Exit gate:** scenarios demonstrate sensible affordability, bundle/packaging comparisons prevent
accidental arbitrage, rare supply remains constrained, and configurable changes have documented
effects rather than unexplained multipliers. Balance changes retain identities and carry migration notes.

## 1.0 — Stable Release

Consolidate the accepted catalogues and workflows into a supported public module. Establish the
stable public API/data contracts, licence and attribution, installation/update assets, user guidance,
support boundaries and rollback policy.

**Exit gate:** reproducible packages, documented live Forge compatibility, complete content and
asset rights review, fresh-install and upgrade/recovery evidence, accessible GM workflows, and
measured responsiveness with thousands of Items. Publish real immutable release assets and only
then advertise the corresponding installation manifest and compatibility claims.

## Rules across all milestones

- Add content by reviewed category; quality and completeness outrank arbitrary item counts.
- Preserve permanent IDs, adjusted-weight rationale, shared products and the source-first build path.
- Keep tests focused on meaningful invariants, migrations and integration risks.
- Record what was actually verified and keep future design separate from shipped behaviour.
- Update the relevant standards and [CHANGELOG.md](CHANGELOG.md) when scope or behaviour changes.

The root [implementation roadmap](../ROADMAP.md) retains the detailed framework/content acceptance
checklist. This document controls milestone numbering and intended release outcomes.

### Sprint 6 acceptance gate

Buy/sell settlement, native wallets, private receipts and recovery are implemented in alpha.14.
Automated two-, three- and five-client races pass. Live Foundry transfer/recovery acceptance is
still required before declaring the merchant milestone stable. The earlier Tavern candidate is deferred; see [Project State](PROJECT_STATE.md).
