# Sprint 5 live validation report

**Status:** blocked before implementation; no live Foundry session available.  
**Target:** Foundry VTT V14, D&D5e 5.3.3, one GM and two ordinary player accounts.  
**Date:** 2026-09-25.

## Environment and evidence

The repository checkout supplies Node development tools, generated content and module source,
but no running Foundry server, test world, installed V14 application, or GM/player logins.
The connected browser has only a blank tab. A Node test or a source inspection cannot prove
Foundry's permission, token interaction or multiplayer behaviour. Therefore no merchant runtime
code is started and none of the first three validations is recorded as passing.

| Validation | Observed result | Required live evidence |
| --- | --- | --- |
| 1. Non-owner right-click and Shop UI | **Not tested.** No running Foundry world or Shop UI exists. | GM-only linked NPC with stock; player without Actor ownership right-clicks token, opens test Shop UI, reads sanitized stock; verify native NPC sheet and private Actor flags remain inaccessible. Record actual menu/HUD events and screenshot. |
| 2. Two players browse simultaneously | **Not tested.** No two player sessions are available. | Open the same shop on two ordinary accounts; both search and change separate local baskets while GM edits merchant stock; verify refreshed views, no inventory write from browsing and no private information on either client. |
| 3. Single active checkout with continued browsing | **Not tested.** No GM/player sessions or checkout pipeline exist. | Submit two near-simultaneous requests; exactly one reaches GM review, the other gets a friendly Busy result and keeps its basket. Both can continue browsing. Repeat across disconnect/reconnect and two GM sessions before claiming exclusive service. |
| 4. Native D&D5e currency exposure | **Source verified; runtime untested.** D&D5e 5.3.3 mixes `CurrencyTemplate` into the common Actor model used by NPCs. The schema declares `system.currency` as a mapping of nonnegative integer counts keyed from `CONFIG.DND5E.currencies`; the model derives coin weight under its own system setting. No wallet writes were attempted. | In the live disposable world, inspect a PC and NPC `system.currency`, modify one denomination through the native Actor sheet and document update hooks/read-back. Identify any official D&D5e public helper for value conversion before using it; otherwise make reviewed standard Actor updates to native fields. |

[D&D5e 5.3.3 common Actor template](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/actor/templates/common.mjs) ·
[currency model](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/shared/currency.mjs) ·
[NPC model](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/actor/npc.mjs).
Reading the schema confirms storage, **not** a verified public transfer or conversion API.

## Exact test setup needed

1. Supply an accessible disposable V14 world with D&D5e 5.3.3, this module installed and a GM
   plus two distinct non-GM accounts; no production campaign data is needed.
2. Create one world NPC merchant with **no player ownership**, a linked visible token and two
   ordinary embedded Items with distinct quantities and prices. Give each player a controlled
   PC token beside the merchant. Record world/system/module versions and Actor ownership levels.
3. Test the non-owned token interaction first. A disposable test harness may probe the right-click
   event and open a placeholder window; this is validation instrumentation, not Sprint 5 merchant
   implementation. If no safe right-click hook works, record the exact events and propose a
   token-scoped alternative before changing the approved player flow.
4. Test two simultaneous views and one service slot in the same world, including simultaneous
   submission, GM close/reject/approve and GM disconnect. Observe who owns the lock and when it
   releases. Avoid relying on independent per-client lock flags.
5. Inspect PC/NPC currency through Foundry's native Actor APIs and sheet; record data types,
   update result and read-back. Do not perform an actual purchase or transfer as part of this
   prerequisite.

## Current design recommendation and limits

A GM-side coordinator should grant one short-lived service slot keyed by merchant Actor UUID;
read-only stock projections and client-local baskets do not acquire it. This is a recommendation,
**not a concurrency result**. Multiple GM arbitration and socket sender attribution still need
live proof before a secure request pipeline can be declared complete. A standard module socket
relays messages and must not be treated as an authenticated transaction server without verification.
Keep public shop payloads limited to stock already approved for disclosure to all players.

The existing [data model](DATA_MODEL.md) keeps current stock on embedded Actor Items. Merchant
flags hold configuration, availability, relationships and a ledger reference, while full receipts
belong to a separate GM-only store; copying receipts or Item stock into an Actor flag would grow
every Actor update and duplicate live state. The newly requested Last 500 history default can
be recorded as a GM setting and optional merchant override, with Last 100, Last 1000 and Unlimited.
Retention applies to approved **and rejected** receipts and must never silently remove an active
recovery record. The exact storage and retention process need a live ledger proof before coding.

**Next gate:** obtain the disposable live world and record observed outcomes above. Only then
start the Shop UI and checkout-request foundation. Actual inventory/currency transfers,
negotiation, relationship mutations and restocking remain outside Sprint 5.
