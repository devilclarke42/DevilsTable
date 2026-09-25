# Verification and acceptance

## Automated checks

Run `npm run check` with Node 20+; CI uses Node 24. Tests cover schema failure cases,
cross-file IDs, source paths, HTML escaping, stable IDs, 2014 rules and weight preservation,
read-only preview, conflict detection, no duplicates on rerun, preservation of unrelated data,
lock restoration, partial-write recovery, permission guards and a synthetic 5,000-item validation.
Curated coverage checks all ten category plans, all five Merchant Notes definitions, pricing
boundaries, native capacities and US liquid conversions, metadata isolation, empty-category builds,
full-catalogue validation before filtered writes and stable shared identities across shop builds.
The full General Store adds exact curated-category coverage, sale-unit preservation, six more
native vessels, strict consumable/light validation, stable utility activity IDs, owning-item
consumption targets, reusable actions and simulated upgrades from both the thirteen Containers and the accepted 69-item catalogue.
The alpha.4 baseline had 133 passing automated tests.
Read-back regressions simulate equivalent HTML entity/break-tag serialization, verify stable
reruns and require real price/weight/capacity/identity drift to remain detectable. Mismatch details
are checked for missing Items, bounded output, saved reports and failure during lock restoration.
Stock coverage checks 32 active tables with all 132 IDs reserved, real compendium references, Always guarantees,
80/15/5 ranges, per-shop overrides, empty/exhausted tiers, duplicate-free lists, profile validation
and Merchant Notes isolation. Persistence tests cover table previews, native model preflight,
missing Items, result order, embedded-row changes, foreign metadata preservation, 100-row batches,
partial failure/retry, custom-row protection, independent settings menus and permission guards.
Alpha.7 has 226 automated tests; validation reports 144 source Items and 32 active tables.
Sprint 3 checks frozen hashes of all 69 accepted records (except Container sale-unit additions),
75/13/56 Item upgrades, 12/3/17 table upgrades, normalized name uniqueness, icon references, variant
inheritance/exclusions, private notes and effective-tier quantity rolls. Both rebuilds converge.
Quantity tests exhaust all 100 percentile outcomes per tier/price rule, check complete sale units,
category filtering and invalid distributions. Cleanup tests cover eligible legacy-table retirement and protection of historical source differences, protected
edits/references, exact approval, partial deletion/retry, read-back, locks and the shared guard.
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
| Shop/category controls | Ten categories with counts 13 / 17 / 10 / 21 / 13 / 18 / 12 / 13 / 16 / 11 | Pending for alpha.7 |
| Merchant Notes | Five shop profiles display the three stock tiers; no stock notes in Item data | Pending |
| Preview General Store / All categories | Fresh world: 144 creates; alpha.6 pack: 75 creates, 13 updates, 56 unchanged; no preview writes | Pending |
| Build Containers, then rebuild | 13 native container Items, then 13 unchanged; stable UUIDs | User reported alpha.3 fix worked; full test details unavailable |
| Build all categories, then rebuild | 144 Items, then 144 unchanged; original Containers UUIDs retained | Pending |
| Container sheets | Correct names, descriptions, icons, price, empty mass and capacities | Pending |
| Contained-item encumbrance | Added contents contribute mass once; empty shell remains after contents are removed | Pending |
| Waterskin | Empty 0.5 lb; separately tracked 4 lb water gives 4.5 lb total | Pending |
| Category-only build | Selected category changes; other categories remain untouched | Pending |
| Shared shop build | Alchemist selects Bottle, Flask, Ceramic Jar, Lamp Oil, Charcoal and Ink; no duplicates | Pending |
| New item sheets and icons | All 144 descriptions, sale units, prices and weights are correct; core icons, 15 SVGs and 12 WebPs render | Pending |
| New native vessels | All 21 containers count empty mass plus contents once, including Document Case and Saddlebags | Pending |
| Actor import and use | Import a consumable stack of 3; completed-use action leaves 2, then 1, then removes the final unit; no stale compendium target | Pending |
| Candle/torch timing | Lighting does not auto-remove the item; use its completed-burn action only when spent | Pending |
| Reusable activities | Lamp/lantern/climbing-kit action leaves quantity unchanged and spends no spell slot | Pending |
| Rest and consumables | Spent quantities do not reappear after a short/long rest | Pending |
| Light reference metadata | Lamp 15/45 ft total reach, hooded 30/60, bullseye 60/120 cone; manual token setup and fuel tracking | Pending |
| Original pack lock state | Restored for locked and unlocked packs; newly created pack ends locked | Pending |
| Player permissions | No builder menu; direct write API denied | Pending |
| Wrong target version | Build blocked with an actionable error | Pending |
| Reload world | Settings persist; no automatic pack builds | Pending |

### Stock RollTables and quantities — alpha.7

Use the separate **Build/Rebuild Stock RollTables → Open RollTable Builder** settings button.
Retain the accepted Item pack; stock generation should not change its Items.

| Check | Expected result | Status |
| --- | --- | --- |
| Upgrade from complete alpha.4 Items | Item preview reports 75 creates, 13 sale-unit updates, 56 unchanged; existing prices, weights and UUIDs retained | Pending |
| Separate settings button | Both builder windows open independently; table controls/report work in light/dark themes | Pending |
| Missing Item preflight | Missing referenced Item produces an actionable source-ID error before table writes | Pending |
| All-shop table preview | 32 creates in a fresh world; no pack, lock or settings writes | Pending |
| All-shop table build/rebuild | 32 creates then 32 unchanged, stable parent/result IDs, new pack locked | Pending |
| General Store filter | All profiles previews sixteen tables; each named profile previews four | Pending |
| Category filter | Same four tables; stock results contain only the selected category | Pending |
| Partial shops | Tavern/Alchemist/Blacksmith/Black Market show shared-goods-only notices and no invented products | Pending |
| Item results and nested pools | Native references open actual generated Items; rotating results recurse into the correct pool | Pending |
| Always native draw | Imported General Store Always table returns all 82 Village Always goods in one draw; never Normalize | Pending |
| Rotating ranges | 1–80 Often, 81–95 Rarely, 96–100 no extra; empty pools produce text, not invented goods | Pending |
| Roll Stock | Village has 82 Always goods and up to eight distinct extras; category selection uses its own defaults | Pending |
| Exhausted/empty pool | An empty eligible tier consumes the attempt without promoting rare goods | Pending |
| Read-only rolling | No Item/actor changes, chat messages, saved stock or changed drawn-state | Pending |
| Stale/missing tables | Roll Stock asks for a rebuild and does not silently use an outdated pool | Pending |
| Merchant Notes | Visible in the builder only, absent from table/Item descriptions and flags | Pending |
| Separate last-build records | Item/table summaries remain independent and survive reload | Pending |
| Native imported copies | World-table copies draw correctly; rebuilding packs does not overwrite them | Pending |
| Permissions and locks | Players/inactive GMs cannot build or roll; original table-pack lock restored | Pending |
| Weighted quantities | Positive whole sale-unit counts; price/tier select the documented profile | Pending |
| Rare quantity boundary | Quantity d100 1–95 gives one; 96–100 gives two | Pending |
| Bundle display | Quantity 4 Pitons means four bundles of ten, with 5 sp shown per bundle | Pending |
| Alpha.5 upgrade | 12 new tables, 3 Village pool updates, 17 unchanged; normal builds preserve all old category tables | Pending |
| Legacy cleanup preview/cancel | Exact proposed/protected names shown; cancelling changes no tables or lock | Pending |
| Confirmed eligible cleanup | Only previewed eligible tables removed; all 32 active tables and all Items retained; changed historical sets protected | Pending |
| Protected legacy tables | Edited fields/rows, folders, foreign flags or known incoming links prevent removal | Pending |
| Cleanup repeat/failure | Repeat deletes nothing; interrupted cleanup relocks and requires a fresh preview | Pending |

### Sprint 3 merchant and content acceptance

| Check | Expected result | Status |
| --- | --- | --- |
| Profile selection | Village, Town, City and Wagon buttons change guidance/counts; All profiles disables rolling | Pending |
| Per-profile assortment | Tier counts match the Stock RollTables guide; no duplicate product in a list | Pending |
| Wagon exclusions | No Chest, Barrel, Crate, Firewood, Cooking Tripod, Sledgehammer, Miner's Pick, Wash Board, Door Hinges, Iron Bar or Copper Bar | Pending |
| Effective quantities | Compass uses Rare quantities in Village and Scarce quantities in City; canonical Item is shared | Pending |
| Original content | Accepted 69 IDs, descriptions, prices and weights unchanged; Containers display explicit units | Pending |
| New manual tools | Crowbar, Chain, Block and Tackle and Padlock show their described rules without invented automatic effects | Pending |
| Fuel/rations | Completed sale-unit consumption works for Kindling, Firewood and Travel Rations after actor import | Pending |
| Packaging | No missing source files or module assets; no developer masters or generated databases | Pending |

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

The user subsequently reported alpha.4 worked and said the prices and other goods looked good.
That is catalogue acceptance and a successful build report, without detailed evidence for each
live check. The user also reported alpha.5 worked; the detailed environment/checklist was not
supplied. Alpha.6 quantities and cleanup still require target-environment testing.

Keep existing packs when installing alpha.7. The upgrade adds 75 Items and thirteen sale-unit flags,
and adds twelve tables while updating three Village pools. Prior Item and table identities survive. If verification fails,
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
8. Change one stock override in source: only affected generated tables/results update; Item UUIDs,
   unrelated tables, folders and foreign flags survive. The next build reports unchanged tables.
9. Add a custom result to a generated table: preview/build refuses before unlocking. Keep custom
   tables separate. Do this only in the disposable world, not as the source-authoring workflow.
10. Interrupt an embedded-result update: error is reported and lock restored; retry converges,
    including removal of obsolete generated rows without deleting Items or whole tables.

Synthetic fixtures are not proposed game content. Do not commit or publish an integration-test archive.

## Record a result

Record the commit SHA, Foundry build, D&D5e version, Forge import method, enabled modules,
browser, date, checks passed/failed and relevant console errors. Never include account tokens
or private campaign data. Update this document and the changelog with the real results.
