# Sprint 5 live validation report

**Status:** proof build implemented at `0.2.0-alpha.8`; live acceptance pending.  
**Target:** Foundry VTT V14, D&D5e 5.3.3, one GM and two ordinary player accounts.  
**Date:** 2026-09-25.

## Environment and evidence

### Alpha.10 screenshot and alpha.11 optional population

The owner's screenshot shows the Shop UI open but still displaying Loading stock. This
establishes window visibility in that screenshot, not successful stock delivery or checkout.
Alpha.11 routes the GM's own request locally and reports a browse timeout after 12 seconds.
The owner separately authorised optional NPC population from existing stock tables; the new
GM preview/apply action uses table quantities and preserves existing inventory. It does not
implement purchases, currency transfers or automatic restocking.

### Alpha.9 retest and alpha.10 correction

The owner confirmed linked-token setup and merchant enablement, but still saw no shop on
player right-click. Code inspection found that `refreshStock` used an unforced initial render.
Foundry V14 documents that ApplicationV2 only adds a new window to the DOM when rendering is
forced. Alpha.10 uses `render({ force: true })` and has a regression check for that lifecycle.
This confirms a code defect; the user's live retest must establish whether it resolves their
complete interaction path.

[Foundry V14 ApplicationV2 rendering](https://foundryvtt.com/api/v14/classes/foundry.applications.api.ApplicationV2.html#render).

### Alpha.8 player entry failure and alpha.9 correction

The owner reports that right-clicking the merchant token as a player did nothing in the
merchant test. Alpha.9 replaces token event listeners with a canvas DOM pointer listener,
using `canvas.canvasCoordinatesFromClient` and visible Token bounds. It also enables the
missing module socket channel. Automated tests cover the event routing and hit detection;
the corrected non-owner entry still needs the owner's live retest.

### Owner-reported baseline observations — 2026-09-26

The owner reports that a player cannot open an unowned merchant Actor sheet and that
right-clicking its token produces no menu or other interaction. Both PC and NPC sheets show
native currency boxes. The exact installed module version was not confirmed. These observations
confirm the reported baseline permission behaviour and visible currency fields; they do not
validate the alpha.8 custom token entry, Shop UI, currency update API or multiplayer service slot.
The next live check is the packaged alpha.8 build after enabling the NPC in Merchant Setup.

The repository checkout supplies Node development tools, generated content and module source,
but no running Foundry server, test world, installed V14 application, or GM/player logins.
The connected browser has only a blank tab. After the owner asked for a module to test in their
own world, a limited Sprint 5 proof build was implemented. A Node test or a source inspection
cannot prove Foundry's permission, token interaction or multiplayer behaviour. The first three
validations remain untested and cannot be recorded as passing.

| Validation | Observed result | Required live evidence |
| --- | --- | --- |
| 1. Non-owner right-click and Shop UI | **Not tested live.** Token right-click listeners and a separate Shop UI are packaged for the owner to try. | GM-only linked NPC with stock; player without Actor ownership right-clicks token, opens test Shop UI, reads sanitized stock; verify native NPC sheet and private Actor flags remain inaccessible. Record actual menu/HUD events and screenshot. |
| 2. Two players browse simultaneously | **Not tested.** No two player sessions are available. | Open the same shop on two ordinary accounts; both search and change separate local baskets while GM edits merchant stock; verify refreshed views, no inventory write from browsing and no private information on either client. |
| 3. Single active checkout with continued browsing | **Not tested live.** One active GM client holds an in-memory service slot per NPC; disconnect/failover is unverified. | Submit two near-simultaneous requests; exactly one reaches GM review, the other gets a friendly Busy result and keeps its basket. Both can continue browsing. Repeat across disconnect/reconnect and two GM sessions before claiming exclusive service. |
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
3. Install alpha.8, enable the NPC in the new Merchant Setup settings menu and test the
   non-owned token right-click. If the token does not open the Shop UI, record the exact behaviour
   before changing the approved player flow.
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

The existing [data model](DATA_MODEL.md) keeps current stock on embedded Actor Items. In this
proof build merchant flags hold configuration, availability, dormant relationship/restock fields
and short **demonstration decision summaries**. They contain no stock copy, transaction transfer
or server-authenticated identity. The world history retention setting defaults to Last 500,
with Last 100, Last 1000 and Unlimited. Long-term full receipts still belong in a separate GM-only
ledger: an Actor flag holding unlimited full history would become expensive to synchronize.
Do not enable unlimited retention for high-volume merchants before ledger migration. Actual
receipt retention and recovery records need live ledger proof before Sprint 6.

**Next gate:** run the packaged proof build in a disposable live world and record observed
outcomes above. Do not claim merchant acceptance or implement real transfers before that.
Actual inventory/currency transfers,
negotiation, relationship mutations and restocking remain outside Sprint 5.


### Alpha.12: player stock timeout follow-up

User screenshots show 101 public offers on the GM and a stock timeout on the player.
This confirms local inventory projection, but not cross-client delivery. The cause
is not established by the screenshots. Alpha.12 supplies the acknowledgement callback
shown in Foundry's module socket example and logs packet send/acknowledgement/receipt
when debug logging is enabled. GM processing failures return a safe error response.
Reference: https://github.com/foundryvtt/foundryvtt/issues/582

Retest after installing alpha.12 and fully stopping/starting the Forge game server,
then reconnecting GM and player. Refresh stock on the player. A server restart tests
whether previously loaded module socket configuration was stale; it is not a proven
root cause. If the timeout persists, capture both clients' console entries with debug
logging enabled, including any errors. Do not change Actor ownership.

A separate-client automated relay test passes with the player's Actor collection
inaccessible. It verifies application message handling, not a live Foundry server.
Basket and review display now convert copper accounting totals to gp/sp/cp; wallets
are neither converted nor updated. Total suite: 238 passing tests.


### Alpha.13: live browsing confirmed; rejection write under investigation

The user confirms players now see public offers. Their screenshot also shows the
player waiting while the GM reviews checkout. This confirms player stock browsing
and delivery into GM review; it does not prove simultaneous multi-player locking.

Rejection reports a history-save failure. The provided screenshot omits the original
`Merchant history failed` exception. A Setting permission error references
`time-clock.mjs`; there is insufficient evidence to link that error to our Actor write.
No permission changes or changes to other modules are made.

Alpha.13 narrows the update to the history flag, serializes review decisions and
includes the actual error in the GM notification. A failed save leaves the review
open for retry or Close. Tests cover failure, retry, rejection receipt, preserved
relationships and lock release. If live rejection still fails, collect the complete
new notification or expanded original history exception. Total: 239 passing tests.


### Owner acceptance before Sprint 6

The owner reported alpha.13 worked and authorized Sprint 6 real transfers. This records their
acceptance of the preceding fix; it does not imply that five-player contention or currency
transfers were live-tested during Sprint 5. Sprint 6 evidence is recorded separately.
