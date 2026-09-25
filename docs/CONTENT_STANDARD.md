# Content Standard

**Status:** official standard for all future Devil's Table content.  
**Target:** Foundry VTT V14, D&D5e 5.3.3, 2014 mechanics, adjusted pounds for Variant Encumbrance.

The repository is authoritative. Authors edit canonical JSON, reviewers approve it, and builders
generate Foundry documents. World or actor copies are play data, not a route for changing the
published catalogue. This standard governs editorial quality; [SOURCE_DATA.md](SOURCE_DATA.md)
documents the current schema and converter. A documented future feature is not permission to
add an unsupported JSON field or mechanic.

## 1. One record, one identity, one sale unit

Every item represents one clearly defined product and purchase unit. A fifty-foot coil, a bundle
of ten pitons and a set of four horseshoes are each one quantity unit. Price, weight, consumption
and rolled stock quantity must all refer to that same unit. A kit's listed components are included
in its total; the builder does not generate separate component Items.

Use the permanent format `DT_ITEM_<ORIGIN>_<IDENTIFIER>`:

| Origin | Meaning | Example identity |
| --- | --- | --- |
| `GS` | First authored for General Store | `DT_ITEM_GS_ROPE_HEMP` |
| `TAV` | First authored for Tavern | `DT_ITEM_TAV_RYE_BREAD` |
| `ALC` | First authored for Alchemist | `DT_ITEM_ALC_HEALING_POTION` |
| `BSM` | First authored for Blacksmith | Use this prefix when that catalogue is authored |
| `BMK` | First authored for Black Market | Use this prefix when that catalogue is authored |

Only the General Store example above is currently an authored record. Future examples are naming
illustrations, not ID reservations or claims of shipped content.

- Use uppercase ASCII letters, digits and underscores; no spaces, punctuation or accented letters.
- The schema pattern is `^DT_ITEM_[A-Z0-9]+(?:_[A-Z0-9]+)+$`, with a 128-character maximum.
- Prefer a durable object name followed by a meaningful material/variant: `ROPE_HEMP`,
  `JUG_CLAY`, `LANTERN_HOODED`. Avoid price, weight, version, merchant name or availability in an ID.
- Reserve the ID in `data/id-ledger.json` before adding the record. Search existing records first.
- An ID never changes after reservation and is never reused, even if the item is retired.
- Changing a display name, price, category or shop list does not create a new identity. Origin
  records where the item began; shared goods retain it when another shop stocks them.
- A genuinely different product or purchase unit needs a reviewed new ID. Do not quietly turn a
  ten-piton bundle into a single piton under the existing identity.

Foundry's 16-character document ID is derived separately. Never hand-edit the mapping algorithm,
generated IDs or `flags.devils-table.sourceId` to resolve a conflict; investigate and migrate explicitly.

## 2. Names and descriptions

Use familiar English names in title case: **Clay Jug**, **Hempen Rope**, **Hooded Lantern**.
Use a singular name for one object; a conventional plural is appropriate for a set, such as
**Pitons** or **Horseshoes**. Keep sizes and pack counts in `saleUnit` unless needed to distinguish
two different products. Avoid merchant prefixes, marketing claims, rarity labels and revision numbers.
Display-name changes are allowed, but must not conceal a changed product. Names must be globally
unique after Unicode NFKC normalization, lowercasing and whitespace normalization; validation
rejects visually equivalent duplicates.

Descriptions are original plain text, generally one or two short paragraphs:

1. Identify the object, material and ordinary practical use.
2. Explain what one purchase includes and any relevant exclusions: empty/full, fuel, fittings,
   packaging, rope length, kit components or separate accessories.
3. State useful mechanics and limits precisely when relevant. Separate a 2014 rule from a project
   adjustment, and make manual handling clear when no automation exists.

Use concrete, restrained language. Do not narrate a character's feelings, assume a setting,
invent combat benefits, or pad ordinary goods with lore. A description of soap must not imply
disease removal; a climbing rope must not promise automatic success. Never copy a rulebook passage
as flavour text. Attribute the mechanics and write the explanation in the project's own words.
Use `\n\n` for paragraph breaks. Raw HTML, scripts and embedded remote assets do not belong in source
descriptions; the converter escapes text. Names must be nonblank and at most 200 characters;
descriptions must be nonblank and at most 20,000 characters, though normal entries are much shorter.

## 3. Required authoring fields

| Field | Standard |
| --- | --- |
| `id` | Reserved permanent identity, unique across the entire catalogue. |
| `name` | Clear product name following the conventions above. |
| `description` | Original plain text explaining use, inclusions and meaningful limits. |
| `saleUnit` | Required for every item; nonblank, at most 200 characters. |
| `price` | Positive whole `value` and `denomination` of `cp`, `sp` or `gp`; see [PRICE_GUIDE.md](PRICE_GUIDE.md). |
| `weight` | Finite nonnegative `value`, `units: "lb"`, and a nonblank rationale in `notes`; see [WEIGHT_GUIDE.md](WEIGHT_GUIDE.md). |
| `icon` | A permitted local shared icon path; see [ICON_STANDARD.md](ICON_STANDARD.md). |
| `category` | Exactly one registered functional category slug. |
| `tags` | One or more unique lowercase descriptive slugs; use meaningful shared vocabulary. |
| `shops` | One or more registered shop slugs, without duplicates. |
| `availability` | Exactly `core`, `variable` or `special-order` under the current schema. |
| `source` | Nonblank `title`, `reference` and `license` describing provenance honestly. |
| `mechanics` | An explicitly supported D&D5e mapping, even for ordinary nonmagical goods. |

Sprint 3 adds explicit `saleUnit` values to the original thirteen Containers. All 144 records now
meet the same required-field schema; there is no legacy sale-unit exception.

Price examples: `{ "value": 7, "denomination": "sp" }`. Weight examples:
`{ "value": 5, "units": "lb", "notes": "Dry weight of one complete 50-foot coil." }`.
Do not use strings such as `"7 sp"`, fractional coin amounts, kilograms, or a price for one object
with the weight of a whole bundle. Containers require positive empty weight and explicit positive
mass/volume capacities. An official dash in a weight table is not an instruction to use zero.

## 4. Category hierarchy and physical files

The catalogue has functional categories, shown within each merchant's view. General Store's
approved navigation is **General Store → category → item**. A product still has one canonical
category when it appears in another merchant's view.

| Display category | Canonical slug | Scope |
| --- | --- | --- |
| Containers | `containers` | General storage vessels, bags and boxes |
| Lighting & Fire | `fire-lighting` | Light sources, fuels and fire-making goods |
| Rope & Climbing | `rope-climbing` | Cordage, anchors and climbing equipment |
| Camping | `camping` | Shelter, bedding and camp cooking/tableware |
| Writing | `writing` | Paper, ink and sealing supplies |
| Household | `household` | Cleaning, sewing and laundry goods |
| Animal Supplies | `animal` | Feed, grooming and tack care |
| Travel | `travel` | Walking, navigation and signalling goods |
| Tools | `tools` | Ordinary hand tools, measuring aids and workshop supplies |
| Trade Goods | `trade-goods` | Measured raw materials and household processing supplies |

Choose the primary use: Cooking Pot belongs in Camping while its mechanics can still be
`container`. Tags express cross-cutting properties. Do not duplicate an item to make it appear
in another category or merchant. There is no nested `subcategory` field in the current schema;
a deeper hierarchy needs a reviewed schema/UI change before data uses it.

Canonical arrays live under `data/items/`, grouped by useful authoring boundaries, and every
content file is registered in `data/catalogue.json`. A folder named `general-store` indicates
authoring organisation, not exclusive shop ownership. `data/categories.json` holds descriptions
and planned names; a planned name does not create an item. Future registered categories do not
imply that their mechanics or content have already been implemented.

## 5. Tags and shop assignments

Tags use lowercase kebab-case matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Reuse existing words before
introducing synonyms. Prefer a few useful tags for material, use and purchase form, for example
`mundane`, `leather`, `container`, `sold-empty`, `bundle`, `fuel`, `reusable`. Avoid duplicate tags,
sentences, prices, names masquerading as tags and contradictory pairs such as `sold-empty` with
`filled-vessel`. An empty tag array fails validation. Reviewers also check that the tags
are useful and accurate. Descriptive tags do not silently grant game mechanics.

Valid shop assignments are `tavern`, `general-store`, `alchemist`, `blacksmith` and `black-market`.
Assign a shop because that kind of merchant plausibly sells the product, not merely because a
character could use it there. The Bottle record is shared across General Store, Tavern and
Alchemist; it must not be copied into three source records.

Base availability and per-shop stock overrides control selection. Seasonal, imported and illegal
conditions are described in [MERCHANT_STANDARD.md](MERCHANT_STANDARD.md); those labels must not
be inserted as unsupported `availability` values. Merchant Notes remain builder-only guidance.

## 6. Mechanics, provenance and icons

Current converters support `loot`, native `container`, and documented mundane `consumable`
types with explicit use modes. They do not yet provide general weapon, armour, proficiency-tool
or potion conversion. Do not disguise an unsupported mechanical item as loot just to pass validation.
Keep 2014 mechanical effects unless a project adjustment has been explicitly documented and reviewed.
Prices and weights are authored project values; they do not automatically change mechanics.

Every source record must identify its basis and any original project design. `source.license`
records provenance; it is not a substitute for the project's distribution licence. Do not claim
rights that have not been established. Reuse an existing suitable core or module-owned icon.
New module-owned raster icons follow the 256×256 WebP standard; existing SVG/core exceptions are
documented in the icon policy. Remote image URLs and paths escaping the permitted roots are invalid.

## 7. Review and validation gate

1. Compare the proposed product with existing records and reserve its identity once.
2. Check description, sale unit, price, weight rationale, capacity, source and icon together.
3. Register new source files/categories as needed; update shop coverage and stock policy explicitly.
4. Run `npm run check`. Structural and semantic checks must pass before building.
5. Preview Items in a disposable target world, build, and rerun to confirm unchanged identities.
6. Build the affected shop tables and roll relevant categories/quantities. Test real activities,
   container behaviour and imported copies where the item uses those features.
7. Record the result in the review/build history before a release. Follow [RELEASE_PROCESS.md](RELEASE_PROCESS.md).

Automation verifies shapes, IDs, references, supported mappings and numeric constraints. Human
review verifies believable economics, honest weight adjustments, good writing, icon suitability
and provenance. Current schema validation does not enforce every editorial rule in this document.
Unknown JSON fields fail rather than being ignored. A failed check must be fixed at the source;
never patch a generated compendium to make the validation report look clean.
