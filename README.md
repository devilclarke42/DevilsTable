# Devil's Table: Goods & Provisions

A long-term Foundry VTT module for reusable goods, provisions and shop catalogues.
**This repository is the project's single source of truth.** Canonical JSON is authored here;
Foundry compendiums are generated from it and must never be edited as source data.

## Current status

Sprint 2 framework, `0.2.0-alpha.1`. There are **zero production items** in this revision.
Automated tests use a synthetic parcel that is excluded from the module ZIP.
No earlier ZIP or Tavern catalogue has been imported or silently replaced.

The target is Foundry V14 and D&D5e **5.3.3**, with the **2014 rules** baseline and
author-supplied adjusted weights for Variant Encumbrance. No world encumbrance settings
are changed. This is intended for The Forge, but live Foundry/Forge acceptance testing
is still required. The manifest deliberately does not claim verified compatibility.

## What the framework does

- Loads a registry of source JSON files, with bounded parallel reads.
- Validates every item and permanent ID before writing anything.
- Converts ordinary goods to D&D5e `loot` documents using 2014 source rules and exact adjusted weights.
- Provides a GM settings window with read-only validation/preview and a confirmed build action.
- Creates or updates one world Item compendium: `world.devils-table-items`.
- Preserves internal document IDs, unrelated entries, folders and other modules' flags.
- Batches writes in groups of 100 and checks the result against the source.
- Never deletes items. Inactive catalogue entries stay in the pack until an explicit retirement workflow is added.

Shops are tags, not copies of an item. The registry currently names Tavern, General Store,
Alchemist, Blacksmith and Black Market. Dedicated shop interfaces and additional mechanical
item types are future work, not hidden features in this release.

## Install and test on The Forge

1. Obtain the packaged ZIP from the successful **Validate and package** GitHub Actions run
   (artifact: `devils-table-framework`), or build it using the development commands below.
   Downloading an Actions artifact may wrap the module ZIP in another ZIP: extract the artifact
   first and select `devils-table-v0.2.0-alpha.1.zip` for import.
2. Back up your test world. In The Forge's Import Wizard, import that module ZIP as a custom package.
   See the [Forge custom-package guide](https://forums.forge-vtt.com/t/how-to-upload-a-modified-version-of-a-module-system/10510).
3. In a V14 / D&D5e 5.3.3 test world, enable **Devil's Table: Goods & Provisions** and reload.
4. As the active GM, open **Configure Settings → Devil's Table → Build/Rebuild Compendiums → Open Builder**.
5. Choose **Validate / Preview**. This revision should report zero items and no changes.
6. Choose **Build / Rebuild** and confirm. The empty catalogue does not create or clear a compendium.

The archive contains exactly one `devils-table/module.json`, alongside its runtime folders.
Do not upload the repository's source-code ZIP as though it were a packaged release.
No install-manifest URL or public release asset is advertised yet: those are added only after
the live acceptance test and an actual versioned release exist.

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
Names and shop membership may change; IDs such as `DT_ITEM_GS_ROPE_HEMP` must not.
Reserve IDs in the append-only `data/id-ledger.json`; never recycle an old ID.

See [the authoring contract](docs/SOURCE_DATA.md), [architecture and API](docs/ARCHITECTURE.md),
[the complete file inventory](docs/FILE_MAP.md), [the acceptance checklist](docs/TESTING.md),
[CHANGELOG](CHANGELOG.md) and [ROADMAP](ROADMAP.md).

## Publication

This is an unreleased framework build. The project owner has not yet selected a distribution
license. Public-release work includes that decision, icon and text provenance review,
live platform testing, release assets and a real update manifest. A `source.license` string
records provenance; it does not itself grant permission to redistribute content.
