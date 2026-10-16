# Equipment Pack Fulfilment

**Audience:** content authors, maintainers and GMs. **Purpose:** preserve the seven SRD pack manifests and define the review needed before they become purchasable products.

## Current boundary

These are review manifests, not installed catalogue Items. None counts as represented in the 241-entry coverage matrix. The single-Item factory does not generate child inventory. `transferable` in `scripts/merchant/trade-model.js` rejects both contained Items and containers with children. An empty native backpack cannot deliver a full equipment pack, and transferring a populated container would bypass an intentional safety guard. No new transfer behaviour is included here.

## Compatible proposal

Use existing standalone canonical goods for manual GM fulfilment first: create the listed components directly on the recipient, check each quantity, then organise them into the native container in Foundry. Agree and record a project pack price with the GM before settlement; the benchmarks below are SRD references, not approved prices in the custom economy. Do not charge an automatic empty-pack product while implying that its contents have been delivered. A later generic bundle definition could reference canonical IDs and quantities, present a fulfilment checklist and prevent double charging; implementing checkout/bundle automation requires separate approval and duplicate-delivery/recovery tests. Native container transfer must remain guarded until a separately reviewed solution handles children, ownership and rollback.

## Source and units

Contents and benchmark prices were checked against SRD 5.1 p. 70, [CC-BY-4.0 source](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf#page=70). Lists below use original concise wording. One purchased ball-bearing bag contains 1,000 bearings; one piton bundle contains ten pitons. Do not multiply either bundle quantity again. Waterskins remain empty under the project convention, with water tracked separately. Existing wax/soap/ink use their stated project sale units; the source pack does not specify an exact wax or soap mass.

Unresolved components are explicit: a coil of twine is not silently substituted for ten feet of string; ordinary robes do not establish priestly vestments. The quarter-pound Blotting Sand packet is a possible substitute for the Scholar's little bag, subject to a GM unit decision; a generic weapon is not assumed to be the small knife. These components need reviewed purchase units, weight and price before any complete canonical pack is authored.

## Burglar’s Pack

SRD benchmark: **16 gp**. No project bundle price is approved.

| Contents | Canonical ID / pending component | Item quantity |
| --- | --- | --- |
| Backpack | `DT_ITEM_GS_BACKPACK` | 1 |
| Ball bearings, bag of 1,000 | `DT_ITEM_GS_BALL_BEARINGS` | 1 |
| String, 10 ft. | Pending reviewed component | 1 |
| Bell | `DT_ITEM_GS_BELL` | 1 |
| Candles | `DT_ITEM_GS_CANDLE` | 5 |
| Crowbar | `DT_ITEM_GS_CROWBAR` | 1 |
| Hammer | `DT_ITEM_GS_HAMMER` | 1 |
| Pitons, ten | `DT_ITEM_GS_PITONS` | 1 |
| Hooded lantern | `DT_ITEM_GS_LANTERN_HOODED` | 1 |
| Oil, pint flasks | `DT_ITEM_GS_OIL_LAMP` | 2 |
| Days of rations | `DT_ITEM_GS_RATIONS_TRAVEL` | 5 |
| Tinderbox | `DT_ITEM_GS_TINDERBOX` | 1 |
| Waterskin | `DT_ITEM_GS_WATERSKIN` | 1 |
| Hempen rope, 50 ft. | `DT_ITEM_GS_ROPE_HEMP` | 1 |

## Diplomat’s Pack

SRD benchmark: **39 gp**. No project bundle price is approved.

| Contents | Canonical ID / pending component | Item quantity |
| --- | --- | --- |
| Chest | `DT_ITEM_GS_CHEST` | 1 |
| Map/scroll cases | `DT_ITEM_GS_CASE_DOCUMENT` | 2 |
| Fine clothes | `DT_ITEM_GS_CLOTHES_FINE` | 1 |
| Ink bottle | `DT_ITEM_GS_INK` | 1 |
| Ink pen | `DT_ITEM_GS_INK_PEN` | 1 |
| Lamp | `DT_ITEM_GS_LAMP` | 1 |
| Oil, pint flasks | `DT_ITEM_GS_OIL_LAMP` | 2 |
| Sheets of paper | `DT_ITEM_GS_PAPER` | 5 |
| Perfume vial | `DT_ITEM_GS_PERFUME` | 1 |
| Sealing wax | `DT_ITEM_GS_WAX` | 1 |
| Soap | `DT_ITEM_GS_SOAP` | 1 |

## Dungeoneer’s Pack

SRD benchmark: **12 gp**. No project bundle price is approved.

| Contents | Canonical ID / pending component | Item quantity |
| --- | --- | --- |
| Backpack | `DT_ITEM_GS_BACKPACK` | 1 |
| Crowbar | `DT_ITEM_GS_CROWBAR` | 1 |
| Hammer | `DT_ITEM_GS_HAMMER` | 1 |
| Pitons, ten | `DT_ITEM_GS_PITONS` | 1 |
| Torches | `DT_ITEM_GS_TORCH` | 10 |
| Tinderbox | `DT_ITEM_GS_TINDERBOX` | 1 |
| Days of rations | `DT_ITEM_GS_RATIONS_TRAVEL` | 10 |
| Waterskin | `DT_ITEM_GS_WATERSKIN` | 1 |
| Hempen rope, 50 ft. | `DT_ITEM_GS_ROPE_HEMP` | 1 |

## Entertainer’s Pack

SRD benchmark: **40 gp**. No project bundle price is approved.

| Contents | Canonical ID / pending component | Item quantity |
| --- | --- | --- |
| Backpack | `DT_ITEM_GS_BACKPACK` | 1 |
| Bedroll | `DT_ITEM_GS_BEDROLL` | 1 |
| Costumes | `DT_ITEM_GS_CLOTHES_COSTUME` | 2 |
| Candles | `DT_ITEM_GS_CANDLE` | 5 |
| Days of rations | `DT_ITEM_GS_RATIONS_TRAVEL` | 5 |
| Waterskin | `DT_ITEM_GS_WATERSKIN` | 1 |
| Disguise kit | `DT_ITEM_BMK_DISGUISE_KIT` | 1 |

## Explorer’s Pack

SRD benchmark: **10 gp**. No project bundle price is approved.

| Contents | Canonical ID / pending component | Item quantity |
| --- | --- | --- |
| Backpack | `DT_ITEM_GS_BACKPACK` | 1 |
| Bedroll | `DT_ITEM_GS_BEDROLL` | 1 |
| Mess kit | `DT_ITEM_GS_MESS_KIT` | 1 |
| Tinderbox | `DT_ITEM_GS_TINDERBOX` | 1 |
| Torches | `DT_ITEM_GS_TORCH` | 10 |
| Days of rations | `DT_ITEM_GS_RATIONS_TRAVEL` | 10 |
| Waterskin | `DT_ITEM_GS_WATERSKIN` | 1 |
| Hempen rope, 50 ft. | `DT_ITEM_GS_ROPE_HEMP` | 1 |

## Priest’s Pack

SRD benchmark: **19 gp**. No project bundle price is approved.

| Contents | Canonical ID / pending component | Item quantity |
| --- | --- | --- |
| Backpack | `DT_ITEM_GS_BACKPACK` | 1 |
| Blanket | `DT_ITEM_GS_BLANKET` | 1 |
| Candles | `DT_ITEM_GS_CANDLE` | 10 |
| Tinderbox | `DT_ITEM_GS_TINDERBOX` | 1 |
| Alms box | Pending reviewed component | 1 |
| Incense blocks | Pending reviewed component | 2 |
| Censer | Pending reviewed component | 1 |
| Vestments | Pending reviewed component | 1 |
| Days of rations | `DT_ITEM_GS_RATIONS_TRAVEL` | 2 |
| Waterskin | `DT_ITEM_GS_WATERSKIN` | 1 |

## Scholar’s Pack

SRD benchmark: **40 gp**. No project bundle price is approved.

| Contents | Canonical ID / pending component | Item quantity |
| --- | --- | --- |
| Backpack | `DT_ITEM_GS_BACKPACK` | 1 |
| Book of lore | `DT_ITEM_GS_BOOK_LORE` | 1 |
| Ink bottle | `DT_ITEM_GS_INK` | 1 |
| Ink pen | `DT_ITEM_GS_INK_PEN` | 1 |
| Sheets of parchment | `DT_ITEM_GS_PARCHMENT` | 10 |
| Little bag of sand | Pending reviewed component | 1 |
| Small knife | Pending reviewed component | 1 |

## Related documents

[Core Catalogue](CORE_CATALOGUE.md), [Content Completeness](CONTENT_COMPLETENESS.md), [Content Standards](CONTENT_STANDARD.md), [Weight Guide](WEIGHT_GUIDE.md).
