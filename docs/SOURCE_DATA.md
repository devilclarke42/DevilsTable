# Canonical source-data contract

## Ownership

Edit catalogue JSON in this repository. Do not edit generated pack data directly. A rebuild
overwrites builder-controlled fields; imports already owned by an actor or the world are independent.
The 69 General Store items live in eight category files under `data/items/general-store/`.
The original 13 Containers records are unchanged by the seven-category expansion.
`tests/fixtures/item.json` is synthetic test material only.

## Required fields

| Field | Meaning and constraints |
| --- | --- |
| `id` | Permanent uppercase identity, e.g. `DT_ITEM_GS_ROPE_HEMP`. Reserve once; never rename or reuse. |
| `name` | Nonblank display name; safe to rename without changing identity. |
| `description` | Plain text. The converter escapes HTML and preserves paragraph/line breaks. |
| `price` | `{value, denomination}`; positive whole amount in cp/sp/gp. cp and sp amounts must be 1–9. |
| `weight` | `{value, units: "lb", notes}`; finite nonnegative adjusted weight and rationale. |
| `icon` | Local `icons/…` reference or module-owned `modules/devils-table/assets/…` path; no remote URLs or traversal. |
| `category` | One category from the registry. |
| `tags` | Unique descriptive lowercase slug strings; an empty array is allowed. |
| `shops` | One or more unique shop slugs from the registry. A shared item occurs once in source. |
| `availability` | `core`, `variable`, or `special-order`; stock frequency, not D&D magic rarity. |
| `source` | `{title, reference, license}`; all nonblank. Attribute the original or project source honestly. |
| `mechanics` | Explicit `loot`, `container` or supported mundane `consumable` mapping, described below. |

The authoritative structural definitions are in `schemas/`. Unknown fields fail validation,
helping catch misspellings. Extend the schema, converter, docs and tests together when needed.
Do not work around an unsupported potion/weapon by labelling it as ordinary loot.

`saleUnit` is an optional nonblank description of one purchase, present on all 56 new items.
Generated quantity 1, price and weight describe that complete unit: ten pitons are one bundle,
four horseshoes are one set and Horse Feed is one ten-pound daily ration. A bundle is not ten
copies of a single piton, and a kit does not create nested component Items. Split bundles and
partially used supplies manually in actor inventory; never change their permanent catalogue IDs.
The original Containers descriptions already state what is supplied, so their records stay unchanged.

## Pricing conventions

| Display denomination | Intended purchase |
| --- | --- |
| 1–9 cp | Tiny everyday goods |
| 1–9 sp | Common purchases |
| 1–24 gp | Significant equipment |
| 25+ gp | Specialist purchases |

The shared boundary of 25 gp belongs to the specialist band. These are authored project prices,
not automatic conversions of official prices or rarity ratings. Use whole coins and choose a
sensible denomination instead of storing 10 cp, 10 sp or fractional gp. Free goods, ep, pp and
exceptional fractional prices would need an explicitly reviewed extension to the contract.
An item's availability is independent of its price band: a 12 gp lockbox can be special-order.

## Containers and encumbrance

Every item in the Containers category uses `mechanics.type: "container"`, with no loot subtype.
Other categories may also contain native containers, such as a cooking pot or feed bag.
`mechanics.capacity` requires positive `weight: {value, units: "lb"}` and positive
`volume: {value, units}`. Volume units are `cubicFoot`, `pint`, `quart` or `gallon`; liquid measures
are US measures. The converter uses 231 cubic inches per gallon and 1728 cubic inches per cubic
foot to produce D&D5e's supported `cubicFoot` field. Source values are not overwritten.

`weight.value` is the **empty** container, including only the fittings named in `weight.notes`.
Capacity describes contents, not the shell. Both the mass limit and physical size matter.
D&D5e's weight capacity display is used; volume, shape, sealing, breakage and locks need GM
adjudication. There is no automatic enforcement of liquid volume or an included liquid Item.
Containers use quantity 1 and never grant `weightlessContents`. Track actual contents as separate
inventory entries; do not also add their mass to the container's empty weight. In this catalogue,
water uses a game allowance of 2 lb per US quart: a full waterskin is 0.5 + 4 = 4.5 lb.

## Mundane goods and consumable use

Ordinary equipment uses `mechanics: {type: "loot", subtype: "gear"}`; crafting supplies may
use `material`. The other existing loot subtypes remain available. Small domestic repair kits
do not imply a D&D tool proficiency. Weapons, armour, proficiency tools and healing potions
are not supported converter types in this build.

Supported `consumable` subtypes are `trinket` and `food`. Each requires `mechanics.use` with
`name`, `mode` (`consume` or `reusable`), `activation` (`action` or `special`) and a clear
`condition`. Food must consume. The converter creates one native utility activity; it has no
spell-slot consumption, attack, healing roll or active effects.

- **Consume:** one use per sale unit, no recovery, native `autoDestroy: true`. The activity
  consumes one owning Item use with a blank target, which remains valid after actor import.
  D&D5e removes one quantity from the stack, or the Item when its last quantity is spent.
  Torches and candles are marked spent after burning out. Oil is expended when transferred or
  otherwise used; ink and charcoal are marked spent after their full bottle/bag is exhausted.
- **Reusable:** no limited uses, no consumption targets and `autoDestroy: false`. Lighting a
  lamp or anchoring with a climber's kit does not remove the equipment. Externally supplied
  oil or candles must be tracked separately.

These actions operate on a player's explicitly used inventory copy. The compendium builder
still never deletes Items or alters actor inventories. Partial consumption, retained empty
packaging, transferred fuel and its carried weight need manual bookkeeping. Do not count one
fuel unit twice after transferring it. Resting does not refill spent supplies.

`mechanics.light`, when present, requires `brightFeet`, `dimFeet`, `shape` (`radius` or `cone`),
`durationHours` and `fuel` (`self`, `candle` or `oil`). **Dim distance is total reach** from the
light, not the additional dim band: a lamp is 15 ft bright plus 30 ft dim, encoded as 15/45.
Positive durations and compatible consumption modes are validated. Light data is copied to
module flags as reference metadata; it never changes token lighting or starts a timer. Reusable
light activities show the duration of the stated fuel supply. Candle-lantern duration assumes
the basic one-hour candle; other candles use their own duration. Hooded mode is handled manually.

Beeswax and tallow candle sizes/durations, the candle lantern and compass are project designs.
2014 baseline mechanics and project adjustments are distinguished in each record's source
reference and the [General Store review](GENERAL_STORE_REVIEW.md).

## Shops, categories and Merchant Notes

`data/shops.json` defines every registered shop. Each must have a name, description and
`merchantNotes` with nonempty `alwaysStocks`, `oftenStocks` and `rarelyStocks` lists. Notes are
plain-language guidance, may name future goods, and are displayed only in the builder. A stock
phrase cannot appear in multiple tiers of the same shop. They do not generate Items, assign
quantities, override item availability or become compendium metadata.

`data/categories.json` defines each shop's curated categories, descriptions and `plannedItems`
names. These lists are editorial plans, not permanent identities or item records. The eight
General Store categories are Containers, Fire & Lighting, Rope & Climbing, Camping, Writing,
Household, Animal and Travel. Other shop category plans can be added later. For a shop with
defined categories, each tagged item must use one of those categories. A shared good exists once,
with multiple `shops` tags; its category and permanent ID stay the same across filtered builds.

## Stock profiles and generated tables

`data/stock.json` is the canonical stock policy. It is separate from Merchant Notes: free-form
notes may mention future goods, while every table result must refer to an authored item. The
stock loader adds this file, `schemas/stock.schema.json` and `data/table-id-ledger.json` to the
existing catalogue. Stock validation runs in the browser and packaging/CI.

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Currently 1. |
| `oftenChance`, `rarelyChance` | Positive whole percentages; Often must exceed Rarely and their sum cannot exceed 100. The remainder means no extra stock. Current defaults: 80 / 15 / 5. |
| `profiles[].id` | Permanent table identity prefix, such as `DT_TABLE_GS`; never rename or reuse. |
| `shop` | Exactly one profile per registered shop slug. |
| `coverage` | `complete` for the agreed authored catalogue, or `partial` to show its limitations. This is an editorial assertion, not an automatic completeness test. |
| `draws`, `categoryDraws` | Suggested rotating attempts for a whole shop and one category; integers 1–50. |
| `categories` | Unique registered category slugs. Include every category used by an item tagged for this shop. A whole-shop set is generated automatically. |
| `overrides` | Explicit `{itemId, tier}` exceptions; `tier` is `always`, `often` or `rarely`. Each ID must be an active item tagged for this shop, with at most one override per shop. |

Without an override, `core` maps to Always, `variable` to Often and `special-order` to Rarely.
An override changes only that shop's table membership. It never changes item price, weight,
identity or base availability. Current overrides make Lamp Oil Often at the Alchemist, Lockbox
Often at the Blacksmith, and Lockbox/Silk Rope Often at the Black Market.

Every shop/category scope generates four tables, even when a tier is empty. Empty pools carry
an explicit text result and rotating draws do not redirect their probability to another tier.
Generated tables contain operational instructions and item/table UUIDs, never Merchant Notes.
Future goods mentioned in Merchant Notes must be authored and reviewed before they can enter a pool.

Reserve every generated table ID in the append-only `data/table-id-ledger.json`. The convention
is `<profile ID>_<CATEGORY or ALL>_<ALWAYS/OFTEN/RARELY/ROTATING>`; hyphens in category slugs become
underscores. For example, `DT_TABLE_GS_FIRE_LIGHTING_ROTATING`. Display-name and probability edits
retain identities. Profile IDs and category slugs are now part of permanent table identity;
changing them needs an explicit migration. Old ledger entries and inactive tables are preserved.
The validator detects duplicate profiles, reservations and derived document-ID collisions.

Result identity is derived from its permanent table ID and the item ID or tier key. Tier changes
move an item's generated row between tables without changing the Item UUID. Rebuilds may remove
obsolete owned rows; they never delete Items or whole tables. Custom result rows in a generated
table block rebuilding. Keep personal tables separate and edit source policy for generated stock.
See [Stock RollTables](STOCK_TABLES.md) for current coverage and usage.

## Permanent identity

Keep the same ID through renames, rebalancing, category moves and shop changes. The `GS`, `TAV`
or `ALC` component is an immutable origin label, not the item's current shop. The ID ledger is
append-only. Removing an item from the active catalogue does not free its ID and does not delete
its generated Item. CI compares the ledger with the previous/base revision. Reviews must still
ensure a reserved ID is not repurposed for a different concept.

Changing the derived Foundry ID or changing an existing Item's document type requires a deliberate
migration; the builder refuses to guess. Hash collisions fail validation and require author review.

## Adding reviewed content later

1. Agree the item, 2014 mechanics, adjusted weight and source rights.
2. Reserve the permanent ID in `data/id-ledger.json`.
3. Add the item once to an appropriate file under `data/items/`.
4. Register any new file, category or shop in `data/catalogue.json`.
5. Update stock profiles for new shop/category membership and reserve any additional table IDs.
6. Run `npm run check`, then preview/build Items followed by tables in a disposable test world.
7. Rebuild and confirm no duplicates; record a live result before publishing.

Descriptions, licensing claims and economic/encumbrance balance need human review. Validation
can check required fields and formats, not the truth of a source attribution or a license grant.
Core Foundry icons are referenced, not redistributed. Module-owned icon files are existence-checked
by tooling; their rights must be documented before public distribution.
