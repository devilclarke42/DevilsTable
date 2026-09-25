# Sprint 3 — Complete General Store review

**Candidate:** 0.2.0-alpha.7 · **Date:** 2026-09-25 · **Scope:** General Store only.

Canonical JSON is authoritative. This review summarizes the authored catalogue and implementation;
it is not an alternative data source. The target remains Foundry V14 / D&D5e 5.3.3, with 2014
mechanics and individually adjusted pounds for Variant Encumbrance. Detailed live Foundry/Forge
acceptance is still pending; automated persistence checks use test doubles.

## Scope and preservation

The catalogue now contains **144 products in ten curated categories**: 75 additions and the 69
accepted earlier goods. Every record includes its permanent identity, original description,
sale unit, price, adjusted weight/rationale, icon, category, tags, shop assignment, availability,
provenance and supported mechanical mapping. IDs are reserved permanently in the source ledger.

All 69 existing IDs, descriptions, prices, weights, mechanics, icons, tags and shop assignments
are retained. The only field added to accepted Item records is `saleUnit` on the thirteen original
Containers. Frozen source hashes and a simulated upgrade enforce that preservation. Lighting & Fire
and Animal Supplies use the existing `fire-lighting` and `animal` slugs despite their new display labels.
The schema now requires sale units and at least one tag; normalized names must be globally unique.

The other merchant catalogues remain partial and unchanged: Tavern 31 shared goods, Alchemist 6,
Blacksmith 7 and Black Market 4. All 75 additions are assigned only to General Store. Tavern
content authoring has not begun.

## Category and economy review

| Category | Total | Added in Sprint 3 |
| --- | ---: | ---: |
| Containers | 13 | 0 |
| Lighting & Fire | 17 | 5 |
| Rope & Climbing | 10 | 4 |
| Camping | 21 | 10 |
| Writing | 13 | 6 |
| Household | 18 | 9 |
| Animal Supplies | 12 | 6 |
| Travel | 13 | 8 |
| Tools | 16 | 16 |
| Trade Goods | 11 | 11 |

Prices use 58 copper purchases, 61 silver purchases, 23 equipment purchases below 25 gp and two
specialist purchases at 25 gp or above. Existing accepted prices are unchanged. New goods fill
practical gaps: repair tools, weather protection, food/fuel sale units, household fittings,
animal handling, writing surfaces and measured raw materials. No minor quality variants were
added solely to reach a count.

Raw cloth/leather are sold by explicit area: Linen 4 cp per square yard, Canvas 6 cp per square
yard, Wool Cloth 8 cp per square yard and Leather 6 cp per square foot. These prices leave room
for stitching, fittings and labour in finished goods. They are a curated campaign economy, not
an asserted historical market or automatic crafting/profit formula. Travel Rations cost 3 sp per
day; Firewood is a 5 cp, ten-pound bundle. Salt, wax, pitch and dye describe included packaging;
reusable container purchases remain separate unless explicitly included.

Adjusted weights describe the entire purchase, not one component. Examples include 0.3 lb per
square yard of light Linen, 1 lb per iron bar, 2 lb per day's Travel Rations and 10 lb per Firewood
bundle. Weight notes explain empty/full status and exclusions. No global multiplier or silent
change to world encumbrance settings is introduced.

## Mechanical boundaries

The complete catalogue uses 107 ordinary `loot` Items, 21 native `container` Items and sixteen
supported mundane `consumable` Items. Eleven consumables remove one completed sale unit; five
reusable activities do not consume the Item. Kindling, Firewood and Travel Rations join the
existing completed-use supplies. Burning time, token lighting, partial fuel use and transferred
contents remain manual.

Document Case and Saddlebags use native container mappings with normal contents weight. Their
reviewed project capacities are 1 lb / 0.04 cubic feet and 20 lb / 1 cubic foot respectively;
Saddlebags are one matched pair. A cooking skillet and mortar are ordinary working goods, not
storage containers with invented inventory capacity.

Rules-bearing descriptions preserve relevant 2014 mechanics: Crowbar grants advantage when
leverage is relevant to a Strength check; Chain has 10 hit points and a DC 20 Strength break;
Block and Tackle supports four times normal lifting capacity; Document Case holds ten rolled
sheets of paper or five parchment sheets; Padlock specifies a DC 15 Dexterity check with thieves'
tools by a proficient user. These descriptions are guidance, not new automated effects. Ordinary
hand tools do not grant proficiency, crafting recipes or weapon statistics. Container volume,
weather resistance and animal restraint still require GM judgment.

Mechanics were checked against the [2014 equipment rules](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment).
Where source records cite SRD 5.1, attribution is to Wizards of the Coast's *System Reference
Document 5.1* under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); original descriptions,
project prices and adjusted weights are identified separately. Item provenance does not itself
choose the project's public distribution licence.

## Merchant profiles and quantities

| Profile | Permanent prefix | Eligible products | Always / Often / Rarely | Whole-shop / category attempts |
| --- | --- | ---: | --- | --- |
| Village General Store | `DT_TABLE_GS` | 144 | 82 / 54 / 8 | 8 / 3 |
| Town General Store | `DT_TABLE_GS_TOWN` | 144 | 87 / 49 / 8 | 14 / 4 |
| City General Store | `DT_TABLE_GS_CITY` | 144 | 90 / 53 / 1 | 22 / 6 |
| Merchant Wagon | `DT_TABLE_GS_WAGON` | 133 | 66 / 59 / 8 | 6 / 2 |

Village retains source availability. Variants inherit its catalogue/categories and base overrides,
then apply the following explicit exceptions. No product is duplicated or repriced.

### Town General Store

A settled market shop with steady repair trade, writing supplies and wider rotating stock.

**Always overrides:** Blanket, Lantern, Hand Saw, Slate, Iron Bar.

### City General Store

A well-connected city supplier with broader choice, regular stationery and access to specialist travel goods.

**Always overrides:** Blanket, Lantern, Hand Saw, Slate, Iron Bar, Ink, Chisel, Padlock.

**Often overrides:** Compass, Silk Rope, Bullseye Lantern, Climber's Kit, Lockbox, Hourglass, Silk Cloth.

### Merchant Wagon

A travelling seller prioritising portable provisions, replacements and mending supplies; bulky workshop stock stays at fixed shops.

**Often overrides:** Horse Feed, Cooking Pot, Skillet, Wash Bucket, Broom, Mop, Shovel, Clay Jug, Ceramic Jar, Wax Tablet, Candle Holder, Linen, Canvas, Leather, Salt.

**Excluded:** Chest, Barrel, Crate, Firewood, Cooking Tripod, Sledgehammer, Miner's Pick, Wash Board, Door Hinges, Iron Bar, Copper Bar.

The rotating availability policy remains 80% Often, 15% Rarely and 5% no extra stock per attempt.
Always products are guaranteed. Each chosen product receives one weighted quantity roll based
on effective merchant tier and canonical price band. Rarely goods receive one sale unit 95% of
the time and two 5% of the time. Thus Compass uses Rare quantities in Village and Scarce quantities
in City; its canonical Item and price are identical. Quantity means complete sale units, including
bundles and pairs. See [STOCK_TABLES.md](STOCK_TABLES.md) for the full distributions.

Four tables per profile give sixteen General Store tables and 32 active module tables. Category
filters and quantity rolls reuse those tables. Repeated references across different merchant
assortments are intentional; there are no duplicate Item documents or per-category/per-quantity
tables. Builder-only notes/descriptions never enter generated compendium data. Rolling creates
no saved inventory, chat message or world-tab table copy.

## Artwork and provenance

Existing core icons and all fifteen original SVGs are reused where suitable. Twelve new WebPs
cover subjects for which the reviewed existing imagery was misleading, such as an unlit empty
candle holder, distinct small sewing fittings, and working tools. Wax Tablet and Slate share one
writing-surface icon. No colour/material duplicate exports are included.

The new artwork is original project vector construction produced during Sprint 3, extending the
existing quiet background, muted palette and simple equipment silhouettes. Editable instructions
are in `tools/render-general-store-icons.py`, exported using Inkscape and Pillow. No third-party
artwork or AI raster-generation output was used for this batch. Project distribution licensing
remains pending; no external artwork licence is implied.

| Runtime asset | Used by | Bytes |
| --- | --- | ---: |
| `assets/icons/buttons.webp` | Wooden Buttons | 4,830 |
| `assets/icons/candle-holder.webp` | Candle Holder | 3,478 |
| `assets/icons/candle-snuffer.webp` | Candle Snuffer | 2,760 |
| `assets/icons/clothes-pegs.webp` | Clothes Pegs | 3,796 |
| `assets/icons/comb.webp` | Comb | 2,512 |
| `assets/icons/crowbar.webp` | Crowbar | 3,542 |
| `assets/icons/document-case.webp` | Document Case | 4,024 |
| `assets/icons/hinges.webp` | Door Hinges | 4,458 |
| `assets/icons/mortar-pestle.webp` | Mortar and Pestle | 4,420 |
| `assets/icons/thimble.webp` | Thimble | 3,194 |
| `assets/icons/whetstone.webp` | Whetstone | 4,166 |
| `assets/icons/writing-tablet.webp` | Wax Tablet, Slate | 2,950 |

All twelve are 256×256, each below 5 KiB; total **44,130 bytes**. Dimension/format and exact-hash duplication checks passed; rendered artwork was visually reviewed.
The new assets are installed with the module, while editable masters stay outside the runtime ZIP.

Core paths are recorded in `tests/fixtures/core-icon-references.json`, with official D&D5e
`release-5.3.3` source references or the accepted prior icon review. This catches unreviewed path
changes but cannot prove that every icon resolves in a particular Foundry installation. Live
icon rendering remains an acceptance check. Core artwork is referenced, not redistributed.

## Upgrade and verification

| Starting state | Item build | Stock-table build |
| --- | --- | --- |
| Fresh world | 144 creates | 32 creates across all profiles |
| Complete alpha.6 packs | 75 creates, 13 sale-unit updates, 56 unchanged | 12 creates, 3 Village pool updates, 17 unchanged |
| Current candidate, rebuilt | 144 unchanged | 32 unchanged |
| Containers-only Item pack | 131 creates, 13 sale-unit updates | Depends on existing stock pack; build Items first |

All original Item and table document identities are preserved. Pack folders, foreign flags and
unrelated documents retain the existing protection contract. New profiles add twelve permanent
table reservations; the ledger contains 132 IDs, including all 100 retired category IDs.

The 226 automated tests cover validation, duplicate prevention, icon references/owned files,
source-preservation hashes, both upgrade paths, repeated builds, variant policy, effective-tier
quantities, preflight and failure recovery. The builders are exercised against persistence doubles;
no claim is made that a live world compendium was generated remotely.

Install the candidate, rebuild Items, then use the separate RollTable settings button to build
all profiles. Legacy cleanup remains a separate reviewed action. Because current source membership
and two category labels changed, even unedited alpha.5 category tables may no longer match and
will be protected. Only delete the eligible IDs shown by the preview; do not force a count of 32.
Follow [TESTING.md](TESTING.md) for the pending live checklist and [RELEASE_PROCESS.md](RELEASE_PROCESS.md)
before public release. The sprint stops here, before Tavern.

## Complete catalogue review

Prices and weights below are per sale unit; weight is in pounds. `core`, `variable` and
`special-order` are canonical availability, before merchant overrides. **New** marks a Sprint 3
addition; **Retained** marks an accepted record. Full descriptions, weight rationale, icons,
tags, provenance and mechanical mappings remain in the linked JSON source files.

### Containers

Source: [containers.json](../data/items/general-store/containers.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_BACKPACK` | Backpack | One empty canvas backpack with leather straps | 8 sp | 2 | core | Retained |
| `DT_ITEM_GS_POUCH` | Pouch | One empty leather belt pouch | 3 sp | 0.25 | core | Retained |
| `DT_ITEM_GS_SACK` | Sack | One empty woven sack with tying cord | 1 sp | 0.25 | core | Retained |
| `DT_ITEM_GS_CHEST` | Chest | One empty wooden chest with hasp, without a lock | 5 gp | 18 | variable | Retained |
| `DT_ITEM_GS_LOCKBOX` | Lockbox | One empty fitted lockbox with one matching key | 12 gp | 4 | special-order | Retained |
| `DT_ITEM_GS_BARREL` | Barrel | One empty forty-gallon barrel with head and bung | 2 gp | 35 | variable | Retained |
| `DT_ITEM_GS_CRATE` | Crate | One empty wooden crate with loose lid | 6 sp | 6 | variable | Retained |
| `DT_ITEM_GS_BASKET` | Basket | One empty open wicker basket | 4 sp | 1 | core | Retained |
| `DT_ITEM_GS_BOTTLE` | Bottle | One empty one-quart glass bottle with cork | 2 sp | 0.75 | core | Retained |
| `DT_ITEM_GS_FLASK` | Flask | One empty one-pint clay flask with stopper | 8 cp | 0.25 | core | Retained |
| `DT_ITEM_GS_WATERSKIN` | Waterskin | One empty two-quart waterskin with stopper and cord | 5 sp | 0.5 | core | Retained |
| `DT_ITEM_GS_JUG_CLAY` | Clay Jug | One empty one-gallon open clay jug | 3 cp | 2 | core | Retained |
| `DT_ITEM_GS_JAR_CERAMIC` | Ceramic Jar | One empty one-quart ceramic jar with lid | 6 cp | 0.5 | core | Retained |

### Lighting & Fire

Source: [fire-lighting.json](../data/items/general-store/fire-lighting.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_TORCH` | Torch | one torch | 2 cp | 0.5 | core | Retained |
| `DT_ITEM_GS_CANDLE` | Candle | one small mixed-wax candle | 1 cp | 0.05 | core | Retained |
| `DT_ITEM_GS_CANDLE_BEESWAX` | Beeswax Candle | one long beeswax candle | 6 cp | 0.2 | variable | Retained |
| `DT_ITEM_GS_CANDLE_TALLOW` | Tallow Candle | one thick tallow candle | 2 cp | 0.1 | core | Retained |
| `DT_ITEM_GS_LANTERN` | Lantern | one empty candle lantern | 7 sp | 0.75 | variable | Retained |
| `DT_ITEM_GS_LANTERN_HOODED` | Hooded Lantern | one empty hooded oil lantern | 6 gp | 1.5 | variable | Retained |
| `DT_ITEM_GS_LANTERN_BULLSEYE` | Bullseye Lantern | one empty bullseye oil lantern | 12 gp | 2 | special-order | Retained |
| `DT_ITEM_GS_LAMP` | Lamp | one empty oil lamp | 4 sp | 0.5 | core | Retained |
| `DT_ITEM_GS_OIL_LAMP` | Lamp Oil | one stoppered flask containing 1 pint of oil | 2 sp | 1 | core | Retained |
| `DT_ITEM_GS_TINDERBOX` | Tinderbox | one complete tinderbox | 4 sp | 0.25 | core | Retained |
| `DT_ITEM_GS_FLINT_STEEL` | Flint & Steel | one flint and one striking steel | 8 cp | 0.1 | core | Retained |
| `DT_ITEM_GS_CHARCOAL` | Charcoal | one 5 lb bag of charcoal | 8 cp | 5 | core | Retained |
| `DT_ITEM_GS_KINDLING` | Kindling | One tied one-pound bundle of dry split kindling | 2 cp | 1 | core | New |
| `DT_ITEM_GS_WICK_LAMP` | Lamp Wick | One yard of woven cotton lamp wick | 3 cp | 0.02 | core | New |
| `DT_ITEM_GS_CANDLE_HOLDER` | Candle Holder | One iron candle holder with drip tray | 8 cp | 0.4 | core | New |
| `DT_ITEM_GS_CANDLE_SNUFFER` | Candle Snuffer | One brass bell snuffer on a short handle | 2 sp | 0.15 | variable | New |
| `DT_ITEM_GS_FIREWOOD` | Firewood | One tied ten-pound bundle of seasoned firewood | 5 cp | 10 | core | New |

### Rope & Climbing

Source: [rope-climbing.json](../data/items/general-store/rope-climbing.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_ROPE_HEMP` | Hempen Rope | one 50-foot coil | 7 sp | 5 | core | Retained |
| `DT_ITEM_GS_ROPE_SILK` | Silk Rope | one 50-foot coil | 8 gp | 2.5 | special-order | Retained |
| `DT_ITEM_GS_TWINE` | Twine | one 100-foot ball of twine | 5 cp | 0.1 | core | Retained |
| `DT_ITEM_GS_GRAPPLING_HOOK` | Grappling Hook | one grappling hook | 2 gp | 2 | variable | Retained |
| `DT_ITEM_GS_PITONS` | Pitons | one bundle of 10 pitons | 5 sp | 2 | variable | Retained |
| `DT_ITEM_GS_CLIMBERS_KIT` | Climber's Kit | one complete climber's kit | 18 gp | 5 | special-order | Retained |
| `DT_ITEM_GS_BLOCK_TACKLE` | Block and Tackle | One pair of pulley blocks with thirty feet of lifting rope | 8 sp | 3 | variable | New |
| `DT_ITEM_GS_CHAIN` | Chain | One ten-foot length of iron chain | 3 gp | 5 | variable | New |
| `DT_ITEM_GS_LADDER_ROPE` | Rope Ladder | One twenty-foot rope ladder with wooden rungs | 4 gp | 6 | variable | New |
| `DT_ITEM_GS_PIN_BELAYING` | Belaying Pin | One twelve-inch hardwood belaying pin | 4 cp | 0.3 | variable | New |

### Camping

Source: [camping.json](../data/items/general-store/camping.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_BLANKET` | Blanket | One wool blanket | 4 sp | 2 | variable | Retained |
| `DT_ITEM_GS_BEDROLL` | Bedroll | One complete single-person bedroll | 8 sp | 3 | core | Retained |
| `DT_ITEM_GS_TENT` | Tent | One two-person tent with poles, pegs and guy lines | 3 gp | 8 | variable | Retained |
| `DT_ITEM_GS_BEDROLL_STRAP` | Bedroll Strap | One buckled leather strap | 4 cp | 0.1 | core | Retained |
| `DT_ITEM_GS_MESS_KIT` | Mess Kit | One nesting pan, plate, cup and spoon set | 3 sp | 0.5 | core | Retained |
| `DT_ITEM_GS_POT_COOKING` | Cooking Pot | One empty two-quart iron pot with lid | 7 sp | 3 | core | Retained |
| `DT_ITEM_GS_KETTLE_CAMP` | Camp Kettle | One empty two-quart metal kettle with lid | 9 sp | 1.5 | variable | Retained |
| `DT_ITEM_GS_CUP` | Cup | One empty one-pint wooden cup | 2 cp | 0.15 | core | Retained |
| `DT_ITEM_GS_BOWL` | Bowl | One empty one-pint wooden bowl | 3 cp | 0.25 | core | Retained |
| `DT_ITEM_GS_SPOON` | Spoon | One wooden eating spoon | 1 cp | 0.02 | core | Retained |
| `DT_ITEM_GS_PLATE_WOOD` | Wooden Plate | One wooden dinner plate | 2 cp | 0.25 | core | Retained |
| `DT_ITEM_GS_GROUNDSHEET` | Groundsheet | One waxed canvas groundsheet, six by three feet | 6 sp | 1.5 | core | New |
| `DT_ITEM_GS_TARPAULIN` | Tarpaulin | One oiled canvas sheet, ten by eight feet | 2 gp | 4 | variable | New |
| `DT_ITEM_GS_HAMMOCK` | Hammock | One canvas hammock with two ten-foot suspension cords | 9 sp | 2 | variable | New |
| `DT_ITEM_GS_PEGS_TENT` | Tent Pegs | One set of six hardwood tent pegs | 5 cp | 0.6 | core | New |
| `DT_ITEM_GS_TRIPOD_COOKING` | Cooking Tripod | One folding iron tripod with hanging chain and hook | 2 gp | 4 | variable | New |
| `DT_ITEM_GS_SKILLET` | Skillet | One empty eight-inch iron skillet | 6 sp | 2 | core | New |
| `DT_ITEM_GS_LADLE` | Ladle | One carved wooden serving ladle | 3 cp | 0.1 | core | New |
| `DT_ITEM_GS_BOARD_CHOPPING` | Chopping Board | One hardwood chopping board, twelve by eight inches | 8 cp | 1 | variable | New |
| `DT_ITEM_GS_RATIONS_TRAVEL` | Travel Rations | One day's dry rations for one Medium traveller | 3 sp | 2 | core | New |
| `DT_ITEM_GS_TACKLE_FISHING` | Fishing Tackle | One rod, line, hooks, floats, sinkers, lures and landing net | 8 sp | 2.5 | variable | New |

### Writing

Source: [writing.json](../data/items/general-store/writing.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_PARCHMENT` | Parchment | One sheet, approximately 8 by 12 inches | 8 cp | 0.02 | variable | Retained |
| `DT_ITEM_GS_PAPER` | Paper | One sheet, approximately 8 by 12 inches | 4 cp | 0.01 | core | Retained |
| `DT_ITEM_GS_INK` | Ink | One stoppered bottle containing 1 US fluid ounce of ink | 2 sp | 0.1 | variable | Retained |
| `DT_ITEM_GS_INK_PEN` | Ink Pen | One cut quill pen | 2 cp | 0.01 | core | Retained |
| `DT_ITEM_GS_CHALK` | Chalk | One stick of white chalk | 1 cp | 0.02 | core | Retained |
| `DT_ITEM_GS_WAX` | Wax | One small bar of sealing wax | 4 cp | 0.05 | core | Retained |
| `DT_ITEM_GS_SEALING_STAMP` | Sealing Stamp | One brass-faced stamp with a simple geometric mark | 7 sp | 0.2 | variable | Retained |
| `DT_ITEM_GS_BOOK_BLANK` | Blank Book | One bound book containing forty blank paper leaves | 3 gp | 1.25 | variable | New |
| `DT_ITEM_GS_LEDGER` | Ledger | One ruled account book containing twenty paper leaves | 2 gp | 0.75 | variable | New |
| `DT_ITEM_GS_TABLET_WAX` | Wax Tablet | One folding wax tablet with wooden stylus | 5 sp | 0.5 | core | New |
| `DT_ITEM_GS_SLATE` | Slate | One framed writing slate with one chalk stick | 4 sp | 1 | variable | New |
| `DT_ITEM_GS_SAND_BLOTTING` | Blotting Sand | One quarter-pound packet of fine dry blotting sand | 2 cp | 0.25 | core | New |
| `DT_ITEM_GS_CASE_DOCUMENT` | Document Case | One empty leather tube for rolled documents | 7 sp | 0.5 | variable | New |

### Household

Source: [household.json](../data/items/general-store/household.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_SOAP` | Soap | One bar of plain soap | 4 cp | 0.25 | core | Retained |
| `DT_ITEM_GS_NEEDLE` | Needle | One steel sewing needle | 1 cp | 0.002 | core | Retained |
| `DT_ITEM_GS_THREAD` | Thread | One spool holding 50 feet of linen thread | 2 cp | 0.02 | core | Retained |
| `DT_ITEM_GS_SEWING_KIT` | Sewing Kit | One domestic mending kit | 2 sp | 0.15 | core | Retained |
| `DT_ITEM_GS_BROOM` | Broom | One straw broom | 5 cp | 1.5 | core | Retained |
| `DT_ITEM_GS_MOP` | Mop | One wooden-handled cloth mop | 8 cp | 1.25 | core | Retained |
| `DT_ITEM_GS_BUCKET_WASH` | Wash Bucket | One empty three-gallon bucket | 3 sp | 1.5 | core | Retained |
| `DT_ITEM_GS_BOARD_WASH` | Wash Board | One ribbed wooden wash board | 2 sp | 2 | variable | Retained |
| `DT_ITEM_GS_CLOTHES_LINE` | Clothes Line | One 50-foot length of laundry cord | 8 cp | 1 | core | Retained |
| `DT_ITEM_GS_RAGS_CLOTH` | Cloth Rags | One tied bundle of six clean cloth rags | 3 cp | 0.25 | core | New |
| `DT_ITEM_GS_TOWEL_HAND` | Hand Towel | One linen hand towel, two by one foot | 7 cp | 0.2 | core | New |
| `DT_ITEM_GS_PEGS_CLOTHES` | Clothes Pegs | One set of twelve split wooden clothes pegs | 2 cp | 0.15 | core | New |
| `DT_ITEM_GS_BUTTONS_WOOD` | Wooden Buttons | One packet of twelve plain wooden buttons | 3 cp | 0.03 | core | New |
| `DT_ITEM_GS_THIMBLE` | Thimble | One brass sewing thimble | 3 cp | 0.02 | core | New |
| `DT_ITEM_GS_COMB` | Comb | One bone hair comb | 4 cp | 0.05 | core | New |
| `DT_ITEM_GS_HINGES_DOOR` | Door Hinges | One pair of small iron strap hinges with twelve nails | 4 sp | 1 | variable | New |
| `DT_ITEM_GS_PADLOCK` | Padlock | One ordinary iron padlock with one key | 4 gp | 0.5 | variable | New |
| `DT_ITEM_GS_MORTAR_PESTLE` | Mortar and Pestle | One small stone mortar with matching pestle | 5 sp | 2 | variable | New |

### Animal Supplies

Source: [animal.json](../data/items/general-store/animal.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_FEED_HORSE` | Horse Feed | One day's ten-pound ration of dry animal feed | 8 cp | 10 | core | Retained |
| `DT_ITEM_GS_BAG_FEED` | Feed Bag | One empty canvas feed bag | 2 sp | 0.5 | core | Retained |
| `DT_ITEM_GS_BRUSH` | Brush | One stiff-bristled grooming brush | 3 cp | 0.1 | core | Retained |
| `DT_ITEM_GS_CURRY_COMB` | Curry Comb | One metal curry comb | 4 cp | 0.2 | core | Retained |
| `DT_ITEM_GS_HORSESHOES` | Horseshoes | One set of four iron horseshoes with fitting nails | 8 sp | 2 | core | Retained |
| `DT_ITEM_GS_TACK_REPAIR_KIT` | Tack Repair Kit | One compact tack-mending kit | 5 sp | 0.75 | variable | Retained |
| `DT_ITEM_GS_HALTER` | Halter | One adjustable leather halter for a horse or mule | 5 sp | 0.75 | core | New |
| `DT_ITEM_GS_ROPE_LEAD` | Lead Rope | One ten-foot hemp lead with attachment loop | 2 sp | 0.75 | core | New |
| `DT_ITEM_GS_BLANKET_SADDLE` | Saddle Blanket | One thick saddle pad for a horse or mule | 7 sp | 2.5 | variable | New |
| `DT_ITEM_GS_HOBBLES_HORSE` | Horse Hobbles | One pair of padded leather hobbles | 4 sp | 0.4 | variable | New |
| `DT_ITEM_GS_LINE_PICKET` | Picket Line | One thirty-foot hemp line with two iron stakes | 7 sp | 4 | variable | New |
| `DT_ITEM_GS_SADDLEBAGS` | Saddlebags | One empty matched pair of leather saddlebags | 3 gp | 3 | variable | New |

### Travel

Source: [travel.json](../data/items/general-store/travel.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_WALKING_STICK` | Walking Stick | One five-foot wooden walking stick | 3 cp | 1 | core | Retained |
| `DT_ITEM_GS_COMPASS` | Compass | One pocket magnetic compass in a brass case | 25 gp | 0.1 | special-order | Retained |
| `DT_ITEM_GS_SPYGLASS` | Spyglass | One collapsible brass spyglass | 100 gp | 0.75 | special-order | Retained |
| `DT_ITEM_GS_BELL` | Bell | One small brass hand bell | 1 sp | 0.1 | core | Retained |
| `DT_ITEM_GS_WHISTLE_SIGNAL` | Signal Whistle | One wooden signal whistle | 6 cp | 0.02 | core | Retained |
| `DT_ITEM_GS_MIRROR_STEEL` | Steel Mirror | One polished steel hand mirror with cloth sleeve | 2 sp | 0.2 | variable | New |
| `DT_ITEM_GS_HOURGLASS` | Hourglass | One protected one-hour sand timer | 6 gp | 0.5 | special-order | New |
| `DT_ITEM_GS_MAP_ROAD` | Road Map | One paper route map for a named local district | 4 sp | 0.02 | variable | New |
| `DT_ITEM_GS_WRAP_DOCUMENT_WATERPROOF` | Waterproof Document Wrap | One waxed cloth wrap for folded documents | 2 sp | 0.1 | variable | New |
| `DT_ITEM_GS_CLOAK_TRAVEL` | Travel Cloak | One hooded wool travel cloak sized for one Medium wearer | 9 sp | 2 | core | New |
| `DT_ITEM_GS_COVER_PACK` | Pack Cover | One draw-cord oiled canvas cover for a backpack | 3 sp | 0.35 | core | New |
| `DT_ITEM_GS_PATCHES_REPAIR` | Canvas Repair Patches | One packet of four waxed canvas patches, six inches square | 6 cp | 0.15 | core | New |
| `DT_ITEM_GS_RIBBON_MARKING` | Marking Ribbon | One ten-yard roll of plain coloured cloth ribbon | 5 cp | 0.05 | core | New |

### Tools

Source: [tools.json](../data/items/general-store/tools.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_HAMMER` | Hammer | One small steel claw hammer | 5 sp | 1.5 | core | New |
| `DT_ITEM_GS_CROWBAR` | Crowbar | One two-foot iron crowbar | 8 sp | 3 | variable | New |
| `DT_ITEM_GS_SAW_HAND` | Hand Saw | One steel hand saw with wooden grip | 2 gp | 1.25 | variable | New |
| `DT_ITEM_GS_CHISEL` | Chisel | One woodcutting chisel with edge cover | 4 sp | 0.3 | variable | New |
| `DT_ITEM_GS_MALLET_WOOD` | Wooden Mallet | One hardwood mallet | 2 sp | 1 | core | New |
| `DT_ITEM_GS_SHOVEL` | Shovel | One iron-bladed shovel with wooden shaft | 7 sp | 3 | core | New |
| `DT_ITEM_GS_PICK_MINER` | Miner's Pick | One pointed steel mining pick | 2 gp | 5 | variable | New |
| `DT_ITEM_GS_HAMMER_SLEDGE` | Sledgehammer | One two-handed steel sledgehammer | 2 gp | 7 | variable | New |
| `DT_ITEM_GS_WHETSTONE` | Whetstone | One palm-sized sharpening stone | 3 cp | 0.5 | core | New |
| `DT_ITEM_GS_NAILS_IRON` | Iron Nails | One packet of twenty two-inch iron nails | 4 cp | 0.25 | core | New |
| `DT_ITEM_GS_SPIKES_IRON` | Iron Spikes | One bundle of four eight-inch iron spikes | 3 sp | 2 | variable | New |
| `DT_ITEM_GS_CORD_MEASURING` | Measuring Cord | One fifty-foot knotted measuring cord | 1 sp | 0.15 | core | New |
| `DT_ITEM_GS_RULE_WOOD` | Wooden Rule | One two-foot hardwood measuring rule | 5 cp | 0.1 | variable | New |
| `DT_ITEM_GS_WRAP_TOOL` | Tool Wrap | One empty canvas tool wrap with tie cords | 3 sp | 0.3 | core | New |
| `DT_ITEM_GS_WEDGES_WOOD` | Wooden Wedges | One set of six hardwood wedges | 3 cp | 0.3 | core | New |
| `DT_ITEM_GS_SCALE_MERCHANT` | Merchant's Scale | One balance with pans and weights up to two pounds | 4 gp | 2 | variable | New |

### Trade Goods

Source: [trade-goods.json](../data/items/general-store/trade-goods.json).

| Permanent ID | Name | Sale unit | Price | lb | Availability | Batch |
| --- | --- | --- | ---: | ---: | --- | --- |
| `DT_ITEM_GS_LINEN` | Linen | One square yard of plain undyed linen | 4 cp | 0.3 | core | New |
| `DT_ITEM_GS_CANVAS` | Canvas | One square yard of untreated heavy canvas | 6 cp | 0.6 | core | New |
| `DT_ITEM_GS_CLOTH_WOOL` | Wool Cloth | One square yard of woven wool cloth | 8 cp | 0.5 | variable | New |
| `DT_ITEM_GS_LEATHER` | Leather | One square foot of plain tanned leather | 6 cp | 0.25 | core | New |
| `DT_ITEM_GS_BAR_IRON` | Iron Bar | One one-pound bar of ordinary wrought iron | 1 sp | 1 | variable | New |
| `DT_ITEM_GS_BAR_COPPER` | Copper Bar | One one-pound bar of ordinary copper | 5 sp | 1 | variable | New |
| `DT_ITEM_GS_SALT` | Salt | One one-pound paper packet of coarse salt | 4 cp | 1 | core | New |
| `DT_ITEM_GS_BEESWAX` | Beeswax | One one-pound block of plain beeswax | 2 sp | 1 | variable | New |
| `DT_ITEM_GS_PITCH` | Pitch | One half-pound wrapped block of wood pitch | 8 cp | 0.5 | variable | New |
| `DT_ITEM_GS_DYE_CLOTH` | Cloth Dye | One two-ounce packet of ordinary textile dye | 2 sp | 0.125 | variable | New |
| `DT_ITEM_GS_CLOTH_SILK` | Silk Cloth | One square yard of plain woven silk | 8 gp | 0.15 | special-order | New |

