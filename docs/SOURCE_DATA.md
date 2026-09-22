# Canonical source-data contract

## Ownership

Edit catalogue JSON in this repository. Do not edit generated pack data directly. A rebuild
overwrites builder-controlled fields; imports already owned by an actor or the world are independent.
Production items are currently absent. `tests/fixtures/item.json` is synthetic test material only.

## Required fields

| Field | Meaning and constraints |
| --- | --- |
| `id` | Permanent uppercase identity, e.g. `DT_ITEM_GS_ROPE_HEMP`. Reserve once; never rename or reuse. |
| `name` | Nonblank display name; safe to rename without changing identity. |
| `description` | Plain text. The converter escapes HTML and preserves paragraph/line breaks. |
| `price` | `{value, denomination}`; finite nonnegative amount, cp/sp/ep/gp/pp. |
| `weight` | `{value, units: "lb", notes}`; finite nonnegative adjusted weight and rationale. |
| `icon` | Local `icons/…` reference or module-owned `modules/devils-table/assets/…` path; no remote URLs or traversal. |
| `category` | One category from the registry. |
| `tags` | Unique descriptive lowercase slug strings; an empty array is allowed. |
| `shops` | One or more unique shop slugs from the registry. A shared item occurs once in source. |
| `availability` | `core`, `variable`, or `special-order`; stock frequency, not D&D magic rarity. |
| `source` | `{title, reference, license}`; all nonblank. Attribute the original or project source honestly. |
| `mechanics` | Explicit converter mapping. Currently `{type: "loot", subtype: …}` only. |

The authoritative structural definitions are in `schemas/`. Unknown fields fail validation,
helping catch misspellings. Extend the schema, converter, docs and tests together when needed.
Do not work around an unsupported potion/weapon by labelling it as ordinary loot.

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
