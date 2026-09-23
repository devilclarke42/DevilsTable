# Devil's Table: Goods & Provisions

A long-term Foundry VTT module for reusable goods, provisions and shop catalogues.
**This repository is the project's single source of truth.** Canonical JSON is authored here;
Foundry compendiums are generated from it and must never be edited as source data.

## Current status

General Store review build, `0.2.0-alpha.4`. The catalogue contains **69 authored items** across
all eight approved categories. This adds 56 goods to the original 13 Containers records, which
remain unchanged. See the [General Store review](docs/GENERAL_STORE_REVIEW.md) for the new
items' prices, purchase units, weights and mechanics, and the
[Containers review table](docs/CONTAINERS_REVIEW.md) for the original batch.
Automated tests also use a synthetic parcel that is excluded from the module ZIP.

The user reported that alpha.3's read-back fix worked. This build retains that fix and its
item/field diagnostics. The new utility activities and extended catalogue still require live acceptance.

| Category | Items |
| --- | ---: |
| Containers | 13 |
| Fire & Lighting | 12 |
| Rope & Climbing | 6 |
| Camping | 11 |
| Writing | 7 |
| Household | 9 |
| Animal | 6 |
| Travel | 5 |

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
- Preserves internal document IDs, unrelated entries, folders and other modules' flags.
- Batches writes in groups of 100 and checks the result against the source.
- The builder never deletes items. Inactive catalogue entries stay in the pack until an explicit retirement workflow is added.

New records define one purchase explicitly: a 50-foot rope, ten pitons, four horseshoes or one
day's animal feed, for example. Quantity 1 means that complete sale unit. Eight consumable goods
have a native activity that removes one unit when its use is complete; lights are marked spent
after burning out, not when first lit. Reusable lights and the climber's kit have non-consuming
activities. Token lighting, elapsed burn time, fuel transfer and partial quantities remain manual.

Shops are tags, not copies of an item. Tavern, General Store, Alchemist, Blacksmith and Black Market
each have a definition and Merchant Notes. Notes guide the GM; they are never included in generated
Item descriptions or flags. Stock quantities, random inventories and customer purchasing remain
future work. Availability does not automatically include or exclude an item from a build.

## Install and test on The Forge

1. Obtain the packaged ZIP from the successful **Validate and package** GitHub Actions run
   (artifact: `devils-table-framework`), or build it using the development commands below.
   Downloading an Actions artifact may wrap the module ZIP in another ZIP: extract the artifact
   first and select `devils-table-v0.2.0-alpha.4.zip` for import.
2. Back up your test world. In The Forge's Import Wizard, import that module ZIP as a custom package.
   See the [Forge custom-package guide](https://forums.forge-vtt.com/t/how-to-upload-a-modified-version-of-a-module-system/10510).
3. In a V14 / D&D5e 5.3.3 test world, enable **Devil's Table: Goods & Provisions** and reload.
4. As the active GM, open **Configure Settings → Devil's Table → Build/Rebuild Compendiums → Open Builder**.
5. Select **Village General Store → All categories**, then **Validate / Preview**. In a fresh world,
   expect 69 creates. When upgrading a complete alpha.3 Containers pack, expect **56 creates,
   0 updates and 13 unchanged**. Preview leaves the world unchanged.
6. Choose **Build / Rebuild** and confirm. The builder adds the selected items to
   `world.devils-table-items`. Run it again: expect 69 unchanged Items and no duplicates.
7. Review each category's prices, purchase units, icons and weights. Import test copies into an
   actor to check the new use actions. Follow the [live checklist](docs/TESTING.md).

The archive contains exactly one `devils-table/module.json`, alongside its runtime folders.
Do not upload the repository's source-code ZIP as though it were a packaged release.
No install-manifest URL or public release asset is advertised yet: those are added only after
the live acceptance test and an actual versioned release exist.

### Recovering from the alpha.2 read-back error

Keep the existing generated compendium. Import the updated module ZIP using the same Forge
custom-package method, restart/reload the test world and confirm the module shows `0.2.0-alpha.4`.
Run **Village General Store → Containers → Validate / Preview**, then **Build / Rebuild**.
If all 13 Items were saved, equivalent description formatting should now report 13 unchanged.
If any are missing or genuinely different, the normal rebuild creates/updates them with their
existing permanent identities. If verification still fails, copy the full builder report: it now
includes source IDs, field paths and shortened expected/saved values. Do not delete the pack.

## Safe rebuild contract

- Only the active GM can preview/build. Use **one browser tab** for building.
- Preview does not create packs, unlock packs, write Items or save settings.
- A build updates only the builder-controlled fields of its own generated documents.
  Manual edits to those fields will be overwritten: edit canonical JSON instead.
- A conflict, duplicate permanent ID or attempted Item type change aborts before writes.
- A new pack is locked after building. An existing pack's original lock state is restored.
- Actor-owned and world-inventory copies are not updated; the builder only targets its named world pack.
- Foundry batch operations are **not a database transaction**. A disconnect or hook failure can
  leave a partial build. Nothing is deleted; fix the error and rerun the same catalogue to converge.
  Back up the world first. Failed lock restoration is reported, not hidden.
- The local overlap guard and active-GM check are not a distributed lock across tabs/sessions.
- Generated world compendiums remain in the world when the module is disabled or updated.
  They do not travel to other worlds automatically. Pack sharing and retirement are later work.

## Development

Use Node.js 20 or later (CI uses Node 24). There are no npm dependencies and no runtime CDN.
Packaging also requires the standard `zip` and `unzip` commands (for example, in Linux/WSL).

```sh
npm run check       # catalogue, manifest, file/import/syntax checks, then unit tests
npm run package     # rerun checks and write a runtime-only ZIP under dist/
```

CI runs those checks on pushes and pull requests, checks that permanent IDs were not removed
from the ledger, and uploads a testable ZIP. It does not publish releases or deploy anything.
Generated ZIPs and Foundry compendiums are not committed.

## Source contract

Every item requires `id`, `name`, `description`, `price`, `weight`, `icon`, `category`,
`tags`, `shops`, `availability`, `source`, and an explicit supported `mechanics` mapping.
Every new General Store item also specifies `saleUnit`; it is optional for the unchanged original batch.
Names and shop membership may change; IDs such as `DT_ITEM_GS_ROPE_HEMP` must not.
Reserve IDs in the append-only `data/id-ledger.json`; never recycle an old ID.

See [the authoring contract](docs/SOURCE_DATA.md), [architecture and API](docs/ARCHITECTURE.md),
[the complete file inventory](docs/FILE_MAP.md), [the acceptance checklist](docs/TESTING.md),
[CHANGELOG](CHANGELOG.md) and [ROADMAP](ROADMAP.md).

## Publication

This is an unreleased content review build. The project owner has not yet selected a distribution
license. Public-release work includes that decision, icon and text provenance review,
live platform testing, release assets and a real update manifest. A `source.license` string
records provenance; it does not itself grant permission to redistribute content.
