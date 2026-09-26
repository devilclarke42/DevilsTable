# Sprint 6 — Transactions

## Status and scope

Alpha.14 implements real GM-approved purchases, sales and mixed baskets. The General Store
catalogue and generated stock tables are unchanged. Player browsing and the previous rejection
fix were accepted by the owner before this sprint. **Live Sprint 6 acceptance is pending.**
Automated tests use document and transport doubles; they are not a substitute for a Foundry server.

## User workflow

The player controls an owned character token, opens the Shop UI, adds purchases and optionally
offers possessions from the selling section. Both directions remain temporary until approval.
The UI displays the character's native wallet and the net amount payable. It disables checkout
when the character cannot afford that amount and checks again before sending. Sales can fund
purchases within the same basket. The GM independently quotes and checks both wallets before
opening review and again before applying an approval. No client-supplied price is authoritative.

The GM sees the merchant, character, player, buy/sell lines, editable unit prices in copper,
quantities and before/after coin balances. Quantities may be reduced to zero to omit a line;
adding goods or increasing requested quantities requires a new request. Recalculate shows a
revised offer. Approval of edited fields first recalculates and requires another approval click.
Reject and Close create private decision receipts without changing inventory or currency.
If the player disconnected or no longer confirms the pending request, approval stops.

Merchant Setup exposes finite/infinite funds, optional denomination checking and multipliers.
Defaults are finite funds, ordinary value settlement and 1× in both directions. Fractions such
as 0.5 are allowed; prices round to the nearest copper. Infinite funding leaves the merchant's
native wallet unchanged and is recorded explicitly in the receipt. It does not waive the
character's ability to pay. Native currency in containers is not included in either wallet.

## Modules and responsibilities

| File | Responsibility |
| --- | --- |
| `settlement.js` | Wallet valuation, modifiers, native deduction planning and bounded exact-denomination validation |
| `trade-model.js` | Current buy/sell quotes, GM edit validation and conservative Item equivalence |
| `transaction.js` | Serialized Actor writes, persisted plans, read-back, compensation and recovery |
| `ledger.js` | Private compendium creation, receipts, duplicate decision protection and retention |
| `service.js` | Public stock relay, request confirmation, one review per merchant and GM decision routing |
| `shop-app.js` | Temporary purchase/sale baskets and player affordability display |
| `review-app.js` | GM offer editing, currency review and guarded decision buttons |
| `manager-app.js` | Merchant configuration, existing stock population and explicit recovery |

## Native APIs and request authority

D&D5e 5.3.3 `CurrencyManager.getActorCurrencyUpdates` provides a pure deduction plan. The module
uses that result and native `Actor.update({"system.currency": ...})`, with compensating writes
under its transaction ledger. The system's immediate transfer helper is not used because the
module must coordinate the wallet writes with inventory and recovery. Existing Actor currency
remains canonical; there is no parallel wallet or coin Item system.

The supported cp/sp/ep/gp/pp rates are checked against the installed system configuration.
Unknown funded denominations, unsafe totals and non-integer coin counts fail before transfer.
Ordinary settlement permits native change-making; the receiver is credited in copper.
Optional denomination checking instead finds a balanced transfer of existing denominations
between finite wallets. It returns a GM-settlement-required error if its search budget expires,
rather than falsely claiming that no solution exists. No overpayment is silently accepted.

The public module socket does not authenticate its `userId` field. Before GM review and approval,
the coordinator queries that specific Foundry User using native `User.query` and asks the
module on that client for its locally pending request. The returned packet must match exactly.
There is no fallback to an unconfirmed socket identity. This confirms the active request at the
addressed client; live V14 query routing is an explicit acceptance test. The GM still checks
character ownership and current source documents. No returned client success message can move
stock, currency or private history.

Source references inspected during implementation:

- [D&D5e 5.3.3 CurrencyManager](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/applications/currency-manager.mjs)
- [D&D5e native currency model](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/shared/currency.mjs)
- [Foundry V14 User.query](https://foundryvtt.com/api/classes/foundry.documents.User.html#query)
- [Foundry V14 query registration](https://foundryvtt.com/api/variables/CONFIG.queries.html)
- [Foundry V14 compendium operations](https://foundryvtt.com/api/classes/foundry.documents.collections.CompendiumCollection.html)

## Inventory and memory

The merchant's embedded Items remain the only inventory source. Transfers preserve Item system
data, descriptions, effects and non-operational flags. Merchant-specific `offer` settings do not
travel to the recipient. Document identity, ownership, folder, sort and modification metadata are
not copied as mechanical content. Destination Items are normalized through the configured native
Item document class before the plan is saved.

Only full mechanically equivalent states stack; names and catalogue IDs are insufficient.
Containers, Items with effects and Items with limited uses never stack automatically. Equipped,
attuned or nested Items and nonempty containers are refused until prepared on their native
sheets. Item references belonging to other modules may need additional integration; no blanket
claim of compatibility with arbitrary third-party automation is made.

Merchant stock decreases to zero without deleting the offer, preserving future restock identity.
A fully sold character Item is deleted; rollback recreates it with its original ID and data.
Received third-party goods remain private until the GM supplies their public offer description.

Settled trades update `merchant.relationships.<characterId>`: first/last trade timestamps,
visits, transaction count, money spent, money earned and successful purchase count. One completed
trade counts as one confirmed visit. Browsing/rejection does not create a visit. Existing notes
and descriptive states are preserved; reputation does not advance automatically. Free purchases
still count as successful purchases. No user-wide relationship sharing is introduced.

## Persistence, locking and recovery

One active GM coordinator handles a merchant's review. Additional checkout requests receive an
occupied response; browsing never takes that lock. The settlement engine also locks both Actor
IDs within the coordinator, preventing a character from spending concurrently at two merchants.
Use one browser session for that active GM. Same-account multiple GM tabs and server-level
compare-and-swap are not supported guarantees.

A private JournalEntry compendium contains the intended operations and before/after states
before any transfer. Its ownership is configured and checked against non-GM Users. Receipt IDs
are derived from the request ID, so an already completed/rejected decision cannot be reapplied.
A rolled-back attempt can be retried and retains a summary of its previous failure.

Both Actors receive a `transactionPending` receipt reference. Each operation is checkpointed,
precondition-checked, written with native document APIs and read back. Final verification covers
all affected fields. Currency writes precede Items, followed by merchant memory and completion.
The module does not claim that these separate server writes are atomic.

On failure, compensation runs in reverse. A step is restored only if it still matches its saved
post-state; already unchanged steps are skipped. Conflicting external edits are not overwritten.
The receipt and Actor markers persist if compensation cannot complete. New trades involving
those Actors are refused. **Check / recover interrupted trade** resumes compensation or clears
completed markers after a reload. Missing receipts or conflicting edits require GM reconciliation;
there is no unsafe "clear lock anyway" action. Active recovery records are excluded from retention.
A disconnect with an uncertain server write can require manual reconciliation rather than an
unverified automatic retry.

Completed and rejected receipts are searchable in the native compendium by date, merchant,
character and status. Last 500 is the default retention; Last 100, Last 1000 and Unlimited are
supported. Old Sprint 5 Actor summaries remain untouched as historical proof-build records.
They are not copied into the new ledger. Retention failures do not reverse an already completed
trade; they are logged for a later attempt.

## Automated validation

The repository suite passes **254 tests**. New coverage includes:

- UI affordability disables checkout and prevents sending an unfunded request.
- GM-side insufficient funds and absent request confirmation prevent review.
- Two, three and five simulated clients contend for the final item: one review, one approved
  transfer, no duplicate sale, and public browsing continues for every client.
- Direct concurrent settlement also preserves total money and quantity.
- Buying, selling, mixed net settlement, finite/infinite wallets and denomination shortages.
- Identical stacks merge; differing state remains separate; nested goods are refused.
- Item creation failure and partial creation compensate stock and both wallets.
- Conflicting edits remain intact and leave recovery markers rather than being overwritten.
- A rejected trade creates a private receipt without changing stock or money.
- Duplicate receipt decisions are refused; repeated review clicks do not race.

## Live acceptance procedure

Use a backed-up test world, one active GM session and the exact target Foundry/system versions.

1. Give a character 1 gp and the merchant an Item priced at 7 sp. With ordinary currency mode,
   buy it. Confirm the character has 3 sp worth of currency, the merchant gains 7 sp worth,
   one Item moves, and the receipt and character-specific memory agree.
2. Set the character below the basket value. Confirm Checkout is disabled. Also reduce funds
   after requesting a trade: approval must fail without moving stock.
3. Sell an unequipped Item to a funded merchant. Adjust its offer, recalculate and approve.
   Confirm the player is paid, their quantity decreases and the merchant receives the Item.
4. Repeat with an underfunded merchant, then infinite funding. Only the infinite policy may
   pay beyond the merchant's balance; its native balance remains unchanged.
5. Enable denomination checking. Test 1 gp paying 7 sp with and without 3 sp change available.
   Shortage must stop settlement; sufficient existing denominations must balance exactly.
6. With two, then three, then five separate player clients, request the last copy simultaneously.
   Confirm one review, continued browsing and exactly one copy delivered. Resubmit stale baskets;
   none may buy the sold-out item.
7. Reject and close requests; verify private receipts and unchanged possessions. Confirm a
   player cannot view the transaction compendium or merchant notes.
8. On a disposable copy, interrupt a trade and test the recovery action. Check both Actor
   wallets, Items and memory against the receipt. Do not reuse campaign state until reconciled.

Record Foundry/system versions, other enabled modules and each observed result. These live tests
have not been performed by the assistant and must not be marked passed from the automated suite.

## Alpha.15 approval correction

The first live approval report exposed malformed HTML: a missing closing quote on the
trade row's direction attribute caused the quantity-input lookup to return null. This
failed before settlement. Alpha.15 fixes the attribute, validates the form fields and
keeps failed recalculations from replacing the last reviewed edits. The suite now has
256 passing tests, including a real HTML parse of the template row. Live approval still
requires retesting; no successful transfer is inferred from this fix.

## Alpha.16 existing receipt correction

The owner reported that approval failed and Close/Reject then trapped the review. The supplied
stack is from dismissal: an existing receipt prevented another receipt with the same request ID.
The original approval exception is not visible. Alpha.16 resolves existing receipts by state:
completed remains completed; a pre-write attempt (`attempted: -1`) or rolled-back attempt can be
closed/rejected; a potentially partial attempt can be dismissed while retaining its recovery
plan and blocking both Actors. No duplicate trade is performed. Reload both clients after
installation. If Merchant Setup reports pending recovery, use its recovery action before
requesting another trade. Do not delete private receipts to bypass recovery.

Receipt verification now uses detached JSON snapshots and reports the first differing path.
The suite passes 257 tests. Live approval remains to be retested; if it fails, capture the first
approval error before trying Close so the original failure can be distinguished from dismissal.

## Alpha.17 transfer diagnostic and setup layout

The owner confirms Close/Reject work in alpha.16. Approval reaches transfer verification but
reports only `Transfer read-back failed`. The screenshot does not identify the failed operation
or field. Alpha.17 adds those details to the GM error and console log without relaxing
verification, accepting altered Item data or bypassing rollback. The cause remains unconfirmed;
collect the new first error on live retest. The repository has 258 passing tests.

Merchant Setup now uses Merchant, Trade, Stock and Recovery sections styled as tabs. Switching
sections hides existing panels instead of rerendering, preserving unsaved form values. The NPC
selector and status remain visible. Applying stock and running recovery require native DialogV2
confirmation; cancelling the prompt makes no world changes. Existing item/table builder menus
remain separate to avoid coupling catalogue generation to merchant configuration.

## Alpha.18 native container handling

The alpha.17 screenshot reports `value.system.quantity: expected 0, received 1` on the
merchant Item. D&D5e 5.3.3's [ContainerData source](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/item/container.mjs)
defines quantity with minimum and maximum one and migrates quantity to one. Keeping a
sold-out container with quantity zero is therefore incompatible with the native system.

Sold-out containers are now deleted through the native embedded-document API. The existing
receipt and rollback restore their original ID and data if a later step fails. Non-container
merchant goods still retain zero-stock entries. Container stock generation creates one native
Item per unit, so multiple containers appear as separate offers. No parallel inventory is stored.
A fully sold-out container source can be added again by an explicit GM population action;
this is not automatic restocking. Previously clamped quantities are not reconstructed.

Validation covers container purchase and rollback while simulating the native quantity-one
restriction, plus population and retry. Live validation: repeat the failing purchase, confirm
one container reaches the character, disappears from the merchant, and currency settles once.
The screenshot does not identify the Item type; if the failed Item was not a container,
additional live investigation is needed. No live success is claimed by this build.
