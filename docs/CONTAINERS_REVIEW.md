# General Store: Containers review

Build: **0.2.0-alpha.3**, with the same content as alpha.2. Exactly 13 authored items; all other General Store categories remain
plans. The canonical records are in [containers.json](../data/items/general-store/containers.json).
These permanent IDs are reserved and must not be renamed, even if names or balance change.

Prices, descriptions and empty weights are project choices for a grounded 2014-rules game with
Variant Encumbrance. The table is a review aid, not another source file. Live V14 / D&D5e 5.3.3
Foundry/Forge acceptance is still pending; automated checks cannot establish in-game compatibility.

| Item / permanent ID | Price | Empty lb | Contents limit, lb | Volume | Availability |
| --- | --- | --- | --- | --- | --- |
| Backpack — `DT_ITEM_GS_BACKPACK` | 8 sp | 2 | 30 | 1 cubic foot | Core |
| Pouch — `DT_ITEM_GS_POUCH` | 3 sp | 0.25 | 6 | 0.2 cubic feet | Core |
| Sack — `DT_ITEM_GS_SACK` | 1 sp | 0.25 | 30 | 1 cubic foot | Core |
| Chest — `DT_ITEM_GS_CHEST` | 5 gp | 18 | 300 | 12 cubic feet | Variable |
| Lockbox — `DT_ITEM_GS_LOCKBOX` | 12 gp | 4 | 10 | 0.15 cubic feet | Special-order |
| Barrel — `DT_ITEM_GS_BARREL` | 2 gp | 35 | 334 | 40 gallons | Variable |
| Crate — `DT_ITEM_GS_CRATE` | 6 sp | 6 | 80 | 4 cubic feet | Variable |
| Basket — `DT_ITEM_GS_BASKET` | 4 sp | 1 | 40 | 2 cubic feet | Core |
| Bottle — `DT_ITEM_GS_BOTTLE` | 2 sp | 0.75 | 2 | 1 quart | Core |
| Flask — `DT_ITEM_GS_FLASK` | 8 cp | 0.25 | 1 | 1 pint | Core |
| Waterskin — `DT_ITEM_GS_WATERSKIN` | 5 sp | 0.5 | 4 | 2 quarts | Core |
| Clay Jug — `DT_ITEM_GS_JUG_CLAY` | 3 cp | 2 | 8 | 1 gallon | Core |
| Ceramic Jar — `DT_ITEM_GS_JAR_CERAMIC` | 6 cp | 0.5 | 2 | 1 quart | Core |

Liquid volumes use US measures. Both capacity limits apply to suitable contents; physical shape
still matters. Container capacities are gameplay allowances, not engineering load certifications.

## Decisions to review

- **Price mix:** three copper-priced vessels, seven silver-priced everyday containers and three
  gold-priced purchases. No item was inflated to reach the specialist band. At 25 gp that band begins.
- **Empty mass:** every item is sold empty. A waterskin has 0.5 lb of shell and fittings; a full
  game-weight water load adds 4 lb, for 4.5 lb total. No water Item is included or auto-generated.
- **Bulky storage:** a chest, crate or barrel still needs suitable transport when loaded. Their
  large capacities do not grant carrying capacity or reduce their contents' encumbrance.
- **Fittings:** the lockbox includes its fitted lock and one key. The chest includes a hasp but
  no lock. Bottle and Flask include corks; the jug is open; the jar's resting lid is not watertight.
- **Stock:** the lockbox is special-order in this village-oriented baseline. All 13 remain available
  to the compendium builder; availability and Merchant Notes guide the GM rather than rolling stock.
- **Shared goods:** Barrel, Basket, Bottle, Flask, Clay Jug and Ceramic Jar also have Tavern tags;
  Bottle, Flask and Ceramic Jar have Alchemist tags; Lockbox has Blacksmith and Black Market tags.
  These tags never duplicate the item or change its permanent identity.
- **Automation:** native containers hold inventory and count ordinary contents weight. Liquid
  filling/consumption, volume enforcement, locks, breakage and weather protection remain GM decisions.

## Text and icon provenance

Descriptions are newly authored project text; no official item description was copied. Each source
record states that the project's distribution license is pending. No public distribution license is
chosen by this build. Rules, capacities and economic choices still require the owner's balance review.

Icons reference Foundry's installed core library; no artwork is downloaded or bundled. Paths were
checked against the official D&D5e `release-5.3.3` source entries below. This verifies references,
not how every icon appears in a live Foundry V14 installation; that remains on the acceptance list.

| Our item | Official source entry used to verify its core icon path |
| --- | --- |
| Backpack | [Backpack](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/backpack/_container.yml) |
| Pouch | [Pouch](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/pouch/_container.yml) |
| Sack | [Sack](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/sack/_container.yml) |
| Chest | [Chest](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/chest/_container.yml) |
| Lockbox | [Lock](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/lock.yml) |
| Barrel | [Barrel](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/barrel/_container.yml) |
| Crate | [Alms Box](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/alms-box/_container.yml) |
| Basket | [Basket](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/basket/_container.yml) |
| Bottle | [Glass Bottle](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/glass-bottle/_container.yml) |
| Flask; Ceramic Jar | [Flask](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/flask/_container.yml) |
| Waterskin | [Waterskin](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/food/waterskin.yml) |
| Clay Jug | [Jug](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/jug/_container.yml) |

**Review stop:** do not author Fire & Lighting or any later category until this batch has been reviewed.
