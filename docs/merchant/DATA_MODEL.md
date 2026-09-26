# Merchant data model — Sprint 4 approved design

**Status:** approved long-term design. Alpha.14 implements the transfer subset described in
[the Sprint 6 report](SPRINT_6_TRANSACTIONS.md). Legacy Sprint 5 summaries remain untouched on
Actors; new full receipts use a private JournalEntry compendium. Some fields below remain future
design, notably apparent identities, negotiation details, unlimited stock and restocking.
All quantities and coin counts below are nonnegative safe integers. Identifiers are stable within a
world. Names and prices are mutable. Schema versions apply to merchant state and ledger entries
independently; unknown future fields remain untouched during migration.

## Where state lives

| Document / location | Source of truth | Read / write access |
| --- | --- | --- |
| World D&D5e `npc` Actor | Existing NPC identity; merchant configuration and bounded relationship map under `flags.devils-table.merchant`; native `system.currency` wallet | GM writes and opens Actor sheet; players see only a sanitized Shop UI response |
| NPC embedded Item | Actual sale stock, `system.quantity`, item description/mechanics, per-offer flag for price, unlimited supply, origin and restock policy | GM writes; player sees a whitelisted stock view |
| Linked scene Token | Shop entry point and position/elevation; refers to the world merchant Actor | No merchant wallet or relationship state copied to token flags |
| Player world Actor and embedded Item | Owned funds and possessions; source for goods offered in sale | GM commits approved trades; owner can still edit through normal Foundry permissions |
| Dedicated GM-only world JournalEntry compendium | One transaction receipt per GM decision, including recovery stages and searchable metadata | GM writes/reads; no player access |
| GM settings | Default range, optional change policy and retention/display policy | GM configures; not merchant inventory |
| Source JSON | Item catalogue, shop profiles and future editable template definitions | Repository authoring only; never current world inventory |

**Why no custom Document type:** Foundry already supplies Actors, embedded Items, JournalEntries,
flags, ownership and compendium search indexes. A separate database for each merchant would duplicate
these primitives. The transaction compendium is a world store, never a generated content pack.

### Actor merchant flag, schema version 1 (conceptual)

| Field | Type and rule | Meaning |
| --- | --- | --- |
| `schemaVersion` | positive integer | Enables explicit migrations; never guess legacy fields. |
| `merchantId` | unique permanent world identifier | Retained across renames and token replacements; copy/import collision triggers an explicit new identity or deliberate migration. |
| `shopProfileId`, `stockProfileId` | registered shop/profile identifiers, nullable only by GM review | Select catalogue stock suggestion; the Actor Item remains authoritative. |
| `templateId` | optional template identifier | Records starting preset, not continuing ownership of notes/stock. |
| `enabled`, `walletMode`, `availability` | boolean / enums | Actor merchant opt-in; finite or infinite merchant funds; GM-selected Open, Closed, Busy, Travelling or Sleeping. The active checkout service slot provides effective Busy without overwriting this field. |
| `buyModifier`, `sellModifier` | bounded, GM-editable price factors | Apply to merchant buying from the PC and selling to the PC respectively. Default 100%; calculate integer copper values with a displayed rounding rule, then permit GM line overrides. These are offer prices, not rewrites of Item source prices. |
| `publicNotes`, `gmNotes` | sanitized text, length-limited | Public flavour and private GM editing. Both remain local to this Actor. |
| `greetings` | editable state → sentence | Plain-language suggestions; use neutral default if missing. No game effect. |
| `relationships` | map keyed by world PC Actor ID | Bounded summaries; details below. Unbounded history stays in the ledger. |
| `companionLinks` | optional map of companion Actor ID → owning PC Actor ID | GM-approved relationship lookup only; neither Actor's relationship record is copied or merged. |
| `revision`, `historyRef`, `historyRetention` | monotonic integer, optional ledger reference, optional retention override | Helps detect stale proposals and locate receipts; retention defaults to the GM setting. Full receipts never live in Actor flags. No claim of atomic compare-and-swap. |

Native Actor and Item sheets remain usable. Replacing the merchant's entire NPC or Item array from
a stock table is forbidden. Multiple linked tokens may represent the same merchant; unlinked
tokens create ActorDelta copies and are excluded until the GM explicitly resolves that identity.

### Embedded offer flag, schema version 1

| Field | Type and rule | Meaning |
| --- | --- | --- |
| `offerId` | permanent per-merchant identifier | Distinguishes two offers using the same catalogue Item; an embedded Item's `_id` remains Foundry-owned. |
| `origin` | `generated`, `manual` or `trade-in` | Restock policy and provenance; not an Item mechanic. |
| `sourceUuid`, `sourceId` | optional UUID / Devil's Table ID | Lineage only; not used to rewrite an actor copy when a compendium changes. |
| `saleUnit` | optional positive display description | Uses Devil's Table metadata when present; otherwise use the compatible Item's own unit/quantity. |
| `publicDescription` | optional GM-approved plain text | Safe player description for external Items; do not publish embedded GM secrets by default. |
| `unitPrice` | optional nonnegative integer in copper units, with a display denomination | Per-merchant selling price, separate from canonical Item price; quote math uses the integer only. |
| `unlimited`, `restockEnabled`, `targetQuantity` | booleans and bounded integer | Unlimited offers never decrement; opted-in finite offers restock up to target. |
| `suppressRestock`, `lastManagedQuantity` | boolean and nullable integer | Manual removal or unexplained sheet edit stops silent repopulation until GM resolves it. |

Unflagged compatible Items can be sold at a GM-reviewed native D&D5e price with stock equal to
their actual quantity. An Item with an unsupported price shape is still a valid Item, but its
offer needs a GM price before checkout. Two lines merge into a stack only if full system/flag
state and uses match; unique gear and items with contents remain distinct unless explicitly
approved as a complete transfer. Existing equipped, attuned or nested goods require a review
warning; a GM may deliberately transfer a compatible full Item without stripping metadata.

### Relationship record per customer PC

| Field | Meaning |
| --- | --- |
| `customerActorId` | Stable key for one world PC Actor. Renaming a PC does not reset familiarity. |
| `lastUserId` | Optional contextual user identity; never the primary relationship key. |
| `firstMeetingAt`, `lastVisitAt` | UTC timestamps of GM-confirmed meetings/trades; optional recorded world time alongside each. Mere browsing does not write a first visit. |
| `transactionCount`, `spentMinor`, `receivedMinor` | Counts and values in exact base units; amounts reflect settled trade only, not tips mislabelled as purchases. |
| `negotiationsSucceeded`, `negotiationsFailed` | Count GM-accepted outcomes on committed trades; a roll alone does not change history. |
| `state`, `notes` | GM-selected descriptive state and private editable notes. |

States: **Unknown** (implicit when no record exists), **Recognises**, **Regular**, **Trusted**,
**Friend**, **Suspicious**, **Dislikes**, **Hostile**, **Banned**. The GM controls transitions;
transaction count alone does not promote a state. A banned customer cannot checkout unless the
GM explicitly overrides the block. State influences greeting and advisory negotiation DC only.
Relationships have no character-sheet bonus, automatic refusal or player-visible raw state.
An independently controlled PC always has its own record even when its User account matches
another PC. The optional companion link affects which record a merchant uses for a specific
interaction, not ownership of either Actor; the GM can unlink it without deleting history.
Future identity selection must keep actual Actor ID and an optional apparent encounter identity
separate in private receipts, so disguise rules can be added without retroactive relationship
merging. No detection roll or disguise rule is implemented now.
If a merchant grows beyond a reviewed actor-flag size or relationship count, a later version
migrates older records to GM-only ledger pages with bounded current summaries; it never silently
truncates notes or duplicates customer records.

### Transaction receipt

Each ledger JournalEntry has a permanent `transactionId` used for retry/idempotency, merchantId,
merchant Actor UUID, actual PC Actor UUID, optional apparent identity reference, requester User ID, GM approver ID, requested/decided/committed
UTC timestamps (as applicable), optional world time, source scene/token IDs, mode and schema
version. Its metadata includes status: `rejected`, `approved-pending`, `committing`, `completed`
or `needs-recovery`. Retain the proposed and GM-final lines: Item ID/UUID, full display name and
sale unit at the time, direction, amount, unit and line price, source/destination Actor, quantities,
discount kind/value, negotiation skill/DC/roll/result/GM disposition, coin tender/change/payout
per denomination, pre/post actor revisions, override reason and any failure reason. A rendered
GM-readable receipt accompanies structured flags. Refuse duplicate `transactionId` retries and
preserve the previous outcome instead of repeating writes.

**Indexing:** store small merchantId/customerId/date/status metadata in top-level JournalEntry flags
for a bounded compendium index query. Fetch full receipts only for the selected merchant/date/
customer/status page. The compendium is GM-only, separate from generated Items/RollTables.
Rejection entries are made only after an explicit GM decision. A checkout request waiting on the GM
exists in client memory, not as a persistent Item, reservation or journal entry.
The GM-configured history policy is **Last 500** by default, or Last 100, Last 1000 or Unlimited;
an individual merchant may override it. It applies to final approved and rejected decisions,
but never removes an active `needs-recovery` record. Define exact retention and export behaviour
after verifying the proposed ledger store in live Foundry. No receipt body is duplicated in the
Actor merchant flag.
Each explicit rejection must save date, PC, merchant, attempted trade, any negotiation result,
approval status `rejected` and final outcome, visible only to GMs. If the ledger is unavailable,
the GM receives an error and must reconcile the decision before the service slot is released.

## Native D&D5e wallet and settlement

D&D5e 5.3.3 PCs and NPCs use the native Actor currency model. Supported baseline counts are
`cp`, `sp` and `gp`, with integer values **1, 10 and 100 copper**. D&D5e also defines `ep`
and `pp`; other compatible denominations can be added through a validated, reversible integer
conversion map. Never use floating-point gold for settlement. Reject unknown or fractional
conversion instead of silently dropping coins. Keep the actor's other currency keys intact.
The module never creates coin Items, a separate wallet database or an alternative character-sheet
currency field. An infinite wallet is a merchant policy for affordability, not a second balance;
display the native currency values and leave unlimited funding transparent to the GM.

| Settlement policy | Suggested transaction and required GM approval |
| --- | --- |
| **Native currency** (default) | Quote and check value using D&D5e Actor currency. Show a GM-reviewable denomination breakdown and write approved changes to the existing Actor currency fields. A finite merchant must have enough total value to buy goods; an infinite merchant bypasses only its own funds limit. Respect the installed system's verified conversion rules. |
| **Optional exact-change check** | On the same native wallet, require a possible tender/change combination from available denominations before approval. If none exists, the GM chooses a revised tender, overpayment, barter or manual settlement. This is an optional validation policy, not a separate coin system. |
| **GM-edited settlement** | The GM may edit the proposed native currency deltas or approve explicit barter; the final receipt shows the adjustment. Never mark unsettled payment completed. |

For a 7 sp purchase paid with 1 gp, the merchant owes 3 sp (or 30 cp, if available) when
exact-change checking is enabled. If it has neither and the buyer lacks exact tender, the GM chooses exact payment,
explicit overpayment/tip, another supported mix of coins, goods in lieu of change, or a manual
edit. There is no automatic completion. A net sale to the merchant reverses the coin direction;
selling and buying in one basket may be settled as a net trade, with both directions shown.
Goods given instead of change are explicitly added as a discounted/free purchase line with their
own inventory delta; a tip/overpayment is a separate receipt amount. Neither hides an unexplained
imbalance in the purchase price or silently creates goods.
All coin deltas must balance or carry an explicit GM-authorized gift/fee/barter entry. Changes
affect native coin weight according to the world's D&D5e currency-weight setting; the module
does not alter that setting.

When exact-change checking is enabled, the solver must search finite combinations without inventing denominations. If a request
exceeds its safe search budget, return “GM settlement required,” **not** “insufficient change.”
Native system helpers may be used only after verifying their exact 5.3.3 semantics for physical
coin handling. The GM sees an independent pre/post coin-count diff in every mode.
