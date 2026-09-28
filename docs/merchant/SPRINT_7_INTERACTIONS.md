# Sprint 7 — Merchant interaction

Implementation candidate: **0.2.0-alpha.25**, 27 September 2026. Target: Foundry V14 and
D&D5e 5.3.3. This report defines current behaviour; earlier design documents describe the
longer-term system. No catalogue, compendium source or artwork changes accompany this sprint.

## Pricing

All new pricing controls use signed percentages: negative values discount and positive values
add markup. Each modifier accepts −100% to +500%, with up to two decimal places. Defaults
are 0%. Canonical Item prices are never overwritten.

| Control | Applies to | Persistence |
| --- | --- | --- |
| Shop-wide | Character purchases | Merchant settings |
| Character | That character's purchases | Merchant relationship keyed by Actor ID |
| Negotiation | That character's next completed purchase | Relationship until consumed |
| Checkout | Purchases and sale offers in the review | Current request |
| Line | One purchase or sale offer | Current request |
| Merchant buy offer | Items sold by characters | Existing native-price multiplier, edited as a percentage |

The stacking rule is configured per merchant and may be overridden in a checkout. **Additive**
sums percentages, with a zero-price floor. **Compound** multiplies each factor. A −10% shop
modifier and −20% character modifier produce −30% additively or −28% compounded. Combined
prices cannot exceed 100 times base value. The unit price is rounded to the nearest copper
before multiplying by quantity; this keeps basket and transfer amounts consistent. For example,
8 sp 4 cp discounted 10% costs 7 sp 6 cp per unit.

Shop, character and negotiation modifiers affect buying from the merchant, not selling to them.
A positive sale-offer modifier means the merchant pays more. The GM review shows original and
adjusted unit prices, original net subtotal, net adjustment, purchase savings and final total.
The final purchase modifier excludes individual line modifiers, which remain visible per line.
Mixed buy/sell baskets settle their net value. Currency uses gp/sp/cp decomposition, e.g.
1543 cp becomes **15 gp 4 sp 3 cp**. Native wallets still retain pp/gp/ep/sp/cp; displaying totals
this way does not convert the stored wallet by itself.

Typing changes previews only. **Recalculate offer** obtains player consent when public prices
or quantities change. Approval rechecks the exact accepted terms, funds and stock. Character
currency and settlement details remain collapsed. **Save shop and character modifiers** persists
only those two modifiers and stacking; review negotiation/checkout edits affect that trade only.
Merchant Administration also edits the next-purchase negotiation modifier and confidence directly.
Refresh stock after switching characters or changing saved pricing.

Legacy ordinary buy/sell multipliers are interpreted as percentages without rewriting stored
flags. A legacy factor outside the new individual modifier range must be corrected in the
Actor's module settings before using the new editor. Historical receipts retain their original
quoted prices and recovery snapshots; no migration rewrites completed or interrupted trades.

## Interaction lifecycle

1. The player controls an owned character token and requests negotiation, or theft of one offer.
2. The coordinator GM acquires the same merchant service slot used for checkout and receives a
   review. Other players may browse; additional checkout or interaction requests are rejected
   with an occupied message. Items are not reserved.
3. The GM may decline/close, or choose a skill and hidden DC and allow the roll. Negotiation
   defaults to Persuasion; theft uses Sleight of Hand. DCs accept integers from 0 to 50.
4. The requesting character rolls through native `Actor.rollSkill`. The targeted query contains
   only request ID, character ID, interaction kind and skill. It contains no DC, confidence,
   merchant statistics, opposed roll or passive Perception. Chat message creation is disabled.
5. The GM receives the total and private comparison. The GM selects the final outcome and, for
   negotiation, accepts or changes the suggested modifier. Selecting 0% rejects the discount.
6. Confirmation uses the existing recoverable transaction executor and private receipt ledger.
   The player receives the chosen outcome, never the hidden comparison. The service slot releases.

A remote roll request times out after 60 seconds. Close/decline remains available after the
wait ends. Duplicate queries reuse the same roll promise instead of granting rerolls. If the
player cancels their roll, decline/close and start a new attempt. No native world transaction
occurs just because a roll succeeds. A disconnected requesting player cannot approve a new
transfer; the GM can still close their review. Merchant closure or changed character ownership
blocks resolving an attempt but does not prevent dismissing it.

## Advisory outcomes

Negotiation suggests −5% on meeting the DC, another −5% for each full five points above it,
up to −25%. Failure suggests 0%. The GM may choose any permitted modifier and success/failure
independently of the roll. An approved modifier replaces, rather than accumulates with, the
previous negotiation modifier. It lasts until a completed purchase, including a mixed basket;
a rejected trade, failed transfer or sale-only trade does not consume it.

| Theft margin | Suggested outcome | GM-confirmed effect |
| --- | --- | --- |
| 0 or above | Success | Transfer one sale unit, no currency |
| −1 through −4 | Failure unnoticed | Private visit record only |
| −5 through −9 | Failure noticed | Increment caught-stealing counter |
| −10 or below | Caught immediately | Increment caught-stealing counter |

The GM can override every suggestion. Success rechecks that the selected offer still exists
and has stock. Normal transfer rules still apply: equipped/attuned/nested goods or containers
with contents cannot be transferred. Unlimited-stock behaviour follows the existing transfer
engine. Failed transfers use durable recovery; do not delete receipts or manually clear recovery
flags. A noticed attempt increments the caught counter as awareness of the attempt, not as an
automatic arrest, ban or relationship change.

## Private memory and confidence

Merchant Actor flags remain GM-only under `flags.devils-table.merchant`. Relationships use
character Actor IDs, never user IDs. New fields default lazily; unrelated fields are preserved.

| Field | Meaning |
| --- | --- |
| `pricingModifier` | Persistent signed character purchase modifier |
| `negotiationModifier` | Next completed purchase's signed modifier |
| `successfulNegotiations`, `failedNegotiations` | GM-selected outcomes |
| `successfulThefts` | Hidden confirmed successful thefts |
| `caughtStealing` | Confirmed noticed/caught attempts |
| `spentMinor`, `receivedMinor` | Lifetime approved purchases/sales in integer copper |
| `lifetimeDiscountMinor` | Positive purchase savings against base Item prices |
| `visits`, `firstMeetingAt`, `lastVisitAt` | Completed trades/interactions, not passive browsing |
| `successfulPurchases`, `transactionCount` | Completed purchase and trade counts |

Confidence is one merchant-wide integer from −5 to +5. Confirmed successful negotiation adds
one; a completed full-price purchase with no savings subtracts one. This models cautiousness
after concessions and willingness after fair dealings. The suggested negotiation DC starts at
15 plus confidence; theft starts at 15 independently. Confidence never changes prices, roll
results or the final relationship automatically. The GM may edit or ignore it.

Failed/rejected requests do not earn memory changes; they remain in the private ledger.
Recorded interaction receipts include the attempted kind, roll, private DC, GM outcome and
modifier. Retention remains configurable with Last 500 per merchant as default. Recovery of
memory/confidence uses the same before/after conflict checks as inventory and currency.

## Architecture and native APIs

- `pricing.js`: pure validation, composition and unit-price arithmetic.
- `interactions.js`: interaction definitions, advisory suggestions, quotes and memory updates.
- `interaction-service.js`: GM-only lifecycle, targeted rolling, decisions and receipt handling.
- Existing service owns request proof, merchant locking and public responses. Existing Shop,
  review and setup applications expose controls; there is no new custom document type.
- Existing transaction executor alone moves Items and updates durable memory. It retains native
  D&D5e currency handling and all prior rollback/read-back fixes.

Native D&D5e 5.3.3 `Actor.rollSkill(config, dialog, message)` is invoked with `{skill}`,
`{configure: true}`, `{create: false}`. No custom dice or skill system is introduced. New
interactions can reuse the request/roll/review lifecycle by adding a definition and explicit
outcome effects. This is a small module registry, not a general-purpose plugin framework.

Source references: [D&D5e 5.3.3 Actor implementation](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/documents/actor/actor.mjs),
[Foundry User API](https://foundryvtt.com/api/classes/foundry.documents.User.html) and
[query handler registry](https://foundryvtt.com/api/variables/CONFIG.queries.html).

Foundry module sockets are client-side collaboration, not server-side transaction isolation or
cryptographic dice attestation. The GM treats the returned roll as advisory and decides the
outcome. Targeted queries avoid sending private DCs over the module broadcast channel. Public
stock/outcome packets still use that existing channel and are not confidential against a client
inspecting socket traffic. Use one session for the active GM; same-account multi-tab arbitration,
automatic disconnected-client session cleanup and server-enforced distance remain outside this
candidate. These limitations must be addressed before claiming hostile-client or production
multiplayer security.

## Validation and live acceptance

Automated checks cover signed pricing, stacking, rounding, character isolation, no catalogue
mutation, advisory outcomes, native-roll payload/caching, private DCs, GM override, duplicate
resolution, dismissal after closure/ownership changes, interaction/check-out exclusion with five
browse requests, theft inventory effects and rollback. Existing two-, three- and five-client
checkout tests and native Item lifecycle recovery regressions remain required.

No live Foundry session was available during this sprint. Automated fixtures do not certify
V14 UI rendering, real network concurrency, Forge behaviour or third-party dice-module hooks.
The owner previously confirmed purchases, rejections and rollback; Sprint 7 acceptance needs:

1. Back up a test world. Install alpha.25, restart the Foundry server, reconnect GM and players.
2. Use a GM-only merchant with a linked token, an owned character and known stock/wallets.
   Confirm browsing, mixed buy/sell trades, rejection and recovery still work.
3. Set shop −10% and character −20%. Verify additive/compound totals, another character's
   independent price, live GM previews, player acceptance/decline and collapsed currency panels.
4. Request negotiation. Allow Persuasion with a private DC; inspect the player's view/chat.
   Override the suggested outcome/modifier and verify the next purchase consumes it once.
5. Exercise each theft outcome. Only Success moves one sale unit. Neither wallet changes.
   Confirm private memory and receipt details from the GM account.
6. Have two, three and five player clients browse/request simultaneously. Only one review may
   hold a merchant slot; other browsing continues. Verify no duplicate transfer or memory count.
7. Cancel a native roll, let a request time out, close the shop during review and reconnect a
   player. The GM must be able to dismiss the review after pending query waits; recovery records
   must survive interrupted writes. Record Foundry/system versions and module conflicts.

Stop after these Sprint 7 features; Tavern, automatic reputation, restocking and additional
interaction types are not part of this delivery.
