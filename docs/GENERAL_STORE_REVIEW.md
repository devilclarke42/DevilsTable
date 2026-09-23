# General Store review — complete approved categories

Build: **0.2.0-alpha.4**. There are **69 authored General Store items**: the original
[13 Containers](CONTAINERS_REVIEW.md), unchanged, and the 56 additions below.
Canonical JSON remains the source of truth; these tables are a review aid.

Every item has a permanent ID, original description, price, adjusted weight with rationale,
icon, category, descriptive tags, shop tags, availability and provenance. All 56 additions
also state the exact purchase unit. IDs must survive any later balance or wording change.

## Catalogue and pricing

| Category | Authored items | Canonical source |
| --- | ---: | --- |
| Containers | 13 | [containers.json](../data/items/general-store/containers.json) |
| Fire & Lighting | 12 | [fire-lighting.json](../data/items/general-store/fire-lighting.json) |
| Rope & Climbing | 6 | [rope-climbing.json](../data/items/general-store/rope-climbing.json) |
| Camping | 11 | [camping.json](../data/items/general-store/camping.json) |
| Writing | 7 | [writing.json](../data/items/general-store/writing.json) |
| Household | 9 | [household.json](../data/items/general-store/household.json) |
| Animal | 6 | [animal.json](../data/items/general-store/animal.json) |
| Travel | 5 | [travel.json](../data/items/general-store/travel.json) |

The complete price mix is **31 cp purchases, 27 sp purchases, 9 equipment purchases below
25 gp and 2 specialist purchases at 25+ gp**. Prices use whole coins, with cp/sp values from
1 through 9. The 25 gp compass and 100 gp spyglass are specialist goods. The spyglass price
deliberately differs from the 2014 equipment price of 1,000 gp; this is a project economy.

Availability is independent of price. Core means normal village stock, variable means
intermittently stocked, and special-order means an uncommon purchase to arrange with the GM.
All are available to the builder. Merchant Notes remain builder-only guidance, not stock rolls.

## Purchase units and weight decisions

- Quantity 1 is the entire listed purchase, with the listed price and weight. A bundle of ten
  pitons is not ten 2 lb pitons. Splitting bundles or kit components is manual actor bookkeeping.
- All pots, kettles, cups, bowls, buckets and feed bags are sold empty. Their weights exclude
  contents. Native container capacities do not reduce the weight of carried contents.
- Lamp Oil is one filled pint flask at 1 lb: 0.75 lb of oil plus 0.25 lb of flask. Ink is a
  filled one-fluid-ounce bottle at 0.1 lb. Retained packaging and transferred fuel are tracked
  manually; do not count transferred oil both in its source flask and in the lamp.
- Horse Feed intentionally retains 10 lb for a daily ration. The adjusted-weight policy is
  an authored decision per item, not a blanket reduction that makes animal provisioning trivial.
- Tent and repair-kit weights include their listed parts. Bedroll includes its light blanket;
  buying the separate Blanket supplies an additional layer.
- Tiny goods keep a positive weight, including the 0.002 lb Needle, so large quantities are
  not automatically weightless.

## Item tables

All weights are in pounds **per sale unit**. Empty vessels say so explicitly. Availability
uses the source slugs. The full descriptions, weight rationale, tags and source notes live in
the linked category JSON.

### Fire & Lighting — 12 items

| Item / permanent ID | One purchase | Price | lb | Availability |
| --- | --- | ---: | ---: | --- |
| Torch — `DT_ITEM_GS_TORCH` | one torch | 2 cp | 0.5 | core |
| Candle — `DT_ITEM_GS_CANDLE` | one small mixed-wax candle | 1 cp | 0.05 | core |
| Beeswax Candle — `DT_ITEM_GS_CANDLE_BEESWAX` | one long beeswax candle | 6 cp | 0.2 | variable |
| Tallow Candle — `DT_ITEM_GS_CANDLE_TALLOW` | one thick tallow candle | 2 cp | 0.1 | core |
| Lantern — `DT_ITEM_GS_LANTERN` | one empty candle lantern | 7 sp | 0.75 | variable |
| Hooded Lantern — `DT_ITEM_GS_LANTERN_HOODED` | one empty hooded oil lantern | 6 gp | 1.5 | variable |
| Bullseye Lantern — `DT_ITEM_GS_LANTERN_BULLSEYE` | one empty bullseye oil lantern | 12 gp | 2 | special-order |
| Lamp — `DT_ITEM_GS_LAMP` | one empty oil lamp | 4 sp | 0.5 | core |
| Lamp Oil — `DT_ITEM_GS_OIL_LAMP` | one stoppered flask containing 1 pint of oil | 2 sp | 1 | core |
| Tinderbox — `DT_ITEM_GS_TINDERBOX` | one complete tinderbox | 4 sp | 0.25 | core |
| Flint & Steel — `DT_ITEM_GS_FLINT_STEEL` | one flint and one striking steel | 8 cp | 0.1 | core |
| Charcoal — `DT_ITEM_GS_CHARCOAL` | one 5 lb bag of charcoal | 8 cp | 5 | core |

### Rope & Climbing — 6 items

| Item / permanent ID | One purchase | Price | lb | Availability |
| --- | --- | ---: | ---: | --- |
| Hempen Rope — `DT_ITEM_GS_ROPE_HEMP` | one 50-foot coil | 7 sp | 5 | core |
| Silk Rope — `DT_ITEM_GS_ROPE_SILK` | one 50-foot coil | 8 gp | 2.5 | special-order |
| Twine — `DT_ITEM_GS_TWINE` | one 100-foot ball of twine | 5 cp | 0.1 | core |
| Grappling Hook — `DT_ITEM_GS_GRAPPLING_HOOK` | one grappling hook | 2 gp | 2 | variable |
| Pitons — `DT_ITEM_GS_PITONS` | one bundle of 10 pitons | 5 sp | 2 | variable |
| Climber's Kit — `DT_ITEM_GS_CLIMBERS_KIT` | one complete climber's kit | 18 gp | 5 | special-order |

### Camping — 11 items

| Item / permanent ID | One purchase | Price | lb | Availability |
| --- | --- | ---: | ---: | --- |
| Blanket — `DT_ITEM_GS_BLANKET` | One wool blanket | 4 sp | 2 | variable |
| Bedroll — `DT_ITEM_GS_BEDROLL` | One complete single-person bedroll | 8 sp | 3 | core |
| Tent — `DT_ITEM_GS_TENT` | One two-person tent with poles, pegs and guy lines | 3 gp | 8 | variable |
| Bedroll Strap — `DT_ITEM_GS_BEDROLL_STRAP` | One buckled leather strap | 4 cp | 0.1 | core |
| Mess Kit — `DT_ITEM_GS_MESS_KIT` | One nesting pan, plate, cup and spoon set | 3 sp | 0.5 | core |
| Cooking Pot — `DT_ITEM_GS_POT_COOKING` | One empty two-quart iron pot with lid | 7 sp | 3 | core |
| Camp Kettle — `DT_ITEM_GS_KETTLE_CAMP` | One empty two-quart metal kettle with lid | 9 sp | 1.5 | variable |
| Cup — `DT_ITEM_GS_CUP` | One empty one-pint wooden cup | 2 cp | 0.15 | core |
| Bowl — `DT_ITEM_GS_BOWL` | One empty one-pint wooden bowl | 3 cp | 0.25 | core |
| Spoon — `DT_ITEM_GS_SPOON` | One wooden eating spoon | 1 cp | 0.02 | core |
| Wooden Plate — `DT_ITEM_GS_PLATE_WOOD` | One wooden dinner plate | 2 cp | 0.25 | core |

### Writing — 7 items

| Item / permanent ID | One purchase | Price | lb | Availability |
| --- | --- | ---: | ---: | --- |
| Parchment — `DT_ITEM_GS_PARCHMENT` | One sheet, approximately 8 by 12 inches | 8 cp | 0.02 | variable |
| Paper — `DT_ITEM_GS_PAPER` | One sheet, approximately 8 by 12 inches | 4 cp | 0.01 | core |
| Ink — `DT_ITEM_GS_INK` | One stoppered bottle containing 1 US fluid ounce of ink | 2 sp | 0.1 | variable |
| Ink Pen — `DT_ITEM_GS_INK_PEN` | One cut quill pen | 2 cp | 0.01 | core |
| Chalk — `DT_ITEM_GS_CHALK` | One stick of white chalk | 1 cp | 0.02 | core |
| Wax — `DT_ITEM_GS_WAX` | One small bar of sealing wax | 4 cp | 0.05 | core |
| Sealing Stamp — `DT_ITEM_GS_SEALING_STAMP` | One brass-faced stamp with a simple geometric mark | 7 sp | 0.2 | variable |

### Household — 9 items

| Item / permanent ID | One purchase | Price | lb | Availability |
| --- | --- | ---: | ---: | --- |
| Soap — `DT_ITEM_GS_SOAP` | One bar of plain soap | 4 cp | 0.25 | core |
| Needle — `DT_ITEM_GS_NEEDLE` | One steel sewing needle | 1 cp | 0.002 | core |
| Thread — `DT_ITEM_GS_THREAD` | One spool holding 50 feet of linen thread | 2 cp | 0.02 | core |
| Sewing Kit — `DT_ITEM_GS_SEWING_KIT` | One domestic mending kit | 2 sp | 0.15 | core |
| Broom — `DT_ITEM_GS_BROOM` | One straw broom | 5 cp | 1.5 | core |
| Mop — `DT_ITEM_GS_MOP` | One wooden-handled cloth mop | 8 cp | 1.25 | core |
| Wash Bucket — `DT_ITEM_GS_BUCKET_WASH` | One empty three-gallon bucket | 3 sp | 1.5 | core |
| Wash Board — `DT_ITEM_GS_BOARD_WASH` | One ribbed wooden wash board | 2 sp | 2 | variable |
| Clothes Line — `DT_ITEM_GS_CLOTHES_LINE` | One 50-foot length of laundry cord | 8 cp | 1 | core |

### Animal — 6 items

| Item / permanent ID | One purchase | Price | lb | Availability |
| --- | --- | ---: | ---: | --- |
| Horse Feed — `DT_ITEM_GS_FEED_HORSE` | One day's ten-pound ration of dry animal feed | 8 cp | 10 | core |
| Feed Bag — `DT_ITEM_GS_BAG_FEED` | One empty canvas feed bag | 2 sp | 0.5 | core |
| Brush — `DT_ITEM_GS_BRUSH` | One stiff-bristled grooming brush | 3 cp | 0.1 | core |
| Curry Comb — `DT_ITEM_GS_CURRY_COMB` | One metal curry comb | 4 cp | 0.2 | core |
| Horseshoes — `DT_ITEM_GS_HORSESHOES` | One set of four iron horseshoes with fitting nails | 8 sp | 2 | core |
| Tack Repair Kit — `DT_ITEM_GS_TACK_REPAIR_KIT` | One compact tack-mending kit | 5 sp | 0.75 | variable |

### Travel — 5 items

| Item / permanent ID | One purchase | Price | lb | Availability |
| --- | --- | ---: | ---: | --- |
| Walking Stick — `DT_ITEM_GS_WALKING_STICK` | One five-foot wooden walking stick | 3 cp | 1 | core |
| Compass — `DT_ITEM_GS_COMPASS` | One pocket magnetic compass in a brass case | 25 gp | 0.1 | special-order |
| Spyglass — `DT_ITEM_GS_SPYGLASS` | One collapsible brass spyglass | 100 gp | 0.75 | special-order |
| Bell — `DT_ITEM_GS_BELL` | One small brass hand bell | 1 sp | 0.1 | core |
| Signal Whistle — `DT_ITEM_GS_WHISTLE_SIGNAL` | One wooden signal whistle | 6 cp | 0.02 | core |

## Supported system behaviour

The catalogue maps to **37 loot Items, 19 native containers and 13 mundane consumables**.
The consumable document type provides the system's utility-activity UI; five of those Items
are reusable and have no consumption target.

| Behaviour | Items | Inventory action |
| --- | --- | --- |
| Completed-unit consumption | Torch; Candle; Beeswax Candle; Tallow Candle; Lamp Oil; Charcoal; Ink; Horse Feed | Spend one use of the owning Item; native D&D5e reduces quantity by one and removes an exhausted final unit |
| Reusable utility | Lantern; Hooded Lantern; Bullseye Lantern; Lamp; Climber's Kit | Record the described action without spending inventory or spell slots |
| New native vessels | Cooking Pot; Camp Kettle; Cup; Bowl; Wash Bucket; Feed Bag | Store contents with normal weight accounting |
| Ordinary goods | All other additions | No invented proficiency, attack, skill bonus or automatic consumption |

Use a candle/torch's completed-burn action **after it has burned out**, not when lighting it.
Ink and charcoal are marked spent only after a whole bottle/bag has been exhausted. Oil may
be expended into a lamp or by its described alternative use. Track partial use and elapsed
time manually. The builder never changes actor inventory, and it never deletes compendium Items.

### Lighting reference

Dim distance below is the **total reach**, including the bright area. The distinction matters
for manual token configuration. Cone shape is documented for the bullseye; no token changes,
measured-template placement or burn timer are automated.

| Item | Bright ft | Total dim ft | Hours | Fuel / project distinction |
| --- | ---: | ---: | ---: | --- |
| Torch | 20 | 40 | 1 | Self; 2014 baseline |
| Candle | 5 | 10 | 1 | Self; 2014 baseline |
| Beeswax Candle | 5 | 10 | 4 | Self; larger project candle |
| Tallow Candle | 5 | 10 | 2 | Self; project candle size |
| Lantern | 5 | 10 | 1 | Separate basic candle; project candle lantern |
| Hooded Lantern | 30 | 60 | 6 | Separate pint of oil; 2014 baseline |
| Bullseye Lantern | 60 | 120 | 6 | Separate pint of oil; 60/120 ft cone, 2014 baseline |
| Lamp | 15 | 45 | 6 | Separate pint of oil; 2014 baseline |

The plain Lantern is a candle lantern, distinct from the two oil lanterns. A beeswax or tallow
candle changes its practical burn time to that candle's listed duration. Hooding the Hooded
Lantern reduces it to dim light within 5 ft, handled manually.

### Other mechanics and deliberate boundaries

- Hempen and silk rope use the 2014 2 hp / DC 17 Strength break rule. Silk is lighter, not a
  climbing bonus. Twine and laundry cord are not person-supporting climbing ropes.
- The climber's kit follows the 2014 anchored 25-foot limit; its action grants no climbing
  speed, tool proficiency or guaranteed successful check.
- The spyglass retains the 2014 apparent-size multiplier of two. The compass is an original
  mundane navigation aid, not an automatic successful navigation check.
- Basic candle, torch and oil-light ranges/durations follow the 2014 reference. Beeswax and
  tallow variants have authored sizes and burn times. Tinderbox use and the described torch/oil
  combat options reference 2014 rules; attacks and damage are adjudicated manually.
- The sewing and tack repair kits are modest domestic equipment, not proficiency tool sets.
  Walking Stick is ordinary gear; this build does not add a weapon converter.
- Items tagged for other shops keep their one permanent identity. Alchemist selection now
  includes Bottle, Flask, Ceramic Jar, Lamp Oil, Charcoal and Ink.

## Source and artwork provenance

Rules reference: [System Reference Document 5.1 (SRD 5.1)](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf),
Wizards of the Coast LLC, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Descriptions are original project wording; source fields distinguish referenced 2014 mechanics
from project designs. Prices, adjusted weights, packaging and candle variants are project changes.
This does not choose a distribution license for original project text, code or artwork.

The official D&D5e **release-5.3.3** sources were checked for native field shapes and core icon
paths. See [architecture references](ARCHITECTURE.md#checked-primary-references) for model code.
The following table groups new items by the official source entry used to verify their icon.
Artwork depicting a magic item is used only as a core-library picture; it supplies no mechanics.

| New item(s) | Official source used to verify core icon |
| --- | --- |
| Torch | [trinket/torch.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/torch.yml) |
| Candle; Beeswax Candle; Tallow Candle | [trinket/candle.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/candle.yml) |
| Lantern; Hooded Lantern; Bullseye Lantern; Lamp | [trinket/lamp.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/lamp.yml) |
| Lamp Oil | [trinket/oil-flask.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/oil-flask.yml) |
| Hempen Rope; Silk Rope; Twine; Clothes Line | [trinket/hempen-rope-50-ft.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/hempen-rope-50-ft.yml) |
| Grappling Hook | [loot/grappling-hook.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/grappling-hook.yml) |
| Pitons | [trinket/piton.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/piton.yml) |
| Climber's Kit | [trinket/climbers-kit.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/climbers-kit.yml) |
| Blanket | [loot/blanket.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/blanket.yml) |
| Bedroll | [loot/bedroll.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/bedroll.yml) |
| Tent | [loot/two-person-tent.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/two-person-tent.yml) |
| Mess Kit | [loot/mess-kit.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/mess-kit.yml) |
| Cooking Pot; Camp Kettle | [container/iron-pot/_container.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/iron-pot/_container.yml) |
| Cup | [container/tankard/_container.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/tankard/_container.yml) |
| Bowl | [trinket/bowl-of-commanding-water-elementals.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/bowl-of-commanding-water-elementals.yml) |
| Parchment | [loot/parchment.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/parchment.yml) |
| Paper | [loot/paper.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/paper.yml) |
| Ink | [loot/ink-bottle.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/ink-bottle.yml) |
| Ink Pen | [loot/ink-pen.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/ink-pen.yml) |
| Wax | [loot/sealing-wax.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/sealing-wax.yml) |
| Soap | [loot/soap.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/soap.yml) |
| Broom | [trinket/broom-of-flying.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/broom-of-flying.yml) |
| Wash Bucket | [container/bucket/_container.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/bucket/_container.yml) |
| Horse Feed | [food/feed.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/food/feed.yml) |
| Feed Bag | [container/sack/_container.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/container/sack/_container.yml) |
| Horseshoes | [trinket/horseshoes-of-speed.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/trinket/horseshoes-of-speed.yml) |
| Tack Repair Kit | [tool/leatherworkers-tools.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/tool/leatherworkers-tools.yml) |
| Walking Stick | [loot/pole.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/pole.yml) |
| Spyglass | [loot/spyglass.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/spyglass.yml) |
| Bell | [loot/bell.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/bell.yml) |
| Signal Whistle | [loot/signal-whistle.yml](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/packs/_source/items/loot/signal-whistle.yml) |

Core artwork is referenced from the installed Foundry library, not copied into this repository.
Fifteen new SVG icons in `assets/icons/` were authored for this project and rendered for visual
inspection. Their subjects and individual files are listed in [the file map](FILE_MAP.md#original-module-artwork).
They have no external image, script or font dependencies. Actual in-world rendering is part of live acceptance.

## Upgrade and review result

Automated validation accepts all 69 records; 133 tests pass. A comparison against alpha.3's
converter confirms all 13 original generated Container documents are unchanged. The upgrade
test creates 56 additions, preserves those 13 and then reports all 69 unchanged on a rerun.

Install the alpha.4 ZIP and select **Village General Store → All categories**. Preview should
show 56 creates and 13 unchanged if the original batch is already complete, or 69 creates in a
fresh world. Keep the existing compendium. Review the new content and run the
[live checklist](TESTING.md), especially actor-import consumption, reusable actions and icons.
The previous read-back fix was reported successful by the user; these new features are not yet
claimed as live-tested. Further shop expansion waits for review.
