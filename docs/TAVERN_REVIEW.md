# Sprint 8 — Tavern catalogue and merchant presentation

> Deferred historical candidate: Sprint 8 was revised to the catalogue framework. The material below
> describes alpha.1, not the active alpha.2 build. Preserve its IDs and await framework review.

**Candidate:** `0.3.0-alpha.1` · **Date:** 27 September 2026.  
**Targets:** Foundry V14, D&D5e 5.3.3, 2014 mechanics, adjusted pounds for Variant Encumbrance.

## Delivered scope

The Tavern contains **183 canonical goods**: **152 new menu products** across the 19 requested
categories plus **31 shared General Store supplies**. The complete source catalogue now has
**296 Items**. All 144 General Store records remain unchanged. No separate copies of Horse Feed,
Bottle, Cup or other shared goods were created. Alchemist, Blacksmith and Black Market remain
partial shared catalogues.

The owner reported that alpha.25's Sprint 7 features work in their live setup. This is user-reported
acceptance of that build, not a claim that every detailed concurrency or Forge test was observed.
The portrait and Tavern additions in this candidate still require live acceptance.

## Merchant identity header

A compact **72 × 72 pixel** portrait sits beside the exact name of the clicked scene token and
its availability. The image comes automatically from the linked Merchant Actor's `img` field,
not its token texture. Missing/blank portraits and failed image loads use Foundry's generic
`icons/svg/mystery-man.svg` silhouette. No new portrait setting or ownership permission is added.

The GM sends only the portrait URL and availability. Player clients never open or read the
private merchant Actor to populate this header. An Actor portrait/status update is projected to
open shops through the existing module channel, and a native `updateToken` hook reflects token
renames. Closing a shop removes its subscription and hook. Private memory updates do not trigger
portrait broadcasts. The handler follows Foundry's native
[post-update hook contract](https://foundryvtt.com/api/functions/hookEvents.updateDocument.html).

Token naming remains Foundry-native: if an Actor rename leaves an existing scene token's name
unchanged, the shop deliberately keeps that token's name. Rename the scene token to change its
in-game identity. The flexible header context row leaves space for future badges or greetings;
none are implemented. Merchant type is optional and omitted instead of adding another field.

## Catalogue structure and decisions

Each requested category has eight new, distinct products. Category files live under
`data/items/tavern/` and are registered in `data/catalogue.json`; `data/categories.json` defines
their navigation. Seven existing shared-supply categories remain available as well. Every new
record has a reserved permanent `DT_ITEM_TAV_*` ID, original description, sale unit, positive
price/weight, documented weight rationale, existing core icon, useful tags, Tavern assignment,
availability, provenance and supported native mechanics.

Ale and Beer are menu divisions, not a claim that ales are biologically separate from beer.
The beer section emphasises hopped and cool-cellared drinks; the ale section emphasises malt,
herbal and cask variants. Mead and fruit wines have distinct ingredients and portions. There are
no renamed rarity copies of identical meals and no faction-specific campaign lore.

Meals are recipes and portions, not automatic lifestyle, lodging or nutritional accounting.
Breakfast/lunch/dinner are individual plates; stews are bowl portions and roasts are carved
portions, not whole animals. Luxury meals use ingredients or preparation that justify a higher
price. The Celebration Supper is one three-course meal for one diner, never an entire party feast.

## Price, portion and weight rules

Most drinks, bread and snacks cost copper; substantial meals and specialty drinks use silver.
The rare fine meals reach 1–3 gp. Each price is a complete sale-unit price, not a per-pound price
unless the purchase itself is a measured pound. These are project prices, not copied 2014 prices.

| Purchase | Standard unit | Typical weight treatment |
| --- | --- | --- |
| Ale, beer, non-alcoholic drinks | One US pint | 1 lb contents only |
| Mead | One half-pint | 0.5 lb contents only |
| Wine | One quarter-pint | 0.25 lb contents only |
| Spirits | One fluid ounce | 0.06 lb contents, rounded from the project liquid allowance |
| Hot drinks | One half-pint cup serving | 0.5 lb contents only |
| Stews | One bowl portion | 1 lb food; bowl excluded |
| Cheese | One quarter-pound portion | 0.25 lb including negligible wrapping |
| Plated meals and roasts | Explicit individual portion | Food including bones/scraps where stated; serving ware excluded |
| Packed provisions | Explicit counted/measured packet | Food plus light wrapping; no reusable containers or water |
| Animal feed | Explicit measured portion | Full physical feed load; no generic percentage weight reduction |

The inn retains its cups, bowls, plates and cutlery. Carrying a drink away requires an existing
suitable container whose weight counts separately. Buying food does not create an empty mug as
an extra Item. There are no deposits, vessel refunds or automatic container-filling mechanics.
Dry soup mix requires additional water, heat and cookware. Travel meals are one meal unless
stated otherwise; they do not replace the existing complete-day Travel Rations identity.
The canonical ten-pound Horse Feed remains available alongside supplemental oats, hay and treats.

## Mundane consumption

All new entries use the existing native D&D5e `consumable` / `food` converter. Their utility
action records consumption of **one whole sale unit**, has no roll, and uses the owning Item
rather than a stale compendium reference. There are no healing effects, intoxication conditions,
rest bonuses or hunger/thirst automation. The GM adjudicates diet, alcohol and spoilage.
Partial servings and remaining packaging are manual bookkeeping; consuming a three-course meal
means consuming the complete purchased meal once, not consuming an Item for each course.

## Stock profile

The existing `DT_TABLE_TAV` Village Tavern profile now has complete authored coverage. It still
uses **four tables**; the module total remains **32**. All table IDs and Item UUID conventions
remain unchanged. Categories filter the existing pools instead of multiplying table count.

| Tier | Eligible goods | Selection |
| --- | ---: | --- |
| Always | 8 | Small Ale, House Hopped Beer, Drinking Water, Oat Porridge, Vegetable Pottage, Rye Bread, Farmhouse Cheese, shared Horse Feed |
| Often | 153 | Rotating ordinary dishes, drinks and 30 shared supplies |
| Rarely | 22 | Fine meals, special cellar drinks and uncommon imports/game |

A whole-shop roll includes the eight essentials and makes 16 rotating attempts (80% Often,
15% Rarely, 5% no extra stock). Category rolls use three attempts. The GM sees a small daily
assortment rather than all 183 goods at once. Existing weighted quantities continue to count
servings, packets and portions; cheap common food tends to have more stock. A rare result normally
has one serving under the current quantity policy. The GM can adjust this for a banquet.

The Tavern overrides shared tools and vessels to Often without changing their canonical
availability in other stores. Merchant Notes describe dependable, rotating and rare stock and
remain builder-only. Seasonal/imported tags are guidance, not calendar or trade-route automation.
Existing merchant inventories are not replaced or automatically restocked by this update.

## Icons and provenance

No new artwork is created or copied into the module. Shared core icons identify drink vessels,
prepared servings, bread, cheese, meat, fruit and feed. They communicate broad food types rather
than illustrating every recipe ingredient. Paths are recorded in
`tests/fixtures/core-icon-references.json`; additional references come from the official D&D5e
5.3.3 icon-migration map and upstream system source. Core files retain their supplied format and
dimensions under the existing icon-policy exception. Resolution and appearance still need a
live target-installation check. New module-owned artwork requirements remain 256×256 WebP.

All descriptions and recipes are original project writing. No published menu, setting-specific
brand or official rules passage is reproduced. Distribution licensing remains the existing
public-release gate; this sprint does not invent a licence grant.

## Upgrade and acceptance

1. Back up the world, install this ZIP, restart the server and reconnect the GM and players.
2. Open the Item builder. **All shops / All categories** should preview 152 creates, zero
   updates and 144 unchanged against a complete alpha.25 pack. Build, then rerun: 296 unchanged.
   A fresh pack creates 296. Tavern-only selection has 183 entries, including the 31 shared IDs.
3. Build Stock RollTables. Against alpha.25 expect zero creates, four Tavern updates and 28
   unchanged tables. Repeat: 32 unchanged. A fresh table pack creates 32.
4. Enable a linked Tavern NPC. Roll a stock preview with Village Tavern and add it after review.
   Existing inventory is preserved; this is starting-stock addition, not restocking automation.
5. As a player with no merchant Actor ownership, open the shop. Verify portrait, exact token
   name, fallback silhouette and status. Change the Actor portrait and scene token name as GM
   while the player window stays open. Verify immediate display updates without losing a basket.
6. Build/roll each menu category, inspect descriptions and all reused icons, buy a drink and a
   meal, and consume complete units. Verify prices, weight, no bonus effects and no free vessel.
   Recheck negotiation, theft, revised-offer consent and transaction recovery from Sprint 7.

Automated validation checks all 296 Items, unique IDs/names, required fields, icons against the
reviewed references, stock policy and 32 table conversions. Upgrade tests assert source
preservation, no duplicate shared goods and unchanged repeated builds. Player header tests use
an inaccessible Actor double, exact token-name precedence, live presentation delivery and cleanup.
The build simulations are not a claim that compendiums were built inside a live Foundry world.

## Complete new menu review

Each row is one sale unit. `core` means Always; `variable` means Often; `special-order` means Rarely.
The source JSON contains full descriptions, tags, icon paths and weight notes.

### Ale

Locally brewed ales, from light table drinks to strong cellar pours.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_SMALL_ALE` | Small Ale | One pint of ale | 2 cp | 1 | core |
| `DT_ITEM_TAV_BROWN_HEARTH_ALE` | Brown Hearth Ale | One pint of ale | 4 cp | 1 | variable |
| `DT_ITEM_TAV_OAT_ALE` | Oat Ale | One pint of ale | 5 cp | 1 | variable |
| `DT_ITEM_TAV_HEATHER_ALE` | Heather Ale | One pint of ale | 7 cp | 1 | variable |
| `DT_ITEM_TAV_SMOKED_MALT_ALE` | Smoked Malt Ale | One pint of ale | 8 cp | 1 | variable |
| `DT_ITEM_TAV_HARVEST_ALE` | Harvest Ale | One pint of ale | 1 sp | 1 | variable |
| `DT_ITEM_TAV_STRONG_CELLAR_ALE` | Strong Cellar Ale | One pint of ale | 2 sp | 1 | variable |
| `DT_ITEM_TAV_OLD_OAK_ALE` | Old Oak Ale | One pint of ale | 3 sp | 1 | special-order |

### Beer

Hopped and cool-fermented beers, separated from the ale menu for browsing.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_HOUSE_HOPPED_BEER` | House Hopped Beer | One pint of beer | 4 cp | 1 | core |
| `DT_ITEM_TAV_PALE_BITTER_BEER` | Pale Bitter Beer | One pint of beer | 6 cp | 1 | variable |
| `DT_ITEM_TAV_DARK_RYE_BEER` | Dark Rye Beer | One pint of beer | 7 cp | 1 | variable |
| `DT_ITEM_TAV_CLOUDY_WHEAT_BEER` | Cloudy Wheat Beer | One pint of beer | 8 cp | 1 | variable |
| `DT_ITEM_TAV_COOL_CELLAR_BEER` | Cool Cellar Beer | One pint of beer | 1 sp | 1 | variable |
| `DT_ITEM_TAV_RED_MALT_BEER` | Red Malt Beer | One pint of beer | 8 cp | 1 | variable |
| `DT_ITEM_TAV_JUNIPER_BEER` | Juniper Beer | One pint of beer | 1 sp | 1 | variable |
| `DT_ITEM_TAV_DOUBLE_MALT_BEER` | Double Malt Beer | One pint of beer | 2 sp | 1 | special-order |

### Mead

Honey wines served by the half-pint; fruit and herb variants share the same unit.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_HOUSE_HONEY_MEAD` | House Honey Mead | One half-pint of mead | 1 sp | 0.5 | variable |
| `DT_ITEM_TAV_DRY_MEADOW_MEAD` | Dry Meadow Mead | One half-pint of mead | 1 sp | 0.5 | variable |
| `DT_ITEM_TAV_HEATHER_HONEY_MEAD` | Heather Honey Mead | One half-pint of mead | 2 sp | 0.5 | variable |
| `DT_ITEM_TAV_APPLE_MEAD` | Apple Mead | One half-pint of mead | 2 sp | 0.5 | variable |
| `DT_ITEM_TAV_BLACKBERRY_MEAD` | Blackberry Mead | One half-pint of mead | 3 sp | 0.5 | variable |
| `DT_ITEM_TAV_SPICED_WINTER_MEAD` | Spiced Winter Mead | One half-pint of mead | 3 sp | 0.5 | variable |
| `DT_ITEM_TAV_OAK_AGED_MEAD` | Oak-Aged Mead | One half-pint of mead | 5 sp | 0.5 | special-order |
| `DT_ITEM_TAV_ROSE_PETAL_MEAD` | Rose Petal Mead | One half-pint of mead | 4 sp | 0.5 | special-order |

### Wine

Table wines and scarce cellar wines by the quarter-pint.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_HOUSE_RED_WINE` | House Red Wine | One quarter-pint of wine | 8 cp | 0.25 | variable |
| `DT_ITEM_TAV_HOUSE_WHITE_WINE` | House White Wine | One quarter-pint of wine | 8 cp | 0.25 | variable |
| `DT_ITEM_TAV_ROSY_TABLE_WINE` | Rosy Table Wine | One quarter-pint of wine | 1 sp | 0.25 | variable |
| `DT_ITEM_TAV_SWEET_RED_WINE` | Sweet Red Wine | One quarter-pint of wine | 2 sp | 0.25 | variable |
| `DT_ITEM_TAV_ORCHARD_PEAR_WINE` | Orchard Pear Wine | One quarter-pint of wine | 1 sp | 0.25 | variable |
| `DT_ITEM_TAV_BLACKCURRANT_WINE` | Blackcurrant Wine | One quarter-pint of wine | 2 sp | 0.25 | variable |
| `DT_ITEM_TAV_MULLED_RED_WINE` | Mulled Red Wine | One quarter-pint of wine | 3 sp | 0.25 | variable |
| `DT_ITEM_TAV_RESERVE_VINEYARD_WINE` | Reserve Vineyard Wine | One quarter-pint of wine | 1 gp | 0.25 | special-order |

### Spirits

Distilled drinks sold by a one-fluid-ounce measure, not a bottle.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_GRAIN_SPIRIT` | Grain Spirit | One 1 fl oz measure of spirit | 1 sp | 0.06 | variable |
| `DT_ITEM_TAV_APPLE_BRANDY` | Apple Brandy | One 1 fl oz measure of spirit | 2 sp | 0.06 | variable |
| `DT_ITEM_TAV_PEAR_BRANDY` | Pear Brandy | One 1 fl oz measure of spirit | 3 sp | 0.06 | variable |
| `DT_ITEM_TAV_PLUM_SPIRIT` | Plum Spirit | One 1 fl oz measure of spirit | 2 sp | 0.06 | variable |
| `DT_ITEM_TAV_JUNIPER_SPIRIT` | Juniper Spirit | One 1 fl oz measure of spirit | 2 sp | 0.06 | variable |
| `DT_ITEM_TAV_DARK_CANE_SPIRIT` | Dark Cane Spirit | One 1 fl oz measure of spirit | 4 sp | 0.06 | special-order |
| `DT_ITEM_TAV_SPICED_HONEY_LIQUEUR` | Spiced Honey Liqueur | One 1 fl oz measure of spirit | 3 sp | 0.06 | variable |
| `DT_ITEM_TAV_CASK_AGED_GRAIN_SPIRIT` | Cask-Aged Grain Spirit | One 1 fl oz measure of spirit | 8 sp | 0.06 | special-order |

### Non-alcoholic Drinks

Water, milk and unfermented fruit drinks for the table.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_DRINKING_WATER` | Drinking Water | One pint of prepared drink | 1 cp | 1 | core |
| `DT_ITEM_TAV_BARLEY_WATER` | Barley Water | One pint of prepared drink | 2 cp | 1 | variable |
| `DT_ITEM_TAV_FRESH_COW_MILK` | Fresh Cow Milk | One pint of prepared drink | 3 cp | 1 | variable |
| `DT_ITEM_TAV_FRESH_GOAT_MILK` | Fresh Goat Milk | One pint of prepared drink | 4 cp | 1 | variable |
| `DT_ITEM_TAV_PRESSED_APPLE_JUICE` | Pressed Apple Juice | One pint of prepared drink | 4 cp | 1 | variable |
| `DT_ITEM_TAV_PEAR_JUICE` | Pear Juice | One pint of prepared drink | 5 cp | 1 | variable |
| `DT_ITEM_TAV_HONEY_LEMON_WATER` | Honey Lemon Water | One pint of prepared drink | 6 cp | 1 | variable |
| `DT_ITEM_TAV_BLACKBERRY_SHRUB_DRINK` | Blackberry Shrub Drink | One pint of prepared drink | 6 cp | 1 | variable |

### Hot Drinks

Small cups of prepared tea, infusions, coffee and warm milk.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_MINT_INFUSION` | Mint Infusion | One half-pint cup of prepared drink | 3 cp | 0.5 | variable |
| `DT_ITEM_TAV_CHAMOMILE_INFUSION` | Chamomile Infusion | One half-pint cup of prepared drink | 4 cp | 0.5 | variable |
| `DT_ITEM_TAV_ROASTED_BARLEY_DRINK` | Roasted Barley Drink | One half-pint cup of prepared drink | 3 cp | 0.5 | variable |
| `DT_ITEM_TAV_SPICED_WARM_MILK` | Spiced Warm Milk | One half-pint cup of prepared drink | 5 cp | 0.5 | variable |
| `DT_ITEM_TAV_BLACK_LEAF_TEA` | Black Leaf Tea | One half-pint cup of prepared drink | 1 sp | 0.5 | variable |
| `DT_ITEM_TAV_GREEN_LEAF_TEA` | Green Leaf Tea | One half-pint cup of prepared drink | 2 sp | 0.5 | special-order |
| `DT_ITEM_TAV_STRONG_BLACK_COFFEE` | Strong Black Coffee | One half-pint cup of prepared drink | 2 sp | 0.5 | special-order |
| `DT_ITEM_TAV_SPICED_COCOA` | Spiced Cocoa | One half-pint cup of prepared drink | 3 sp | 0.5 | special-order |

### Breakfast

Single morning meals, with accompaniments included only where named.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_OAT_PORRIDGE` | Oat Porridge | One individual breakfast portion | 4 cp | 0.75 | core |
| `DT_ITEM_TAV_HONEY_MILK_PORRIDGE` | Honey Milk Porridge | One individual breakfast portion | 8 cp | 0.8 | variable |
| `DT_ITEM_TAV_FRIED_EGGS_ON_TOAST` | Fried Eggs on Toast | One individual breakfast portion | 1 sp | 0.6 | variable |
| `DT_ITEM_TAV_BACON_AND_EGGS` | Bacon and Eggs | One individual breakfast portion | 2 sp | 0.65 | variable |
| `DT_ITEM_TAV_MUSHROOM_BREAKFAST_TOAST` | Mushroom Breakfast Toast | One individual breakfast portion | 8 cp | 0.55 | variable |
| `DT_ITEM_TAV_CHEESE_AND_ONION_OMELETTE` | Cheese and Onion Omelette | One individual breakfast portion | 1 sp | 0.6 | variable |
| `DT_ITEM_TAV_KIPPER_BREAKFAST` | Kipper Breakfast | One individual breakfast portion | 2 sp | 0.7 | variable |
| `DT_ITEM_TAV_BREAKFAST_SAUSAGE_PLATE` | Breakfast Sausage Plate | One individual breakfast portion | 2 sp | 0.8 | variable |

### Lunch

Quick plates, pies and savoury bakes for the midday table.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_PLOUGHMAN_S_PLATE` | Ploughman's Plate | One individual lunch portion | 1 sp | 0.9 | variable |
| `DT_ITEM_TAV_ONION_AND_CHEESE_PIE` | Onion and Cheese Pie | One individual lunch portion | 1 sp | 0.75 | variable |
| `DT_ITEM_TAV_PORK_HAND_PIE` | Pork Hand Pie | One individual lunch portion | 1 sp | 0.6 | variable |
| `DT_ITEM_TAV_MUSHROOM_HAND_PIE` | Mushroom Hand Pie | One individual lunch portion | 9 cp | 0.6 | variable |
| `DT_ITEM_TAV_LENTIL_AND_HERB_BOWL` | Lentil and Herb Bowl | One individual lunch portion | 7 cp | 0.85 | variable |
| `DT_ITEM_TAV_SMOKED_FISH_PLATE` | Smoked Fish Plate | One individual lunch portion | 2 sp | 0.65 | variable |
| `DT_ITEM_TAV_COLD_HAM_AND_PICKLES` | Cold Ham and Pickles | One individual lunch portion | 2 sp | 0.65 | variable |
| `DT_ITEM_TAV_VEGETABLE_TURNOVER` | Vegetable Turnover | One individual lunch portion | 8 cp | 0.6 | variable |

### Dinner

Complete individual supper plates distinct from the roast and stew pots.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_SAUSAGE_AND_MASH` | Sausage and Mash | One individual supper portion | 2 sp | 1.1 | variable |
| `DT_ITEM_TAV_BRAISED_BEEF_SUPPER` | Braised Beef Supper | One individual supper portion | 3 sp | 1.1 | variable |
| `DT_ITEM_TAV_PAN_FRIED_TROUT_SUPPER` | Pan-Fried Trout Supper | One individual supper portion | 3 sp | 0.9 | variable |
| `DT_ITEM_TAV_CHICKEN_AND_LEEK_SUPPER` | Chicken and Leek Supper | One individual supper portion | 2 sp | 1 | variable |
| `DT_ITEM_TAV_STUFFED_CABBAGE_SUPPER` | Stuffed Cabbage Supper | One individual supper portion | 1 sp | 1 | variable |
| `DT_ITEM_TAV_BAKED_BEAN_SUPPER` | Baked Bean Supper | One individual supper portion | 8 cp | 1 | variable |
| `DT_ITEM_TAV_MUTTON_AND_TURNIP_SUPPER` | Mutton and Turnip Supper | One individual supper portion | 2 sp | 1.1 | variable |
| `DT_ITEM_TAV_EEL_AND_ONION_SUPPER` | Eel and Onion Supper | One individual supper portion | 3 sp | 0.9 | variable |

### Stews

Bowl portions from the inn kitchen; bowls are serving ware, not included goods.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_VEGETABLE_POTTAGE` | Vegetable Pottage | One 1 lb bowl portion of stew | 5 cp | 1 | core |
| `DT_ITEM_TAV_BEEF_AND_BARLEY_STEW` | Beef and Barley Stew | One 1 lb bowl portion of stew | 2 sp | 1 | variable |
| `DT_ITEM_TAV_MUTTON_AND_LEEK_STEW` | Mutton and Leek Stew | One 1 lb bowl portion of stew | 2 sp | 1 | variable |
| `DT_ITEM_TAV_CHICKEN_AND_BEAN_STEW` | Chicken and Bean Stew | One 1 lb bowl portion of stew | 1 sp | 1 | variable |
| `DT_ITEM_TAV_LENTIL_AND_CARROT_STEW` | Lentil and Carrot Stew | One 1 lb bowl portion of stew | 7 cp | 1 | variable |
| `DT_ITEM_TAV_PEA_AND_HAM_STEW` | Pea and Ham Stew | One 1 lb bowl portion of stew | 1 sp | 1 | variable |
| `DT_ITEM_TAV_FISH_CHOWDER` | Fish Chowder | One 1 lb bowl portion of stew | 2 sp | 1 | variable |
| `DT_ITEM_TAV_VENISON_JUNIPER_STEW` | Venison Juniper Stew | One 1 lb bowl portion of stew | 4 sp | 1 | special-order |

### Roasts

Carved roast portions with their stated garnish, not whole animals.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_ROAST_CHICKEN_PORTION` | Roast Chicken Portion | One carved or plated roast portion for one diner | 2 sp | 0.65 | variable |
| `DT_ITEM_TAV_ROAST_PORK_WITH_APPLES` | Roast Pork with Apples | One carved or plated roast portion for one diner | 3 sp | 0.75 | variable |
| `DT_ITEM_TAV_ROAST_BEEF_WITH_ONIONS` | Roast Beef with Onions | One carved or plated roast portion for one diner | 4 sp | 0.75 | variable |
| `DT_ITEM_TAV_ROAST_MUTTON_WITH_HERBS` | Roast Mutton with Herbs | One carved or plated roast portion for one diner | 3 sp | 0.75 | variable |
| `DT_ITEM_TAV_ROAST_DUCK_PORTION` | Roast Duck Portion | One carved or plated roast portion for one diner | 5 sp | 0.65 | variable |
| `DT_ITEM_TAV_ROAST_GOOSE_PORTION` | Roast Goose Portion | One carved or plated roast portion for one diner | 6 sp | 0.75 | special-order |
| `DT_ITEM_TAV_ROAST_RABBIT_PORTION` | Roast Rabbit Portion | One carved or plated roast portion for one diner | 4 sp | 0.65 | variable |
| `DT_ITEM_TAV_ROAST_ROOT_PLATTER` | Roast Root Platter | One carved or plated roast portion for one diner | 9 cp | 0.8 | variable |

### Bread

Loaves and counted bakes, with portions distinct from complete meals.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_RYE_BREAD` | Rye Bread | One 1 lb rye loaf | 4 cp | 1 | core |
| `DT_ITEM_TAV_BARLEY_BREAD` | Barley Bread | One 1 lb barley loaf | 3 cp | 1 | variable |
| `DT_ITEM_TAV_WHITE_WHEAT_LOAF` | White Wheat Loaf | One 1 lb wheat loaf | 8 cp | 1 | variable |
| `DT_ITEM_TAV_OATCAKES` | Oatcakes | Four oatcakes | 3 cp | 0.25 | variable |
| `DT_ITEM_TAV_CARAWAY_ROLLS` | Caraway Rolls | Two caraway rolls | 5 cp | 0.4 | variable |
| `DT_ITEM_TAV_ONION_FLATBREAD` | Onion Flatbread | One onion flatbread | 5 cp | 0.4 | variable |
| `DT_ITEM_TAV_SEEDED_BROWN_LOAF` | Seeded Brown Loaf | One 1 lb seeded loaf | 6 cp | 1 | variable |
| `DT_ITEM_TAV_HONEY_HEARTH_BUNS` | Honey Hearth Buns | Two honey-glazed buns | 7 cp | 0.4 | variable |

### Cheese

Quarter-pound portions, including simple fresh cheeses and rarer aged stock.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_FARMHOUSE_CHEESE` | Farmhouse Cheese | One quarter-pound portion of cheese | 5 cp | 0.25 | core |
| `DT_ITEM_TAV_FRESH_GOAT_CHEESE` | Fresh Goat Cheese | One quarter-pound portion of cheese | 7 cp | 0.25 | variable |
| `DT_ITEM_TAV_AGED_HARD_CHEESE` | Aged Hard Cheese | One quarter-pound portion of cheese | 1 sp | 0.25 | variable |
| `DT_ITEM_TAV_SMOKED_CHEESE` | Smoked Cheese | One quarter-pound portion of cheese | 1 sp | 0.25 | variable |
| `DT_ITEM_TAV_HERBED_CURD_CHEESE` | Herbed Curd Cheese | One quarter-pound portion of cheese | 8 cp | 0.25 | variable |
| `DT_ITEM_TAV_BLUE_VEINED_CHEESE` | Blue-Veined Cheese | One quarter-pound portion of cheese | 2 sp | 0.25 | variable |
| `DT_ITEM_TAV_SOFT_RIND_CHEESE` | Soft Rind Cheese | One quarter-pound portion of cheese | 2 sp | 0.25 | variable |
| `DT_ITEM_TAV_IMPORTED_SHEEP_CHEESE` | Imported Sheep Cheese | One quarter-pound portion of cheese | 4 sp | 0.25 | special-order |

### Desserts

Individual sweet courses; no bonus effects or disguised magical food.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_BAKED_APPLE` | Baked Apple | One individual dessert portion | 6 cp | 0.35 | variable |
| `DT_ITEM_TAV_HONEY_CUSTARD` | Honey Custard | One individual dessert portion | 1 sp | 0.35 | variable |
| `DT_ITEM_TAV_APPLE_PIE_SLICE` | Apple Pie Slice | One individual dessert portion | 1 sp | 0.4 | variable |
| `DT_ITEM_TAV_BERRY_TART` | Berry Tart | One individual dessert portion | 1 sp | 0.3 | variable |
| `DT_ITEM_TAV_BREAD_PUDDING` | Bread Pudding | One individual dessert portion | 8 cp | 0.5 | variable |
| `DT_ITEM_TAV_POACHED_PEAR` | Poached Pear | One individual dessert portion | 1 sp | 0.4 | variable |
| `DT_ITEM_TAV_SPICE_CAKE_SLICE` | Spice Cake Slice | One individual dessert portion | 2 sp | 0.25 | variable |
| `DT_ITEM_TAV_CREAM_AND_PRESERVES` | Cream and Preserves | One individual dessert portion | 2 sp | 0.3 | variable |

### Snacks

Small accompaniments and table nibbles with explicit counts or weights.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_SALTED_NUTS` | Salted Nuts | One 0.15 lb portion of salted nuts | 4 cp | 0.15 | variable |
| `DT_ITEM_TAV_PICKLED_EGGS` | Pickled Eggs | Two pickled eggs | 5 cp | 0.2 | variable |
| `DT_ITEM_TAV_PICKLED_ONIONS` | Pickled Onions | One 0.15 lb portion of pickled onions | 3 cp | 0.15 | variable |
| `DT_ITEM_TAV_DRIED_APPLE_RINGS` | Dried Apple Rings | One 0.15 lb portion of dried apple rings | 4 cp | 0.15 | variable |
| `DT_ITEM_TAV_ROASTED_CHICKPEAS` | Roasted Chickpeas | One 0.15 lb portion of roasted chickpeas | 3 cp | 0.15 | variable |
| `DT_ITEM_TAV_PORK_CRACKLINGS` | Pork Cracklings | One 0.15 lb portion of cracklings | 4 cp | 0.15 | variable |
| `DT_ITEM_TAV_SOFT_PRETZEL` | Soft Pretzel | One soft pretzel | 3 cp | 0.2 | variable |
| `DT_ITEM_TAV_IMPORTED_OLIVES` | Imported Olives | One 0.15 lb portion of olives | 1 sp | 0.15 | special-order |

### Travel Meals

Packed individual meals and provisions; water and reusable vessels remain separate.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_BREAD_AND_CHEESE_BUNDLE` | Bread and Cheese Bundle | One wrapped bread-and-cheese meal | 1 sp | 0.9 | variable |
| `DT_ITEM_TAV_CURED_SAUSAGE_LUNCH` | Cured Sausage Lunch | One wrapped sausage-and-rolls meal | 2 sp | 0.85 | variable |
| `DT_ITEM_TAV_DRIED_FISH_AND_OATCAKE_MEAL` | Dried Fish and Oatcake Meal | One wrapped fish-and-oatcake meal | 1 sp | 0.7 | variable |
| `DT_ITEM_TAV_NUT_AND_FRUIT_MEAL` | Nut and Fruit Meal | One 0.6 lb packet for one meal | 2 sp | 0.6 | variable |
| `DT_ITEM_TAV_LENTIL_TRAVEL_CAKES` | Lentil Travel Cakes | Two lentil cakes for one meal | 8 cp | 0.65 | variable |
| `DT_ITEM_TAV_SMOKED_MEAT_AND_RYE_MEAL` | Smoked Meat and Rye Meal | One wrapped meat-and-rye meal | 2 sp | 0.85 | variable |
| `DT_ITEM_TAV_HARD_BISCUIT_PROVISIONS` | Hard Biscuit Provisions | One 0.75 lb packet of hard biscuits | 7 cp | 0.75 | variable |
| `DT_ITEM_TAV_DRIED_VEGETABLE_SOUP_MIX` | Dried Vegetable Soup Mix | One dry packet for one bowl of soup | 6 cp | 0.2 | variable |

### Luxury Meals

Single fine-dining portions requiring uncommon ingredients or extra kitchen work.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_SAFFRON_CHICKEN_PILAF` | Saffron Chicken Pilaf | One individual fine meal | 1 gp | 1 | special-order |
| `DT_ITEM_TAV_PEPPERED_VENISON_PLATE` | Peppered Venison Plate | One individual fine meal | 1 gp | 0.9 | special-order |
| `DT_ITEM_TAV_DUCK_WITH_CHERRY_SAUCE` | Duck with Cherry Sauce | One individual fine meal | 1 gp | 0.9 | special-order |
| `DT_ITEM_TAV_TRUFFLED_MUSHROOM_PIE` | Truffled Mushroom Pie | One individual fine meal | 2 gp | 0.8 | special-order |
| `DT_ITEM_TAV_BUTTER_POACHED_SHELLFISH` | Butter-Poached Shellfish | One individual fine meal | 2 gp | 0.65 | special-order |
| `DT_ITEM_TAV_SPICED_QUAIL_SUPPER` | Spiced Quail Supper | One individual fine meal | 1 gp | 0.8 | special-order |
| `DT_ITEM_TAV_STUFFED_ARTICHOKE_PLATE` | Stuffed Artichoke Plate | One individual fine meal | 8 sp | 0.8 | special-order |
| `DT_ITEM_TAV_CELEBRATION_SUPPER` | Celebration Supper | One individual fine meal | 3 gp | 1.6 | special-order |

### Animal Feed

Stable provisions and treats; the shared Horse Feed remains the canonical daily ration.

| Permanent ID | Item | Sale unit | Price | lb | Availability |
| --- | --- | --- | ---: | ---: | --- |
| `DT_ITEM_TAV_LOOSE_OATS` | Loose Oats | One four-pound measure of oats | 3 cp | 4 | variable |
| `DT_ITEM_TAV_HAY_BUNDLE` | Hay Bundle | One ten-pound tied hay bundle | 4 cp | 10 | variable |
| `DT_ITEM_TAV_BRAN_MASH` | Bran Mash | One three-pound prepared mash portion | 3 cp | 3 | variable |
| `DT_ITEM_TAV_FEED_CARROTS` | Feed Carrots | One pound of feed carrots | 2 cp | 1 | variable |
| `DT_ITEM_TAV_POULTRY_GRAIN` | Poultry Grain | One pound of mixed grain | 2 cp | 1 | variable |
| `DT_ITEM_TAV_HOUND_BISCUIT_BUNDLE` | Hound Biscuit Bundle | One pound of hound biscuits | 4 cp | 1 | variable |
| `DT_ITEM_TAV_DRIED_APPLE_HORSE_TREATS` | Dried Apple Horse Treats | One half-pound packet of horse treats | 3 cp | 0.5 | variable |
| `DT_ITEM_TAV_CHOPPED_FODDER` | Chopped Fodder | One five-pound measure of chopped fodder | 3 cp | 5 | variable |

