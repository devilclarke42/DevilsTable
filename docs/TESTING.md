# Verification and acceptance

## Automated checks

Run `npm run check` with Node 20+; CI uses Node 24. Tests cover schema failure cases,
cross-file IDs, source paths, HTML escaping, stable IDs, 2014 rules and weight preservation,
read-only preview, conflict detection, no duplicates on rerun, preservation of unrelated data,
lock restoration, partial-write recovery, permission guards and a synthetic 5,000-item validation.
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
| Validate empty production catalogue | Zero items; explicit empty-catalogue note | Pending |
| Build empty catalogue | No new pack and no document deletion | Pending |
| Player permissions | No builder menu; direct write API denied | Pending |
| Wrong target version | Build blocked with an actionable error | Pending |
| Reload world | Settings persist; no automatic pack builds | Pending |

## Nonempty integration check — disposable development copy only

The production archive deliberately ships without test stock. To exercise actual Item writes,
create an isolated development checkout/world; do not edit a production installation or commit
test stock as catalogue content. In that copy only, put the single synthetic fixture in the empty
General Store array and reserve its ID in the local ledger. Package that copy and import it into
the disposable test world, then:

1. Preview: one create, zero updates. No pack exists yet.
2. Build: one ordinary good with 2014 source rules, the fixture's exact weight/price and both shop tags.
3. Rebuild: one unchanged item, no extra documents, stable Item UUID.
4. Rename the fixture in source and repackage: one update, same UUID.
5. Add a separate user-created Item and another module's flag to the pack: both survive a rebuild.
6. Test originally locked and unlocked packs: their original state is restored.
7. Test a conflicting ID or duplicate managed source ID: abort without writing.
8. Disconnect during a larger synthetic build: failure is visible, lock restoration is attempted;
   reconnect and rerun to converge without deleting unrelated data.
9. Remove the fixture from active source without dropping its reserved ID: pack Item remains.
10. Import a generated Item into an actor, edit source and rebuild: actor copy remains unchanged.

The fixture is not proposed game content. Do not publish the integration-test archive.

## Record a result

Record the commit SHA, Foundry build, D&D5e version, Forge import method, enabled modules,
browser, date, checks passed/failed and relevant console errors. Never include account tokens
or private campaign data. Update this document and the changelog with the real results.
