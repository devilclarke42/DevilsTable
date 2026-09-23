# Verification and acceptance

## Automated checks

Run `npm run check` with Node 20+; CI uses Node 24. Tests cover schema failure cases,
cross-file IDs, source paths, HTML escaping, stable IDs, 2014 rules and weight preservation,
read-only preview, conflict detection, no duplicates on rerun, preservation of unrelated data,
lock restoration, partial-write recovery, permission guards and a synthetic 5,000-item validation.
Containers coverage adds all eight category plans, all five Merchant Notes definitions, pricing
boundaries, native capacities and US liquid conversions, metadata isolation, empty-category builds,
full-catalogue validation before filtered writes and stable shared identities across shop builds.
The full General Store adds exact curated-category coverage, sale-unit preservation, six more
native vessels, strict consumable/light validation, stable utility activity IDs, owning-item
consumption targets, reusable actions and a simulated upgrade from 13 to 69 without rewriting
the original Items. All 133 automated tests pass for alpha.4.
Read-back regressions simulate equivalent HTML entity/break-tag serialization, verify stable
reruns and require real price/weight/capacity/identity drift to remain detectable. Mismatch details
are checked for missing Items, bounded output, saved reports and failure during lock restoration.
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
| Shop/category controls | Eight categories with counts 13 / 12 / 6 / 11 / 7 / 9 / 6 / 5 | Pending for alpha.4 |
| Merchant Notes | Five shop profiles display the three stock tiers; no stock notes in Item data | Pending |
| Preview General Store / All categories | Fresh world: 69 creates; existing complete Containers pack: 56 creates, 0 updates, 13 unchanged; no preview writes | Pending |
| Build Containers, then rebuild | 13 native container Items, then 13 unchanged; stable UUIDs | User reported alpha.3 fix worked; full test details unavailable |
| Build all categories, then rebuild | 69 Items, then 69 unchanged; original Containers UUIDs retained | Pending |
| Container sheets | Correct names, descriptions, icons, price, empty mass and capacities | Pending |
| Contained-item encumbrance | Added contents contribute mass once; empty shell remains after contents are removed | Pending |
| Waterskin | Empty 0.5 lb; separately tracked 4 lb water gives 4.5 lb total | Pending |
| Category-only build | Selected category changes; other categories remain untouched | Pending |
| Shared shop build | Alchemist selects Bottle, Flask, Ceramic Jar, Lamp Oil, Charcoal and Ink; no duplicates | Pending |
| New item sheets and icons | All 56 new descriptions, sale units, prices and weights are correct; all 15 SVGs render | Pending |
| New native vessels | Pot, kettle, cup, bowl, wash bucket and feed bag count empty weight plus contents once | Pending |
| Actor import and use | Import a consumable stack of 3; completed-use action leaves 2, then 1, then removes the final unit; no stale compendium target | Pending |
| Candle/torch timing | Lighting does not auto-remove the item; use its completed-burn action only when spent | Pending |
| Reusable activities | Lamp/lantern/climbing-kit action leaves quantity unchanged and spends no spell slot | Pending |
| Rest and consumables | Spent quantities do not reappear after a short/long rest | Pending |
| Light reference metadata | Lamp 15/45 ft total reach, hooded 30/60, bullseye 60/120 cone; manual token setup and fuel tracking | Pending |
| Original pack lock state | Restored for locked and unlocked packs; newly created pack ends locked | Pending |
| Player permissions | No builder menu; direct write API denied | Pending |
| Wrong target version | Build blocked with an actionable error | Pending |
| Reload world | Settings persist; no automatic pack builds | Pending |

### Reported alpha.2 failure

The user reported: "Read-back verification failed; some generated fields do not match the source."
The original report did not identify the Item or field. Source inspection and an automated
simulation reproduced false mismatches for Backpack and Waterskin when an HTML save decoded
`&#39;` to an apostrophe. This establishes a comparison bug, not the complete cause of the live
failure. Alpha.3 fixes that case and supplies detailed reports for any remaining differences.

Following the alpha.3 fix, the user replied, "That worked great," and authorised the seven
remaining categories. This records a successful user-reported recovery; no exact Foundry build,
browser, enabled-module list or detailed acceptance results were supplied. It is not evidence
that every check above, particularly alpha.4's new activities, has passed.

Keep the existing pack when installing alpha.4. Preview/build should recognise already saved
Items and add the newly authored stock under their permanent identities. If verification fails,
record the full item/field report and module version before making another change.

## Recovery and upgrade checks — disposable development copy only

The packaged General Store catalogue now exercises real Item writes directly. Additional destructive
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
