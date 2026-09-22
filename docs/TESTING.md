# Verification and acceptance

## Automated checks

Run `npm run check` with Node 20+; CI uses Node 24. Tests cover schema failure cases,
cross-file IDs, source paths, HTML escaping, stable IDs, 2014 rules and weight preservation,
read-only preview, conflict detection, no duplicates on rerun, preservation of unrelated data,
lock restoration, partial-write recovery, permission guards and a synthetic 5,000-item validation.
Containers coverage adds all eight category plans, all five Merchant Notes definitions, pricing
boundaries, native capacities and US liquid conversions, metadata isolation, empty-category builds,
full-catalogue validation before filtered writes and stable shared identities across shop builds.
Foundry globals are injected/mocked where needed. These tests do **not** execute the proprietary
Foundry server or prove Forge compatibility.

Run `npm run package` with `zip` and `unzip` available. Packaging verifies its allowlist,
contains exactly one `devils-table/module.json`, and excludes tests, developer tools, Git metadata,
dependencies and generated compendium databases. The source catalogue is included unchanged.

## Live acceptance — pending

Use a backed-up/disposable world. Do not mark the manifest `verified` until results are recorded.

| Check | Expected result | Status |
| --- | --- | --- |
| Forge custom-package import | Module appears with the expected title/version | Pending |
| Enable on V14 / D&D5e 5.3.3 | No module-origin console errors | Pending |
| GM settings menu | Builder opens; report is legible in light/dark themes | Pending |
| Shop/category controls | All eight General Store categories appear; only Containers has authored items | Pending |
| Merchant Notes | Five shop profiles display the three stock tiers; no stock notes in Item data | Pending |
| Preview General Store / Containers | 13 creates in a fresh world; no pack or settings writes | Pending |
| Build Containers, then rebuild | 13 native container Items, then 13 unchanged; stable UUIDs | Pending |
| Container sheets | Correct names, descriptions, icons, price, empty mass and capacities | Pending |
| Contained-item encumbrance | Added contents contribute mass once; empty shell remains after contents are removed | Pending |
| Waterskin | Empty 0.5 lb; separately tracked 4 lb water gives 4.5 lb total | Pending |
| Empty planned category | Zero selected; no new pack or document deletion | Pending |
| Shared shop build | Alchemist selects Bottle, Flask and Ceramic Jar; rebuilding creates no duplicates | Pending |
| Original pack lock state | Restored for locked and unlocked packs; newly created pack ends locked | Pending |
| Player permissions | No builder menu; direct write API denied | Pending |
| Wrong target version | Build blocked with an actionable error | Pending |
| Reload world | Settings persist; no automatic pack builds | Pending |

## Recovery and upgrade checks — disposable development copy only

The packaged Containers catalogue now exercises real Item writes directly. Additional destructive
or source-editing scenarios belong in an isolated development checkout and disposable world:

1. Rename Bottle in source and repackage: one update, same UUID. Never change its permanent ID.
2. Add a separate user-created Item and another module's flag to the pack: both survive a rebuild.
3. Change Bottle's price, select Alchemist and rebuild: only Bottle updates; other categories/shops survive.
4. Test a conflicting ID or duplicate managed source ID: abort without writing.
5. Disconnect during a larger synthetic build: failure is visible, lock restoration is attempted;
   reconnect and rerun to converge without deleting unrelated data.
6. Remove an item from active source without dropping its reserved ID: pack Item remains.
7. Import a generated Item into an actor, edit source and rebuild: actor copy remains unchanged.

Synthetic fixtures are not proposed game content. Do not commit or publish an integration-test archive.

## Record a result

Record the commit SHA, Foundry build, D&D5e version, Forge import method, enabled modules,
browser, date, checks passed/failed and relevant console errors. Never include account tokens
or private campaign data. Update this document and the changelog with the real results.
