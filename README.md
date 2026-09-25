# Devil's Table: Goods & Provisions

A long-term Foundry VTT module for reusable goods, provisions and shop catalogues.
**This repository is the project's single source of truth.** Canonical JSON is authored here;
Foundry compendiums are generated from it and must never be edited as source data.

## Current status

Sprint 3 build, `0.2.0-alpha.7`: **144 authored General Store items across ten categories**.
The builder generates **32 stock RollTables**: four per merchant profile, including Village,
Town, City and Merchant Wagon. Category rolls filter shared tables, and stock lists include
weighted quantities. The General Store authoring scope is complete; live acceptance remains open.
See [Stock RollTables](docs/STOCK_TABLES.md) for the stock rules and the
[Sprint 3 review](docs/SPRINT_3_REVIEW.md) for all 144 items, merchant policies and upgrade details.
The [alpha.4 review](docs/GENERAL_STORE_REVIEW.md) records the accepted earlier expansion, and the
[Containers review table](docs/CONTAINERS_REVIEW.md) records the original batch.
Automated tests also use a synthetic parcel that is excluded from the module ZIP.

The user reported that alpha.4's goods and alpha.5's RollTables worked. This build retains
the earlier read-back fix and field diagnostics. The 75 additions, variant controls, quantities
and legacy cleanup require detailed live acceptance. No Tavern content is added.

**Sprint 4 is a design proposal:** the [Merchant System Specification](docs/merchant/MERCHANT_SYSTEM_SPECIFICATION.md)
and its [data model](docs/merchant/DATA_MODEL.md), [wireframes](docs/merchant/UI_WIREFRAMES.md),
[workflow diagrams](docs/merchant/WORKFLOW_DIAGRAMS.md), [technical decisions](docs/merchant/TECHNICAL_JUSTIFICATION.md)
and [implementation roadmap](docs/merchant/IMPLEMENTATION_ROADMAP.md) describe persistent NPC
merchants for review. They do not add a merchant runtime, revise the module version or change
the existing catalogue, stock builders or packaging.

| Category | Items |
| --- | ---: |
| Containers | 13 |
| Lighting & Fire | 17 |
| Rope & Climbing | 10 |
| Camping | 21 |
| Writing | 13 |
| Household | 18 |
| Animal Supplies | 12 |
| Travel | 13 |
| Tools | 16 |
| Trade Goods | 11 |

The target is Foundry V14 and D&D5e **5.3.3**, with the **2014 rules** baseline and
author-supplied adjusted weights for Variant Encumbrance. No world encumbrance settings
are changed. This is intended for The Forge, but live Foundry/Forge acceptance testing
is still required. The manifest deliberately does not claim verified compatibility.

## What the framework does

- Loads a registry of source JSON files, with bounded parallel reads.
- Validates every item and permanent ID before writing anything.
- Converts ordinary goods to D&D5e `loot`, native `container` and explicitly supported mundane `consumable` documents, using 2014 source rules and exact adjusted weights.
- Provides a GM settings window with read-only validation/preview and a confirmed build action.
- Filters authored items by shop and category; empty selections generate no Items.
- Displays builder-only Merchant Notes (Always / Often / Rarely Stocks) for all five shops.
- Validates whole-coin prices: 1–9 cp, 1–9 sp, 1–24 gp equipment and 25+ gp specialist goods.
- Creates or updates one world Item compendium: `world.devils-table-items`.
- Provides a separate **Build/Rebuild Stock RollTables → Open RollTable Builder** settings button.
- Generates Always / Often / Rarely / Rotating tables in `world.devils-table-stock-tables`.
- Rolls a read-only stock list with guaranteed Always goods, duplicate-free rotating choices
  and weighted quantities based on price band and effective shop availability.
- Preserves internal document IDs, unrelated entries, folders and other modules' flags.
- Batches writes in groups of 100 and checks the result against the source.
- The builder never deletes items. Inactive catalogue entries stay in the pack until an explicit retirement workflow is added.

New records define one purchase explicitly: a 50-foot rope, ten pitons, four horseshoes or one
day's animal feed, for example. Quantity 1 means that complete sale unit. Eleven consumable goods
have a native activity that removes one unit when its use is complete; lights are marked spent
after burning out, not when first lit. Reusable lights and the climber's kit have non-consuming
activities. Token lighting, elapsed burn time, fuel transfer and partial quantities remain manual.

Shops are tags, not copies of an item. Tavern, General Store, Alchemist, Blacksmith and Black Market
each have a definition and Merchant Notes. Notes guide the GM; they are never included in generated
Item or RollTable descriptions or flags. Structured stock profiles use item availability and
explicit per-shop overrides to decide table membership. Quantity suggestions count complete sale
units; saved merchant inventories and purchasing remain future work. Availability does not exclude
an item from the Item compendium build.

## Install and test on The Forge

1. Obtain the packaged ZIP from the successful **Validate and package** GitHub Actions run
   (artifact: `devils-table-framework`), or build it using the development commands below.
   Downloading an Actions artifact may wrap the module ZIP in another ZIP: extract the artifact
   first and select `devils-table-v0.2.0-alpha.7.zip` for import.
2. Back up your test world. In The Forge's Import Wizard, import that module ZIP as a custom package.
   See the [Forge custom-package guide](https://forums.forge-vtt.com/t/how-to-upload-a-modified-version-of-a-module-system/10510).
3. In a V14 / D&D5e 5.3.3 test world, enable **Devil's Table: Goods & Provisions** and reload.
4. As the active GM, open **Configure Settings → Devil's Table → Build/Rebuild Compendiums → Open Builder**.
5. Select **Village General Store → All categories**, then **Validate / Preview**. In a fresh world,
   expect **144 creates**. A complete alpha.4–alpha.6 pack should report **75 creates, 13 updates,
   56 unchanged**. The thirteen updates add Container sale-unit metadata. A Containers-only pack
   needs 131 creates and 13 sale-unit updates. Preview is read-only.
6. Choose **Build / Rebuild** and confirm. The builder adds the selected items to
   `world.devils-table-items`. Run it again: expect 144 unchanged Items and no duplicates.
7. Open the separate **Configure Settings → Devil's Table → Build/Rebuild Stock RollTables →
   Open RollTable Builder** button. Select **All shops → All categories**,
   then **Validate / Preview Tables**: expect **32 creates** in a fresh world. An alpha.6 pack
   reports **12 creates, 3 updates, 17 unchanged**. Normal builds preserve any legacy tables.
8. Choose **Build / Rebuild Tables** and confirm. Repeat: expect 32 unchanged active tables.
   Each merchant profile uses four tables, regardless of the category selected for rolling stock.
9. Select one shop and merchant profile, optionally a category, and click **Roll Stock & Quantities**. The list includes
   weighted quantities in complete sale units. Inventory transfers remain under GM control.
10. For old category tables, use **Preview Legacy Cleanup**, review the removal/protection report,
    then confirm only eligible removals. Changed historical memberships/names, manual edits and known
    incoming RollTable links protect tables. Cleanup may therefore retain old tables. Check other
    saved references and keep a world backup first.
   Follow [the table guide](docs/STOCK_TABLES.md) and [live checklist](docs/TESTING.md).

The archive contains exactly one `devils-table/module.json`, alongside its runtime folders.
Do not upload the repository's source-code ZIP as though it were a packaged release.
No install-manifest URL or public release asset is advertised yet: those are added only after
the live acceptance test and an actual versioned release exist.

### Recovering from the alpha.2 read-back error

Keep the existing generated compendium. Import the updated module ZIP using the same Forge
custom-package method, restart/reload the test world and confirm the module shows `0.2.0-alpha.7`.
Run **Village General Store → Containers → Validate / Preview**, then **Build / Rebuild**.
If all 13 Items were saved, equivalent description formatting is accepted. The first alpha.7
rebuild adds thirteen sale-unit flags, then reports thirteen unchanged on the next build.
If any are missing or genuinely different, the normal rebuild creates/updates them with their
existing permanent identities. If verification still fails, copy the full builder report: it now
includes source IDs, field paths and shortened expected/saved values. Do not delete the pack.

## Safe rebuild contract

- Only the active GM can preview/build. Use **one browser tab** for building.
- Preview does not create packs, unlock packs, write documents or save settings.
- A build updates only the builder-controlled fields of its own generated documents.
  Manual edits to those fields will be overwritten: edit canonical JSON instead.
- A conflict, duplicate permanent ID or attempted Item type change aborts before writes.
- A new pack is locked after building. An existing pack's original lock state is restored.
- Actor-owned and world-inventory copies are not updated; each builder targets its named world pack.
- Table rebuilds refresh owned result rows, including removing obsolete generated rows. They never
  delete Items or whole RollTables. A selected generated table containing custom rows blocks the
  build; keep custom tables separate. Table references must resolve to already-built Items.
- **Legacy cleanup is a separate, explicitly confirmed deletion operation.** It removes only
  reviewed, unchanged superseded category tables. Their permanent IDs stay reserved. Reference
  checks cover this stock pack and world RollTables; review journals, macros and other packs yourself.
- Foundry batch operations are **not a database transaction**. A disconnect or hook failure can
  leave a partial build. No Items or whole tables are deleted; fix the error and rerun to converge.
  Back up the world first. Failed lock restoration is reported, not hidden.
- The local overlap guard and active-GM check are not a distributed lock across tabs/sessions.
- Generated world compendiums remain in the world when the module is disabled or updated.
  They do not travel to other worlds automatically. Pack sharing and general item retirement are later work.

## Development

Use Node.js 20 or later (CI uses Node 24). There are no npm dependencies and no runtime CDN.
Packaging also requires the standard `zip` and `unzip` commands (for example, in Linux/WSL).

```sh
npm run check       # catalogue, manifest, file/import/syntax checks, then unit tests
npm run package     # rerun checks and write a runtime-only ZIP under dist/
```

CI runs those checks on pushes and pull requests, checks that permanent IDs were not removed
from either ledger, and uploads a testable ZIP. It does not publish releases or deploy anything.
Generated ZIPs and Foundry compendiums are not committed.

## Development standards

The documents below are the official standards for future development. They distinguish current
validated behaviour from editorial requirements and planned features. Start with the Content Standard
before authoring an item; use the release process before distributing a candidate.

| Standard | Purpose |
| --- | --- |
| [Content Standard](docs/CONTENT_STANDARD.md) | Permanent IDs, writing, sale units, fields, categories, tags and validation |
| [Price Guide](docs/PRICE_GUIDE.md) | Copper/silver economy, price bands and coherent purchase units |
| [Weight Guide](docs/WEIGHT_GUIDE.md) | Variant Encumbrance, adjusted pounds, empty/full goods and capacities |
| [Merchant Standard](docs/MERCHANT_STANDARD.md) | Shared goods, Merchant Notes, availability, quantities and player experience |
| [Icon Standard](docs/ICON_STANDARD.md) | Shared assets, new 256×256 WebP artwork, consistency and provenance |
| [Design Decisions](docs/DESIGN_DECISIONS.md) | Accepted project decisions, reasons and consequences |
| [Release Process](docs/RELEASE_PROCESS.md) | Validation, world builders, upgrade checks, versioning and ZIP packaging |
| [Milestone Roadmap](docs/ROADMAP.md) | Planned releases from General Store to 1.0 Stable Release |
| [Milestone Changelog](docs/CHANGELOG.md) | Keep a Changelog history and unreleased development |

The root changelog and roadmap retain detailed alpha-build history and implementation checklists.
The corresponding documents under `docs/` govern milestone history and release scope.

## Source contract

Every item requires `id`, `name`, `description`, `saleUnit`, `price`, `weight`, `icon`, `category`,
`tags`, `shops`, `availability`, `source`, and an explicit supported `mechanics` mapping.
Sale units and at least one meaningful tag are required for every record; normalized names must be unique.
Names and shop membership may change; IDs such as `DT_ITEM_GS_ROPE_HEMP` must not.
Reserve IDs in the append-only `data/id-ledger.json`; never recycle an old ID.
Stock policy lives in `data/stock.json`, weighted quantity profiles in `data/stock-quantities.json`;
table identities are reserved separately in
`data/table-id-ledger.json`. Merchant Notes remain private builder guidance.

See [the Content Standard](docs/CONTENT_STANDARD.md), [the schema contract](docs/SOURCE_DATA.md),
[architecture and API](docs/ARCHITECTURE.md),
[the complete file inventory](docs/FILE_MAP.md), [the acceptance checklist](docs/TESTING.md),
[CHANGELOG](CHANGELOG.md) and [ROADMAP](ROADMAP.md).

## Publication

This is an unreleased content review build. The project owner has not yet selected a distribution
license. Public-release work includes that decision, icon and text provenance review,
live platform testing, release assets and a real update manifest. A `source.license` string
records provenance; it does not itself grant permission to redistribute content.
