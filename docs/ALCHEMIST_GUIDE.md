# Alchemist Guide

## Scope

The Alchemist catalogue adds 35 products and reuses six General Store goods, for 41 available products. All use the shared Devil's Table Item compendium. Five separate service definitions reuse the existing basket, pricing, approval and receipt pipeline. No potion brewing, ingredient consumption, crafting recipes or new reputation mechanics are introduced.

## Products and mechanics

| Category | New products | Purpose |
| --- | ---: | --- |
| Potions | 5 | Four healing strengths and a climbing potion |
| Herbs | 8 | Clearly labelled dried herbs and aromatic packets |
| Ingredients | 5 | Binders, carriers, pigments and scented preparations |
| Reagents | 6 | Workshop materials and distilled water |
| Glassware | 6 | Vials, droppers, funnels, beakers, retorts and stirring rods |
| Alchemical Tools | 5 | Mortar, filters, rack, crucible and Alchemist's Supplies |

Descriptions specify sale units. Raw ingredients grant no healing or condition removal. Glassware is sold empty. Alchemist's Supplies uses the native artisan's tool type and an Intelligence check activity; the GM adjudicates proficiency and the task.

Healing potions preserve 2014 healing: 2d4+2, 4d4+4, 8d4+8 and 10d4+20. They generate native D&D5e healing activities, consume one dose, and take an action. The climbing potion consumes one dose through a utility activity; its one-hour benefit is described for manual adjudication, with no automatic Active Effect. Potions are marked magical. Activation never depends on a custom macro.

Prices are project values: healing doses cost 40, 120, 450 and 1,200 gp; climbing costs 45 gp. These are deliberate departures from official prices, not a new rarity-to-price rule. Herbs and routine supplies primarily use copper and silver. Adjusted weight includes the stated package or supplied bottle; potion sale units weigh 0.3 lb. Shared goods retain their existing IDs, prices and weights.

Existing core WebP icons are reused. The verified D&D5e 5.3.3 potion, herbalism and alchemist-tool references are recorded in the icon fixture; no new artwork is bundled.

## Presets

| Preset | Settlement / prosperity | Price modifier | Relative float factor | Services |
| --- | --- | ---: | ---: | --- |
| Village Herbalist | Village / Average | 0% | 75% | Identification, appraisal, refill, grinding |
| Town Alchemist | Town / Prosperous | +5% | 130% | All five |
| Master Alchemist | City / Wealthy | +20% | 220% | All five |
| Travelling Apothecary | Hamlet / Poor | +10% | 50% | Identification, appraisal, refill, grinding |

Float factors combine with the existing settlement and prosperity policy; they are not fixed cash amounts. Preview the final stock and funds before applying. The travelling profile excludes goods over 0.5 lb and special-order stock. Town stock excludes superior and supreme healing potions. Village and master pools retain special-order access, with different rotating draw counts; a village rare result may represent a scarce consignment and remains subject to GM review. No rare dose is guaranteed.

Each preset supplies distinct editable notes and a suggested greeting. Restock preferences do not run an automatic schedule. Changing a preset does not silently erase an existing merchant's inventory, funds or history.

## Services

| Service | Base price | Recommended range | Suggested duration | Required selection |
| --- | --- | --- | --- | --- |
| Identify Potion | 2 gp | 2–4 gp | Ten minutes | Potion consumable |
| Appraise Ingredients | 3 sp | 3–6 sp | Ten minutes | Loot item |
| Refill Vial | 2 cp | 2–4 cp | Five minutes | Loot or container |
| Distill Alcohol | 8 sp | 8 sp–1 gp 6 sp | Half a day | Supplied consumable or loot |
| Grind Herbs | 3 cp | 3–6 cp | Ten minutes | Loot item |

Read the service's sale unit before accepting a batch. Item predicates intentionally support compatible third-party Items; the GM must confirm that the selected item is suitable. Each service accepts one target per basket line. Shop, relationship, negotiation and manual pricing modifiers use the existing system.

Approval records payment for commissioned work and writes a receipt. It does not consume the target, change its identified flag, refill magical uses, generate alcohol, or automatically replace ingredients. The GM completes the work and edits affected Items when appropriate. Refill Vial includes neither liquid nor a vessel and never replenishes an expended potion. Brewing remains future work.

## Builder workflow

1. Open the NPC's Merchant Builder and choose one of the four Alchemist presets.
2. Review settlement, prosperity, notes and price modifier. Services appear in the Services tab.
3. Generate and inspect stock and funds, then confirm the desired changes.
4. Open the Shop UI. Products and services can share one checkout; services requiring a target prompt for a character inventory selection.
5. Review price and target suitability before GM approval. Complete commissioned work manually.

To update generated data, rebuild the Alchemist Item catalogue and RollTables using the existing builders. The original `DT_TABLE_ALC` identity remains reserved and active; three variants add twelve tables, making sixteen Alchemist tables. Rebuilding should converge without duplicating shared goods. Never edit generated source-owned fields directly.

## Verification and release gate

Automated checks cover canonical validation, icon references, native healing activity structure, repeat builds, compact travelling stock, service eligibility and mixed product/service payment with an unchanged target Item. These are not live Foundry tests.

Before campaign use, verify in Foundry V14 with D&D5e 5.3.3: build twice with no second-pass changes; import and use a healing potion; confirm the 2014 action and dose consumption; generate each preset; purchase a potion and Grind Herbs together; reject a second checkout and verify no payment or item change. Review player target selection and optional modules in the actual world.

## Sources and attribution

2014 mechanics are based on the *System Reference Document 5.1* by Wizards of the Coast LLC, available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) at the [official SRD](https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf). Original descriptions, prices and adjusted weights are project adaptations. Higher healing strengths retain the established D&D5e dice progression; their market prices are project decisions.

Native field shapes and existing icon references were checked against [D&D5e release 5.3.3](https://github.com/foundryvtt/dnd5e/tree/release-5.3.3), including `module/data/activity/heal-data.mjs`, `module/data/shared/damage-field.mjs` and the source healing potion and alchemist tool. Existing source notices in [Blacksmith Source Notices](BLACKSMITH_SOURCE_NOTICES.md) remain applicable to reused native tool structure. Icon assets are referenced from Foundry, not redistributed.
