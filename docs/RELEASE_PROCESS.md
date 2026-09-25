# Release Process

**Status:** official process for test builds and eventual public releases.

The repository is the release source. A generated ZIP, a Foundry compendium or a successful CI run
is an output, not a separate authoring branch. A release must be traceable to its source commit,
version, validation results and target-environment acceptance record.

## Current release model

The current runtime version is `0.2.0-alpha.7`. Installation uses a custom-package ZIP on The Forge.
The archive contains canonical source JSON and runtime code; builders create world compendiums
after installation. It does not contain prebuilt compendium databases.

There is no hosted install-manifest URL or public release asset established by this sprint.
The existing `module.json` is still required inside the module ZIP. GitHub Actions validates and
uploads a test artifact; it does not publish releases. A documentation-only commit may retain the
unreleased runtime version; identify the exact commit when comparing such review artifacts.

## 1. Establish scope and version

Review the intended change against [ROADMAP.md](ROADMAP.md) and the relevant content/design standards.
Separate content, runtime changes, migrations and documentation so reviewers can see the effect
of each. A documentation-only sprint must not modify runtime code, schemas, canonical data or tests.

Use [Semantic Versioning](https://semver.org/) with prerelease identifiers during development:

- `0.2.0-alpha.7` is a review build toward the 0.2.0 milestone, not a claim that stable 0.2.0 shipped.
- Keep `module.json` and `package.json` versions equal when changing runtime/package version.
- Bump a prerelease number for another distinct distributed runtime candidate.
- Use a patch release for a compatible correction after a numbered milestone; a new milestone
  follows the documented minor-version plan. Document migrations during the pre-1.0 period.
- From 1.0 onward, incompatible public contracts require a major version; compatible features
  use a minor version and compatible fixes a patch version.
- Never overwrite an already published version's assets or move its tag to hide a correction.

Implementing early stock-table foundations during 0.2.0 does not complete the later 0.7.0 merchant
milestone. Versioned scope and acceptance criteria determine release readiness.

## 2. Validate source and identity history

Use Node.js 20 or later; CI currently uses Node 24. No npm dependencies or runtime CDN are required.
The packaging commands also require `zip` and `unzip`.

```sh
npm run check
```

This checks canonical items, shop/category definitions, stock and quantity policies, reservations,
supported mappings, manifest consistency, runtime files/imports, JavaScript syntax and tests.
The current baseline is 144 Items, 32 active tables and 226 passing tests. Re-evaluate counts when
approved content changes; a count is evidence of this build, not a permanent quota.

CI compares both ID ledgers with the push/PR base revision. For a local checkout with history, the
same validator can inspect the preceding commit:

```sh
node tools/validate-data.mjs "$(git rev-parse HEAD^)"
```

Do not remove retired reservations, ignore failed checks, patch generated database rows, or
substitute a synthetic test fixture for real production content. Human review still covers writing,
balance, icon appearance, source rights and editorial requirements not enforced by a schema.

## 3. Review the changelogs and documentation

Update [docs/CHANGELOG.md](CHANGELOG.md) with user-visible milestone/release changes using
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) categories: Added, Changed, Deprecated,
Removed, Fixed and Security as applicable. Omit empty categories. Keep upcoming work under
Unreleased and date an actual release when it happens; do not fabricate a historical release date.

Retain the root [build changelog](../CHANGELOG.md) for detailed alpha-build records. Update affected
standards, source/API documentation, file inventory, migration guidance and acceptance notes. An
entry must explain behaviour and upgrade consequences, not merely list filenames or commit subjects.
Source JSON remains the authority for numeric catalogue values when illustrative documentation ages.

## 4. Build in the target world

Use a backed-up or disposable Forge world running Foundry V14 and D&D5e 5.3.3. Record the exact
Foundry build, browser, enabled modules and installation method. Operate as the active GM in one tab.

1. Install the candidate ZIP, enable the module and reload. Confirm the expected version.
2. Open **Build/Rebuild Compendiums → Open Builder** in module settings.
3. Preview the intended Items. A fresh complete catalogue creates 144. An alpha.6
   69-item pack previews 75 creates, 13 sale-unit updates and 56 unchanged; a current pack reports 144 unchanged.
4. Build, then rebuild. Confirm stable IDs, resolved icons, correct price/weight/sale-unit data and
   no duplicates. Check container contents and native activities where applicable.
5. Open the separate **Build/Rebuild Stock RollTables → Open RollTable Builder**.
6. Preview/build **All shops → All categories**. A fresh world creates 32 tables; each merchant profile uses four.
   Rebuilding those tables should report 32 unchanged. An alpha.6 pack needs twelve creates,
   three pool updates and seventeen unchanged tables, retaining all twenty prior identities. Referenced Items must already exist.
7. Roll several shops and categories with **Roll Stock & Quantities**. Check guaranteed essentials,
   category isolation, duplicate prevention, weighted quantities and sale-unit interpretation.
8. Test native table references/draws separately. Builder quantity rolls do not imply that native
   table draws also supply quantities or that merchant inventory is persisted.

The targets are `world.devils-table-items` and `world.devils-table-stock-tables`. Never treat
manual pack edits as source changes. Actor/world copies remain independent of compendium rebuilding.

## 5. Exercise upgrade and recovery paths

For an alpha.5 world, confirm that all 20 existing whole-shop identities are retained while normal builds
preserve the 100 superseded category tables. Cleanup is optional and separately confirmed:

1. Back up the world and ensure the compact shop tables are current.
2. Preview legacy cleanup for the intended scope and read the exact removal/protection list.
3. Review links outside the scanned stock pack/world RollTables, particularly journals, macros
   and other compendiums. Protected edited tables may legitimately remain.
4. Confirm the reviewed IDs. Remove only the eligible IDs shown by the current preview; retain all 32 active tables.
   Older category names/membership may no longer match the expanded catalogue, so even unedited
   historical tables can remain protected. Do not promise removal of all 100 or bypass this check.
5. Re-preview after interruption; check lock restoration and the independent cleanup report.

Also test rebuild recovery, permission denial and real read-back differences in a disposable copy.
Batch writes/deletes are not atomic transactions. A prior ZIP alone is not a backup of user data
or deleted legacy tables. Rollback requires the known-good package and the corresponding world
backup when data has been migrated or removed.

Use [TESTING.md](TESTING.md) to record actual results. Broad user success reports are useful but
do not stand in for detailed live checks. Do not set a manifest `verified` value merely because
unit tests passed.

## 6. Package and inspect the archive

```sh
npm run package
unzip -l dist/devils-table-v0.2.0-alpha.7.zip
```

`npm run package` reruns checks and builds the runtime allowlist. Use the filename generated from
the candidate's actual version when it changes. Verify:

- Exactly one `devils-table/module.json` at the correct directory level.
- Runtime scripts, templates, styles, source data, schemas, documentation and referenced project
  assets are present and match the intended commit.
- Tests, fixtures, developer tools, dependencies, Git metadata, editor masters and generated
  compendium databases are absent.
- The manifest and package source versions agree; no nonexistent download or manifest URL is advertised.

Do not install GitHub's generic source-code ZIP as a substitute for this runtime package. An Actions
download may wrap the module ZIP in another ZIP; extract the artifact first and import the inner
`devils-table-v0.2.0-alpha.7.zip` with The Forge's custom-package Import Wizard. The
[Forge custom-package guide](https://forums.forge-vtt.com/t/how-to-upload-a-modified-version-of-a-module-system/10510)
describes that installation route.

## 7. Publish only a reviewed release

Before a public release, the owner must select the distribution licence, review text/artwork rights,
complete live acceptance, and approve the release scope. Prepare the changelog and migration notes,
tag the exact validated commit, and attach the checked runtime ZIP to the corresponding GitHub Release.
Retain its commit, checksum, supported versions and acceptance record.

A hosted installation/update manifest is a later explicit release step. Create real versioned assets
first, then use their actual URLs and test a clean install/update through those links. Do not add
placeholder URLs or advertise Forge verification that has not been demonstrated. CI artifact upload
alone does not satisfy these publication steps.

Once published, correct mistakes with a new version and a clear change note. Keep the previous
release and rollback instructions available. Rebuilding a local world must continue to preserve
canonical identities and user data according to the documented migration contract.

## Release evidence record

For each candidate, record the source commit/version, validation and CI results, archive checksum,
exact runtime environment, install method, checks performed, observed failures and recovery steps.
Keep account tokens, campaign secrets and private player data out of repository logs. A release is
ready when another maintainer can reproduce the package and understand the limits of its verification.
