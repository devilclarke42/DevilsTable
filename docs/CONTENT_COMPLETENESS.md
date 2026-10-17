# Content Completeness

**Audience:** maintainers, contributors and GMs. **Purpose:** record source-unit coverage, delivered catalogue batches and remaining exceptions against the unchanged 241-entry SRD baseline.

## Review state

Milestone 2B changes are on `milestone-2b-core-catalogue`, based on merged Milestone 2A at main `30741d4cdc389ee632fab3434677358063d8b975`. The installed version remains 0.3.29. This branch is pending owner review; it is not a published release. Equipment packs and livestock remain unresolved exceptions, so full core-catalogue completion is not claimed.

## Results

| Metric | Milestone 2A baseline | Development branch |
| --- | --- | --- |
| Canonical Items | 440 | 518 |
| Services | 40 | 40 |
| SRD equipment units represented | 125/241 | 203/241 |
| SRD representation | 51.87% | 84.23% |
| Automated tests | 412 | 436 |
| Merchant templates / stock profiles / active tables | 26 / 25 / 100 | 26 / 25 / 100 |

The 78 new Items represent 78 newly covered SRD units. Merchant memberships are not extra canonical Items: General Store 222, Tavern 205, Blacksmith 78, Alchemist 61 and Fence 51. All 440 released source records are preserved in full, including original prices, weights, types and identities. No existing content was remapped to correct the two gaming-set gaps. No additional original product is counted toward the SRD denominator.

[Current coverage](content/CATALOGUE_COVERAGE.json) follows the frozen [Milestone 2A matrix](audits/CATALOGUE_COVERAGE.json), retaining all 241 source IDs. Representation is distinct from complete mechanics: inherited audit findings and price-review flags remain visible. The custom-economy policy is approved; those historical flags do not mean SRD prices should replace existing prices.

## Delivered batches

| Batch | New Items | Cumulative Items | SRD units | Passing test gate |
| --- | --- | --- | --- | --- |
| Essentials: pouch, spellbook, two tools, two projectile containers, ladder, pole | 8 | 448 | 133/241 (55.19%) | 420 |
| Adventuring gear, clothing and twelve focus/symbol variants | 34 | 482 | 167/241 (69.29%) | 430 |
| Fifteen missing artisan sets and ten instruments | 25 | 507 | 192/241 (79.67%) | 433 |
| Grain, flour, cotton, spices and three bullion metals | 11 | 518 | 203/241 (84.23%) | 436 |

All 95 audited adventuring-gear units are now represented. All 35 tool units are represented; 33 use native tools and two existing gaming sets retain their released loot types pending migration review. All eleven additional commodities have explicit purchase units, SRD comparisons, project price/weight rationale and stock assignments. Product details are in [Core Catalogue](CORE_CATALOGUE.md).

## Native behaviour and stock

The owner approved two generic data-contract additions on 2026-10-16: optional bounded `mechanics.use.maxUses` and native equipment `trinket` support. Existing defaults remain unchanged. The Healer's Kit tracks ten uses per kit; its stabilization effect is GM-resolved. Focus Items use the pinned native equipment type and `foc` property, without granting spellcasting or waiving costly components. Clothing uses native non-armour equipment. Hazard items describe their 2014 effects; automatic attacks, damage, terrain effects and conditions are not supplied.

New tools use native base-item associations, abilities and check activities from D&D5e 5.3.3. Possession does not grant proficiency. Source references and core icons were checked against official system commit `965ad2d0cf5d063dac675ba078b5bd3c3c0dd449`; no core artwork was copied into the module.

Village pools keep specialists optional; city profiles broaden selection. Portable/travelling and specialist profiles exclude unsuitable stock using existing data filters. Wheat and flour are ordinary Always goods. Gold and platinum remain Rarely, including city shops, with one-or-two-unit quantities. Bullion is shared across stores, blacksmiths and fences; existing valuable-goods visibility rules apply without merchant-specific runtime code. No new stock-table identity is needed.

## Validation and compatibility

`npm run check` passes documentation links/provenance, source/schema/manifest validation and all 436 tests. The old transaction, service, recovery and integration tests remain. Snapshot checks protect every field of all 440 released source Items and generated output of all 448 pre-extension Items. Native charge tests exercise the isolated upstream D&D5e consumption helper: nine uses retain a kit, the tenth exhausts one, and a remaining stacked kit resets correctly.

In-memory compendium upgrades create 78 Items with zero updates to the released 440; repeated full and shared-merchant builds converge. All 100 table plans rebuild twice with stable identities and no duplicate results. Price, mass, units, native tools, icon references, merchant sharing, settlement scaling, stock exclusions and coverage identities are checked.

These are source/planning and in-memory checks against the Foundry 14 / D&D5e 5.3.3 target. No live Foundry campaign world is attached; UI, full native world regeneration and multiplayer acceptance still require supported-world testing. Rebuild Item and Stock RollTable compendiums in that world before rolling changed stock. Native contents transfer is deliberately guarded.

## Remaining exceptions and recommended resolution

- **Seven equipment packs:** native populated-container checkout is refused, and the Item factory cannot create a contents tree. [Equipment Pack Fulfilment](EQUIPMENT_PACKS.md) records every pack, source benchmark, canonical component quantities and unresolved components. Review manual GM fulfilment/project bundle pricing first; separately approve any generic bundle/transfer work. No empty container is misrepresented as a complete pack.
- **Six livestock commodities:** chicken, goat, sheep, pig, cow and ox need an agreed per-animal handover representation. They are not authored as carried loot with invented body weights. Recommended review: GM-managed animal Actor handover or a manual booking/fulfilment service, with clear payment and delivery responsibilities, before adding purchasable records.
- **Twenty-five transport units:** eight mounts, eleven additional tack/land-vehicle units and six water vehicles remain for a later transport content batch. Together with packs and livestock these account for all 38 unrepresented entries.
- **Two existing gaming sets:** preserve IDs and released loot types until a migration-safe native-tool remap is approved. Dragonchess and Three-Dragon Ante are not entries in the frozen SRD 5.1 tools table; no non-SRD text was imported without a redistribution basis.
- **Existing padlocks, potion rarity and legacy source branding:** preserve released canonical records. Consolidation, rarity/schema changes and source-title cleanup require separate reviewed changes rather than silently altering installed content.
- **Licensing:** SRD 5.1 mechanics retain CC-BY-4.0 attribution; copied native helper retains its MIT notice. New descriptions are original project wording. The project's overall distribution licence remains pending owner selection; it was not changed here.

## Related documents

[Core Catalogue](CORE_CATALOGUE.md), [Equipment Pack Fulfilment](EQUIPMENT_PACKS.md), [Source Data](SOURCE_DATA.md), [Content Standard](CONTENT_STANDARD.md), [Source Notices](SOURCE_NOTICES.md), [Milestone 2A Audit](audits/CATALOGUE_AUDIT.md).
