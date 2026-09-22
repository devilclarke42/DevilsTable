# Canonical source-data contract

## Ownership

Edit catalogue JSON in this repository. Do not edit generated pack data directly. A rebuild
overwrites builder-controlled fields; imports already owned by an actor or the world are independent.
The first 13 authored items live in `data/items/general-store/containers.json` and await review.
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
| `mechanics` | Either `{type: "loot", subtype: …}` or `{type: "container", capacity: …}`. |

The authoritative structural definitions are in `schemas/`. Unknown fields fail validation,
helping catch misspellings. Extend the schema, converter, docs and tests together when needed.
Do not work around an unsupported potion/weapon by labelling it as ordinary loot.

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
5. Run `npm run check`, then preview and build in a disposable test world.
6. Rebuild and confirm no duplicates; record a live result before publishing.

Descriptions, licensing claims and economic/encumbrance balance need human review. Validation
can check required fields and formats, not the truth of a source attribution or a license grant.
Core Foundry icons are referenced, not redistributed. Module-owned icon files are existence-checked
by tooling; their rights must be documented before public distribution.
