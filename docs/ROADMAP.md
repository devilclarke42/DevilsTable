# Roadmap

This is the official versioned milestone plan. Milestones describe outcomes and acceptance gates,
not promised dates. Each catalogue is built in curated, reviewable categories; permanent identities,
source provenance and the development standards apply throughout.

Current work is **0.2.0 in development**, with runtime candidate `0.2.0-alpha.6`. The 69-item
General Store and basic stock tools are implemented. Detailed live acceptance remains open.
Some framework work intentionally precedes the milestone where it will be expanded and completed.

| Milestone | Focus | Status |
| --- | --- | --- |
| 0.2.0 | General Store | In development; curated content accepted, release verification ongoing |
| 0.3.0 | Tavern | Planned; existing shared goods are only a partial catalogue |
| 0.4.0 | Alchemist | Planned; dedicated content and mechanics remain |
| 0.5.0 | Blacksmith | Planned; dedicated content and mechanics remain |
| 0.6.0 | Black Market | Planned; dedicated content and access design remain |
| 0.7.0 | Merchant RollTables | Foundations implemented early; full availability design remains |
| 0.8.0 | Merchant Builder | Planned; saved merchant instances and stock workflows remain |
| 0.9.0 | Economy | Planned; broader balance and merchant pricing remain |
| 1.0 | Stable Release | Planned; all release and support gates must pass |

## 0.2.0 — General Store

Deliver the complete agreed eight-category catalogue: Containers, Fire & Lighting, Rope & Climbing,
Camping, Writing, Household, Animal and Travel. Retain permanent IDs, polished descriptions,
explicit purchase units, copper/silver-friendly prices, adjusted weights and shared icon references.

The current 69 goods, Item builder, validation, settings, logging, native supported mappings and
packaging provide this foundation. Stock tools now use 20 active tables with weighted quantities.
The documentation foundation establishes the official standards without changing runtime behaviour.

**Exit gate:** complete the detailed V14 / D&D5e 5.3.3 Forge checks, verify unchanged rebuilds and
upgrades, review quantity balance/cleanup, and resolve any content or runtime issues before declaring
the numbered milestone complete. Successful user reports are recorded alongside specific test evidence.

## 0.3.0 — Tavern

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
