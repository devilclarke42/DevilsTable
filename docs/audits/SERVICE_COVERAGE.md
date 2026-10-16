# Service Coverage Audit

**Audience:** GMs, content authors and reviewers. **Purpose:** distinguish current offers, SRD benchmarks and proposed manual commissions.

**Baseline:** 0.3.29, main `d94d7fb68e52a80d0d03e7b4b46d4d5c463484eb`, audited 2026-10-16. No services or prices were changed.

## Existing service inventory

All 40 definitions are recorded with their exact price, sale unit, duration, availability, visibility, target predicate and optional integration behaviour in [SERVICE_INVENTORY.json](SERVICE_INVENTORY.json). All are payment/receipt offers with GM fulfilment; built-in `actions` and `execution` are empty. Accommodation may synthesize configured room actions. Dice So Nice is optional roll presentation, not fulfilment.

| ID | Service | Merchant | Base price | Duration |
| --- | --- | --- | --- | --- |
| DT_SERVICE_TAV_COMMON_ROOM | Rent Common Room | tavern | 2 sp | 1 night(s); checkout at merchant time (default 10:00), GM may override |
| DT_SERVICE_TAV_PRIVATE_ROOM | Rent Private Room | tavern | 6 sp | 1 night(s); checkout at merchant time (default 10:00), GM may override |
| DT_SERVICE_TAV_LUXURY_ROOM | Rent Luxury Room | tavern | 3 gp | 1 night(s); checkout at merchant time (default 10:00), GM may override |
| DT_SERVICE_TAV_MEAL_DAY | Meal of the Day | tavern | 8 cp | About 30 minutes during kitchen hours |
| DT_SERVICE_TAV_BREAKFAST | Breakfast | tavern | 5 cp | About 20 minutes in the morning |
| DT_SERVICE_TAV_DINNER_PACKAGE | Dinner Package | tavern | 3 sp | About one hour during evening kitchen hours |
| DT_SERVICE_TAV_STABLE_HORSE | Stable Horse | tavern | 4 sp | Up to 24 hours from arrival |
| DT_SERVICE_TAV_FEED_HORSE | Feed Horse | tavern | 8 cp | Feed supplied over one day |
| DT_SERVICE_TAV_BATH | Bath | tavern | 2 sp | About 30 minutes by arrangement |
| DT_SERVICE_TAV_LAUNDRY | Laundry | tavern | 1 sp | Usually next day; weather may delay drying |
| DT_SERVICE_TAV_PRIVATE_DINING | Private Dining Room | tavern | 2 gp | Up to three hours at an agreed time |
| DT_SERVICE_TAV_WEEKLY_LODGING | Long-Term Lodging | tavern | 35 sp | 7 night(s); checkout at merchant time (default 10:00), GM may override |
| DT_SERVICE_TAV_MEETING_ROOM | Meeting Room Hire | tavern | 8 sp | Two hours at an agreed time |
| DT_SERVICE_TAV_SECURE_STORAGE | Secure Storage | tavern | 3 sp | Up to 24 hours; collection arranged with the keeper |
| DT_SERVICE_TAV_COURIER_MESSAGE | Courier Message | tavern | 2 sp | One local delivery attempt during working hours |
| DT_SERVICE_TAV_PACKAGE_HOLDING | Package Holding | tavern | 5 cp | Until collection within 24 hours |
| DT_SERVICE_BSM_REPAIR_WEAPON | Repair Weapon | blacksmith | 5 sp | One to four hours |
| DT_SERVICE_BSM_REPAIR_ARMOUR | Repair Armour | blacksmith | 2 gp | Half a working day |
| DT_SERVICE_BSM_SHARPEN_BLADE | Sharpen Blade | blacksmith | 2 sp | Thirty minutes |
| DT_SERVICE_BSM_SILVER_WEAPON | Silver a Weapon | blacksmith | 100 gp | Two working days |
| DT_SERVICE_BSM_RESIZE_ARMOUR | Resize Armour | blacksmith | 8 gp | One working day |
| DT_SERVICE_BSM_REPLACE_BOWSTRING | Replace Bowstring | blacksmith | 4 sp | One hour |
| DT_SERVICE_BSM_REPLACE_SHIELD_STRAPS | Replace Shield Straps | blacksmith | 3 sp | One hour |
| DT_SERVICE_BSM_CUSTOM_FITTING | Custom Fitting | blacksmith | 15 gp | One working day |
| DT_SERVICE_BSM_BASIC_APPRAISAL | Basic Appraisal | blacksmith | 5 sp | Fifteen minutes |
| DT_SERVICE_ALC_IDENTIFY_POTION | Identify Potion | alchemist | 2 gp | Ten minutes |
| DT_SERVICE_ALC_APPRAISE_INGREDIENTS | Appraise Ingredients | alchemist | 3 sp | Fifteen minutes |
| DT_SERVICE_ALC_REFILL_VIAL | Refill Vial | alchemist | 2 cp | Five minutes |
| DT_SERVICE_ALC_DISTILL_ALCOHOL | Distill Alcohol | alchemist | 8 sp | Half a day |
| DT_SERVICE_ALC_GRIND_HERBS | Grind Herbs | alchemist | 3 cp | Ten minutes |
| DT_SERVICE_BMK_LAUNDER | Launder Stolen Goods | black-market | 10 gp | GM agreed |
| DT_SERVICE_BMK_FIND_BUYER | Find Buyer | black-market | 5 gp | GM agreed |
| DT_SERVICE_BMK_ACQUIRE_CONTRABAND | Acquire Contraband | black-market | 25 gp | GM agreed |
| DT_SERVICE_BMK_LOCATE_RARE | Locate Rare Item | black-market | 15 gp | GM agreed |
| DT_SERVICE_BMK_SMUGGLING | Arrange Smuggling | black-market | 20 gp | GM agreed |
| DT_SERVICE_BMK_FORGERY | Forgery Consultation | black-market | 5 gp | GM agreed |
| DT_SERVICE_BMK_APPRAISE | Appraise Illegal Goods | black-market | 3 gp | GM agreed |
| DT_SERVICE_BMK_DELIVERY | Discreet Delivery | black-market | 5 gp | GM agreed |
| DT_SERVICE_BMK_THEFT | Commission Theft | black-market | 50 gp | GM agreed |
| DT_SERVICE_BMK_ROUTE | Smuggling Route | black-market | 30 gp | GM agreed |

## Coverage and proposals

`complete` here means an existing offer covers the named activity with its stated manual limits; it is not a certification of an official fixed price. `incomplete` means a partial analogue or a different unit. Original proposals have no universal official price. Existing identifiers in this table are search keys into the inventory.

| Activity / source entry | Existing IDs or analogue | Status | Price source | Published benchmark / price policy | Recommended merchant | Fulfilment / limits |
| --- | --- | --- | --- | --- | --- | --- |
| Coach between towns | None | missing | SRD 5.1 p. 74 | 3 cp/mile | Tavern / General Store as booking agents | Manual GM fulfilment; per-mile/day uses quantity as agreed units. No travel or Actor transfer automation required. |
| Coach within city | None | missing | SRD 5.1 p. 74 | 1 cp/trip | Tavern / General Store as booking agents | Manual GM fulfilment; per-mile/day uses quantity as agreed units. No travel or Actor transfer automation required. |
| Skilled hireling | None | missing | SRD 5.1 p. 74 | 2 gp/day minimum | Tavern / General Store as booking agents | Manual GM fulfilment; per-mile/day uses quantity as agreed units. No travel or Actor transfer automation required. |
| Untrained hireling | None | missing | SRD 5.1 p. 74 | 2 sp/day | Tavern / General Store as booking agents | Manual GM fulfilment; per-mile/day uses quantity as agreed units. No travel or Actor transfer automation required. |
| Messenger | DT_SERVICE_TAV_COURIER_MESSAGE; DT_SERVICE_BMK_DELIVERY | incomplete | SRD 5.1 p. 74 | 2 cp/mile | Tavern / General Store as booking agents | Existing local courier is 2 sp per attempt, and Fence delivery 5 gp per arrangement; neither is the published per-mile rate. |
| Road or gate toll | None | missing | SRD 5.1 p. 74 | 1 cp | Tavern / General Store as booking agents | Manual GM fulfilment; per-mile/day uses quantity as agreed units. No travel or Actor transfer automation required. |
| Ship passage | None | missing | SRD 5.1 p. 74 | 1 sp/mile | Tavern / General Store as booking agents | Manual GM fulfilment; per-mile/day uses quantity as agreed units. No travel or Actor transfer automation required. |
| Stabling | DT_SERVICE_TAV_STABLE_HORSE | needs-review | SRD 5.1 p. 72 | 5 sp/day | Tavern | Existing 4 sp/day is an original price variation; feed is charged separately. |
| Feed for one day | DT_SERVICE_TAV_FEED_HORSE; DT_ITEM_GS_FEED_HORSE | needs-review | SRD 5.1 p. 72 | 5 cp/day; 10 lb | Tavern / General Store | Existing feed 8 cp, with carried goods and served feed kept distinct; do not bill twice for the same supply. |
| Inn stay — Squalid | DT_SERVICE_TAV_COMMON_ROOM / PRIVATE_ROOM / LUXURY_ROOM | incomplete | SRD 5.1 p. 74 | 7 cp/person-night | Tavern | Three project room offers do not constitute six source grades; private/luxury covers two guests per room. Price/unit must be chosen explicitly, not relabelled silently. |
| Inn stay — Poor | DT_SERVICE_TAV_COMMON_ROOM / PRIVATE_ROOM / LUXURY_ROOM | incomplete | SRD 5.1 p. 74 | 1 sp/person-night | Tavern | Three project room offers do not constitute six source grades; private/luxury covers two guests per room. Price/unit must be chosen explicitly, not relabelled silently. |
| Inn stay — Modest | DT_SERVICE_TAV_COMMON_ROOM / PRIVATE_ROOM / LUXURY_ROOM | incomplete | SRD 5.1 p. 74 | 5 sp/person-night | Tavern | Three project room offers do not constitute six source grades; private/luxury covers two guests per room. Price/unit must be chosen explicitly, not relabelled silently. |
| Inn stay — Comfortable | DT_SERVICE_TAV_COMMON_ROOM / PRIVATE_ROOM / LUXURY_ROOM | incomplete | SRD 5.1 p. 74 | 8 sp/person-night | Tavern | Three project room offers do not constitute six source grades; private/luxury covers two guests per room. Price/unit must be chosen explicitly, not relabelled silently. |
| Inn stay — Wealthy | DT_SERVICE_TAV_COMMON_ROOM / PRIVATE_ROOM / LUXURY_ROOM | incomplete | SRD 5.1 p. 74 | 2 gp/person-night | Tavern | Three project room offers do not constitute six source grades; private/luxury covers two guests per room. Price/unit must be chosen explicitly, not relabelled silently. |
| Inn stay — Aristocratic | DT_SERVICE_TAV_COMMON_ROOM / PRIVATE_ROOM / LUXURY_ROOM | incomplete | SRD 5.1 p. 74 | 4 gp/person-night | Tavern | Three project room offers do not constitute six source grades; private/luxury covers two guests per room. Price/unit must be chosen explicitly, not relabelled silently. |
| Meals per day — Squalid | DT_SERVICE_TAV_MEAL_DAY / BREAKFAST / DINNER_PACKAGE | incomplete | SRD 5.1 p. 74 | 3 cp/day | Tavern | Meal of the Day means one served meal, not a complete day of meals. Existing menus are original alternatives. |
| Meals per day — Poor | DT_SERVICE_TAV_MEAL_DAY / BREAKFAST / DINNER_PACKAGE | incomplete | SRD 5.1 p. 74 | 6 cp/day | Tavern | Meal of the Day means one served meal, not a complete day of meals. Existing menus are original alternatives. |
| Meals per day — Modest | DT_SERVICE_TAV_MEAL_DAY / BREAKFAST / DINNER_PACKAGE | incomplete | SRD 5.1 p. 74 | 3 sp/day | Tavern | Meal of the Day means one served meal, not a complete day of meals. Existing menus are original alternatives. |
| Meals per day — Comfortable | DT_SERVICE_TAV_MEAL_DAY / BREAKFAST / DINNER_PACKAGE | incomplete | SRD 5.1 p. 74 | 5 sp/day | Tavern | Meal of the Day means one served meal, not a complete day of meals. Existing menus are original alternatives. |
| Meals per day — Wealthy | DT_SERVICE_TAV_MEAL_DAY / BREAKFAST / DINNER_PACKAGE | incomplete | SRD 5.1 p. 74 | 8 sp/day | Tavern | Meal of the Day means one served meal, not a complete day of meals. Existing menus are original alternatives. |
| Meals per day — Aristocratic | DT_SERVICE_TAV_MEAL_DAY / BREAKFAST / DINNER_PACKAGE | incomplete | SRD 5.1 p. 74 | 2 gp/day | Tavern | Meal of the Day means one served meal, not a complete day of meals. Existing menus are original alternatives. |
| Ale, gallon | DT_ITEM_TAV_SMALL_ALE | incomplete | SRD 5.1 pp. 73–74 | 2 sp | Tavern | Pint goods do not supply a one-gallon sale unit. |
| Ale, mug | DT_ITEM_TAV_SMALL_ALE | needs-review | SRD 5.1 pp. 73–74 | 4 cp | Tavern | Several pint ales exist; SRD mug volume is not fixed. Do not equate every ale with the benchmark. |
| Banquet | DT_SERVICE_TAV_DINNER_PACKAGE | incomplete | SRD 5.1 pp. 73–74 | 10 gp/person | Tavern | Dinner package is not a banquet. |
| Bread, loaf | DT_ITEM_TAV_RYE_BREAD | needs-review | SRD 5.1 pp. 73–74 | 2 cp | Tavern | Original loaf variants exist; compare their explicit sale units and prices. |
| Cheese, hunk | DT_ITEM_TAV_FARMHOUSE_CHEESE | needs-review | SRD 5.1 pp. 73–74 | 1 sp | Tavern | Project quarter-pound portions exist; SRD hunk weight unspecified. |
| Meat, chunk | DT_ITEM_TAV_ROAST_BEEF_WITH_ONIONS | incomplete | SRD 5.1 pp. 73–74 | 3 sp | Tavern | A plated roast with accompaniments is not a generic chunk of meat. |
| Wine, common pitcher | DT_ITEM_TAV_HOUSE_RED_WINE | incomplete | SRD 5.1 pp. 73–74 | 2 sp | Tavern | Quarter-pint wine servings do not provide the named pitcher unit. |
| Wine, fine bottle | DT_ITEM_TAV_RESERVE_VINEYARD_WINE | incomplete | SRD 5.1 pp. 73–74 | 10 gp | Tavern | Quarter-pint wine servings do not provide the named bottle unit. |
| Lifestyle — Wretched | None | not-applicable | SRD 5.1 pp. 72–73 | No listed payment/day | GM campaign accounting | Bundled living expenses include food, lodging and maintenance. Optional future service, excluded from missing purchasable-item totals to avoid double charging. |
| Lifestyle — Squalid | None | not-applicable | SRD 5.1 pp. 72–73 | 1 sp/day | GM campaign accounting | Bundled living expenses include food, lodging and maintenance. Optional future service, excluded from missing purchasable-item totals to avoid double charging. |
| Lifestyle — Poor | None | not-applicable | SRD 5.1 pp. 72–73 | 2 sp/day | GM campaign accounting | Bundled living expenses include food, lodging and maintenance. Optional future service, excluded from missing purchasable-item totals to avoid double charging. |
| Lifestyle — Modest | None | not-applicable | SRD 5.1 pp. 72–73 | 1 gp/day | GM campaign accounting | Bundled living expenses include food, lodging and maintenance. Optional future service, excluded from missing purchasable-item totals to avoid double charging. |
| Lifestyle — Comfortable | None | not-applicable | SRD 5.1 pp. 72–73 | 2 gp/day | GM campaign accounting | Bundled living expenses include food, lodging and maintenance. Optional future service, excluded from missing purchasable-item totals to avoid double charging. |
| Lifestyle — Wealthy | None | not-applicable | SRD 5.1 pp. 72–73 | 4 gp/day | GM campaign accounting | Bundled living expenses include food, lodging and maintenance. Optional future service, excluded from missing purchasable-item totals to avoid double charging. |
| Lifestyle — Aristocratic | None | not-applicable | SRD 5.1 pp. 72–73 | 10 gp minimum/day | GM campaign accounting | Bundled living expenses include food, lodging and maintenance. Optional future service, excluded from missing purchasable-item totals to avoid double charging. |
| Silver one weapon | DT_SERVICE_BSM_SILVER_WEAPON | complete | SRD 5.1 p. 65 | 100 gp | Blacksmith | Payment is implemented; silvered Item modification is manual. Project duration is not an official fixed duration. |
| Silver ten ammunition | None | missing | SRD 5.1 p. 65 | 100 gp/ten pieces | Blacksmith | Existing service target predicate only permits weapon Items, not ammunition consumables; a separate/manual offer can use existing framework. |
| Spellcasting: cure wounds / identify | DT_SERVICE_ALC_IDENTIFY_POTION (nonmagical appraisal only) | missing | SRD 5.1 p. 74 | Example 10–50 gp plus expensive materials; no established universal rate | Alchemist / GM-assigned service provider | Book a specified caster/spell with GM-set quote and manual effect. Appraisal is not the identify spell; no universal price or guaranteed availability. |
| Bath | DT_SERVICE_TAV_BATH | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Tavern | Existing manual service. |
| Laundry | DT_SERVICE_TAV_LAUNDRY | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Tavern | Existing manual service. |
| Room rental and long-term stay | DT_SERVICE_TAV_PRIVATE_ROOM; DT_SERVICE_TAV_WEEKLY_LODGING | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Tavern | Existing optional room integrations; not identical to official graded per-person lodging. |
| Wagon freight | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | General Store / Tavern | Agree load, route, delivery and quote. |
| Guide | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Tavern / General Store | Skilled hireling benchmark may inform a negotiated fee; hazards can change it. |
| Porter | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Tavern / General Store | Untrained hireling benchmark only for unskilled safe labour; agree load and duration. |
| Guard escort | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Tavern / Blacksmith as arranger | Skilled hireling minimum is a reference, not a universal danger fee. |
| Craftsperson / labourer / specialist hire | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | General Store / Blacksmith | Use skilled/untrained benchmarks where appropriate; define scope. |
| Weapon repair | DT_SERVICE_BSM_REPAIR_WEAPON | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Blacksmith | Manual repair; no official universal repair price. |
| Armour repair | DT_SERVICE_BSM_REPAIR_ARMOUR | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Blacksmith | Manual repair; no official universal repair price. |
| Tool repair | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Blacksmith | Existing tool target predicate supports a new manual service. |
| Sharpening | DT_SERVICE_BSM_SHARPEN_BLADE | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Blacksmith | Existing commission does not grant an automatic damage bonus. |
| Custom manufacture commission | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Blacksmith / General Store | Custom Fitting and Resize Armour are alterations, not manufacture. Agree deposit, product and schedule; output manual. |
| Appraisal | DT_SERVICE_BSM_BASIC_APPRAISAL; DT_SERVICE_ALC_APPRAISE_INGREDIENTS | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Blacksmith / Alchemist | Existing mundane appraisals, not magic identification. |
| Equipment alteration | DT_SERVICE_BSM_RESIZE_ARMOUR; DT_SERVICE_BSM_CUSTOM_FITTING | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Blacksmith | Existing manual services. |
| Mundane healing / herbal treatment | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Alchemist / Tavern as arranger | No automatic HP recovery or immunity; GM chooses compatible rules. |
| Alchemical consultation | DT_SERVICE_ALC_APPRAISE_INGREDIENTS; DT_SERVICE_ALC_IDENTIFY_POTION | incomplete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Alchemist | Existing assessment services; general consultation is not a named offer. |
| Religious services | None | missing | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | GM-assigned provider / Tavern as arranger | No universal official price. Holy-water ritual costs are not a universal retail service fee. |
| Fencing / laundering | DT_SERVICE_BMK_LAUNDER | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Fence | Arrangement only; transfers and outcome manual. |
| Forgery consultation | DT_SERVICE_BMK_FORGERY | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Fence | Consultation only; a completed forgery is not automatically produced. |
| Smuggling | DT_SERVICE_BMK_SMUGGLING; DT_SERVICE_BMK_ROUTE | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Fence | Relationship/hidden access and profile restrictions apply. |
| Discreet delivery | DT_SERVICE_BMK_DELIVERY | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Fence | Local arrangement fee, not SRD messenger mileage. |
| Contraband procurement | DT_SERVICE_BMK_ACQUIRE_CONTRABAND | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Fence | Hidden offer; goods and delivery cost separate. |
| Locate buyer | DT_SERVICE_BMK_FIND_BUYER | complete | Project / original proposal | GM-defined; existing defaults in SERVICE_INVENTORY.json | Fence | Search fee, sale handled separately. |

## Framework assessment

Every proposed ordinary booking/commission can use the existing Services framework with a fixed GM-agreed quote, description, sale unit, optional target and manual fulfilment. Per-mile/day costs can use quantity as an agreed unit within existing limits. For variable percentages, deposits or open-ended work, the GM sets the concrete quote before approval; there is no generic percentage-of-resale or deferred contract engine. Those automations are not required to add honest manual offers.

Creating a living mount Actor, transferring vehicle ownership, reserving future labour, manufacturing outputs, applying spell effects or decrementing multiple crafting inputs is not implemented by simply paying for a service. Optional actions can reference existing world documents; no new universal automation is promised. Any request for these capabilities needs separate review, not merchant-specific code.

No new merchant type is required to sell a booking through an existing business, but the GM must provide a plausible in-world provider. Do not imply that every Tavern can cast spells or that every Alchemist is a cleric.

## Source and licensing notes

Benchmarks are factual comparisons with the [CC SRD 5.1](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf), pp. 65 and 72–74. Skilled pay is a minimum; spellcasting has no established universal rate. Book-specific expansion tables and prices are not assumed covered by the SRD. All 40 current services lack per-record source/license metadata: provenance classification is an audit inference, with the silvering price directly verified. See [Catalogue Audit](CATALOGUE_AUDIT.md) and [Source Notices](../SOURCE_NOTICES.md).

## Related documents

[Content Expansion Plan](CONTENT_EXPANSION_PLAN.md), [Merchant Services](../MERCHANT_SERVICES.md), [Integrations](../INTEGRATIONS.md).
