# Content Completeness

**Audience:** maintainers, contributors and GMs. **Purpose:** record implementation progress against the unchanged 241-entry SRD equipment baseline.

## Review state

Milestone 2B is in development on `milestone-2b-core-catalogue`, based on merged Milestone 2A at main `30741d4cdc389ee632fab3434677358063d8b975`. The installed module version remains 0.3.29; this branch is not a new published release.

## Essential equipment batch

Eight Items are added in one indexed source file, with eight new ledger reservations. Existing 440 item records, prices, weights and identities are retained. Canonical totals are 448 Items and 40 services. All eight previously missing source entries are represented: 133/241, or 55.19%. No multiple-merchant assignment is counted twice.

General Store: 152 Items; Tavern: 205; Blacksmith: 75; Alchemist: 42; Fence: 48. The 26 templates, 25 stock profiles and 100 active RollTable identities are retained. New goods appear in appropriate inherited pools, with explicit specialist exclusions.

Native container capacities, supported tool bases, original descriptions and intentional price/weight adjustments are described in [Core Catalogue](CORE_CATALOGUE.md). [Current coverage](content/CATALOGUE_COVERAGE.json) follows the frozen [Milestone 2A matrix](audits/CATALOGUE_COVERAGE.json); the audit baseline is not rewritten.

## Validation

The eight-item gate passed: all **420 tests** (412 existing plus eight focused regression tests), source/manifest validation and documentation links. In-memory compendium upgrade creates eight documents with zero changes to the released 440; repeat full and shared-merchant builds converge. All 100 table plans rebuild twice with stable identities. Stock tests exercise the eight additions, exclusions and settlement scaling. A baseline hash fixture protects every field of all 440 released Item records. No live Foundry world is attached; automated plans and in-memory builder convergence do not certify live world regeneration.

## Related documents

[Core Catalogue](CORE_CATALOGUE.md), [Source Data](SOURCE_DATA.md), [Milestone 2A Audit](audits/CATALOGUE_AUDIT.md).

## Approval gate before the adventuring batch

The initial eight-item gate is complete. Further implementation is paused at the brief's requirement: “If an important catalogue addition requires framework changes, document the requirement and request approval before implementing it.” No schema, converter or runtime logic has been modified.

### Proposal 1 — Generic limited-use consumables

The current non-native consumable converter authors `system.uses.max = "1"`; consumed use removes one complete sale unit. A Healer's Kit requires ten uses. Neither an infinite reusable trinket nor ten separate kits correctly represents one ten-use kit.

Proposed change: add an optional bounded positive integer `mechanics.use.maxUses` (default one, legal only for consuming uses), map it to the native Item uses maximum and retain one-owning-Item-use consumption per activity. Keep 2014 action costs and existing auto-destruction semantics. Use the same contract for any limited-use mundane consumable, with no Healer-specific branch, healing automation or transaction changes.

Before shipping, verify omitted-field outputs remain identical for every existing Item, ten uses exhaust exactly one kit, stacked kits behave correctly, invalid limits fail closed and source/native read-back converges. Native stabilization is not promised; the initial kit can describe its 2014 stabilization effect for GM resolution while accurately tracking ten charges. Update the sale-unit/consumption standard to distinguish a kit from one charge. This proposal is not implemented.

### Proposal 2 — Generic native spellcasting-focus mapping

The pinned D&D5e system represents focus Items as equipment with `system.type.value = "trinket"`. The module's current native equipment validator permits only light/medium/heavy/shield and requires an armour AC. It cannot accept a real focus without either extending that contract or misclassifying it as generic loot.

Proposed change: permit the supported native trinket equipment subtype and its reviewed focus properties, without requiring an armour AC for a trinket. Validate the exact pinned-system field shape and all twelve audited focus/symbol source units. Retain class/component restrictions in original descriptions; no active spell effect, automatic costly component payment or bespoke merchant code. Existing armour validation remains strict. This proposal is not implemented.

### Subsequent decisions retained for review

- **Equipment packs:** propose native container bundle definitions with a complete contents manifest and explicit GM unpacking/fulfilment until a separately reviewed generic contents-transfer workflow exists. Do not list an empty decorative container as a delivered full pack. No seven pack records have been created yet.
- **Existing gaming sets:** keep their current IDs and loot types until a migration-safe remap is approved; the two known native tool gaps remain. No extra copy is created to evade a type conflict.
- **Dragonchess / Three-Dragon Ante:** the names in the prompt are not entries in the frozen SRD 5.1 tools table. No redistribution basis for direct non-SRD content was established; no such content is imported. Independently designed generic games can be proposed separately with clear original provenance.
- **Livestock commodities:** use an agreed manual handover/booking representation rather than fake carried-animal loot with invented body weights. The six livestock trade entries remain pending alongside the later commodity batch.
- **Padlocks, potion rarity and original-source branding:** retain existing canonical records. Padlock consolidation and rarity need separate migration/data-contract decisions; source title cleanup is not mixed into the first expansion batch.

The other content-only batches remain authorized, but have not been started past this required review stop. No claim is made that Milestone 2B as a whole is complete. Once the two generic contracts are approved, continue the adventuring/spellcasting batch, then tools/instruments, pack representation and trade goods, with a separate validation commit after each batch.
