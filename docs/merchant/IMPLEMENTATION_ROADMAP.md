# Merchant System implementation roadmap — Sprint 4 approved design

**Status:** owner-approved direction with required changes; live proofs precede Sprint 5 merchant code. The existing
[versioned roadmap](../ROADMAP.md) currently lists Tavern as 0.3.0 and Merchant Builder as 0.8.0.
The user requested merchant-system work before Tavern. Review the version ordering with this
specification; do not renumber published milestones or start Tavern as part of Sprint 4.

## Sprint 4: design review completed

- Review [specification](MERCHANT_SYSTEM_SPECIFICATION.md), [data model](DATA_MODEL.md),
  [wireframes](UI_WIREFRAMES.md), [workflows](WORKFLOW_DIAGRAMS.md) and
  [requirement challenges](TECHNICAL_JUSTIFICATION.md).
- Approved 2026-09-25: GM-only merchant Actor and dedicated player Shop UI; D&D5e Actor currency
  with optional denomination checks, finite/infinite funds and buy/sell modifiers; per-PC memory
  with optional GM-linked companions and future apparent identities; mandatory private rejection
  receipts; Open/Closed/Busy/Travelling/Sleeping availability.
- These are design changes only. No runtime schema exists to migrate from Sprint 4.

## Sprint 5 entry proofs: block automation until resolved

| Proof | Acceptance evidence |
| --- | --- |
| Non-owned token entry | In a V14 / D&D5e 5.3.3 disposable world, a player can right-click a visible, unowned linked NPC merchant token and choose Browse; normal HUD/control use still works; grid/gridless adjacency is measured correctly. |
| Dedicated Shop UI and permissions | Open the Shop UI and browse stock as a player with no merchant Actor ownership; confirm the NPC sheet and flags remain inaccessible. Record player/GM permissions, precise clicks, observed behaviour and an alternative token entry point if right-click is unavailable. |
| Concurrent browsing and exclusive checkout | Two non-GM players browse one merchant simultaneously. Submit competing checkouts; exactly one enters GM review, the other sees Busy while retaining their basket. Reconnect/retry and test the last finite Item; document actual results and the recommended coordinator/slot design. |
| Request identity | Verify a requester's User ID from a server-validated source, not a forged payload; reject attempts to trade as a PC the requester does not own. If the module socket cannot provide this, choose an authenticated alternative before enabling player checkout. |
| Authority and failover | Two connected GMs cannot both commit the same merchant/customer operation; disconnection mid-commit moves the record to recoverable state rather than replaying it. |
| D&D5e Item and currency models | Preflight native NPC/PC currency fields and sale-unit/price/quantity mappings for target 5.3.3. Check owned Item transfer with arbitrary compatible Item flags, uses and contents. |
| Ledger and confidentiality | Read-only player cannot read merchant relationship notes, GM notes or ledger, including via Actor flags/API; GM can index and open receipts without scanning every record. |
| Public projection delivery | Another player's client cannot extract restricted stock or private relationship context from a socket packet. Only GM-approved universally public stock may use the normal broadcast path. |

Run and document the first three proofs **before writing any Merchant System code**. If live
Foundry cannot provide a suitable right-click entry without Actor ownership, document the
limitation and propose a token-scoped alternative for owner review. Concurrent checkout may
require a GM-authoritative service slot, since independent client locks are insufficient.
If any proof fails, revise the specification with the owner. Do not silently weaken checkout
attribution or call a multi-document write atomic to meet a schedule.
The current environment and pending checks are recorded in
[SPRINT_5_VALIDATION.md](SPRINT_5_VALIDATION.md). A disposable Foundry world with two player
accounts is required before implementation begins.

## Proposed implementation slices after approval

1. **Native NPC setup and migration.** Add schema validation, merchant opt-in flag, availability,
   native currency policy, buy/sell modifiers, stock-profile
   selection, linked-token enforcement, neutral templates and GM-only editing. Imported Actors
   default to nonmerchant; duplicate merchant IDs are detected, never silently shared.
2. **Dedicated Shop UI, public projection and local basket.** Use the validated unowned-token entry, range/scene
   checks, sanitized Item descriptions, paged search, accessible UI and zero writes from browsing.
   Revalidate range and recipient permissions on every checkout request.
3. **GM approval and exclusive slot.** Implement one GM coordinator, merchant/customer locks,
   quote freshness, stock validation, sales review and one approval window. Reject and occupied
   requests leave source Actors unchanged, but GM rejections create private receipts. Test two players trying the last unit.
4. **Native currency and transfers.** Reuse D&D5e Actor currency and compatible system conversion
   helpers; add optional bounded finite change checking only if needed, with a GM-editable preview. Test 7 sp paid with 1 gp with and
   without 3 sp/30 cp change, tips, no money, merchant buying from a PC, infinite wallets and
   additional currencies. Preserve native Item metadata on transfers.
5. **Negotiation and relationships.** GM-initiated skill/DC, player roll, advisory discount,
   editable greetings and one PC-specific relationship update after a completed trade. Test
   shared users, multiple PCs, linked companions, distinct apparent identity and the GM's no-roll option. Do not implement disguise checks yet.
6. **Restocking, ledger and recovery.** Top up missing approved quantities; protect deleted or
   directly edited offers. Write paged/searchable receipts and stage checkpoints; rehearse
   interruption after each Actor/ledger write and recover without double charges or stock.
7. **Integration and release review.** Full V14/D&D5e 5.3.3/Forge multiplayer acceptance with
   one and two GMs, intermittent connections, permission tests, accessible UI and realistic
   actor/receipt volumes. Update schema docs, implementation roadmap, changelog and packaging;
   retain a rollback procedure based on a world backup, not a ZIP alone.

## Performance and maintainability targets

Validate with at least **500 merchant Actors**, **1,000 catalogue Items**, several PCs per shop,
and **10,000 archived transactions** in a disposable world. Measure initial load, one-merchant
browse/search, approval, GM history lookup, payload sizes and memory on client/Forge; set budgets
from observed hardware/network results before declaring a stable limit. Architecture invariants:

- Loading a world never traverses every merchant's embedded inventory or every ledger record.
- Browsing requests only the chosen merchant, and returns bounded, paged, sanitized data.
- Search uses a bounded compendium index query; full receipts are fetched on demand.
- A restock touches opted-in offers of **one** merchant and never overwrites an unrelated Item.
- Write counts are bounded, retries are idempotent, and interrupted commits are visible to the GM.
- Unknown Items, future currency keys and unrelated flags are retained during validation/migration.

## Migration from the current repository

Sprint 4 changes no runtime state. The current `0.2.0-alpha.7` Item and RollTable builders
continue generating world compendiums from canonical JSON. Merchant Actors are **new**, opt-in
world documents; do not auto-convert pre-existing NPCs, import arbitrary merchant data, or edit
world compendiums on module activation. The GM seeds an individual NPC from a reviewed stock
profile or adds manual Items. A copied catalogue Item becomes an actor-owned instance and
is never regenerated by subsequent catalogue builds.

At the first implementation release, a migration preview reports eligible Actors, duplicate
merchant IDs, copied/unlinked tokens, unsupported Items/currencies and ledger availability.
After a world backup and GM action, migrate one NPC at a time, write a schema version only on
successful validation and preserve existing Actor IDs, Items, prices, notes and other-module
flags. On a later schema version, migrations stay explicit, restartable and independently
verified. No new inventory or monetary operation is included in a data-only migration.

The milestone numbering decision is deliberately exposed for review: either schedule this
foundation within a pre-Tavern implementation phase or revise the official 0.3.0–0.9.0 map
together. Both choices keep Item IDs and existing generated table identities unchanged. No
merchant feature, public release, Tavern catalogue or runtime compatibility claim is shipped by
this specification sprint.
