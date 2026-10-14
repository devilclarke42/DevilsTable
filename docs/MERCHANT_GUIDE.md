# Merchant Guide

**Audience:** GMs and players. **Purpose:** explain everyday shopping, approval and recovery. Setup details are in [Builder Guide](BUILDER_GUIDE.md).

## Open a shop

A merchant is a standard GM-owned NPC with a linked scene token. Players select an owned character token beside the merchant and right-click its visible token to open the Shop. Keep Actor ownership private; the Shop receives a public projection rather than an NPC sheet.

Inventory and Services share search and a basket. Categories with no public stock are omitted. Quantities are complete sale units; prices are shown in normal D&D5e denominations. Changing stock/configuration requires Refresh stock. Browsing neither reserves goods nor writes a relationship visit.

## Merchant availability

| State | Behaviour |
| --- | --- |
| Open | Browse and request checkout/interactions |
| Busy | Browse; checkout is blocked while occupied |
| Closed, Travelling, Sleeping | Availability is shown; checkout/interactions are blocked |

A pending review temporarily occupies the merchant's service slot without overwriting its saved state. Different customers can browse concurrently; the active GM resolves one decision for a merchant at a time.

## Buy, sell and approve

Players choose quantities of available goods/services and offer eligible owned Items for sale. Equipped, attuned, nested or nonempty-container goods need preparation before trading. A service requiring an Item shows a customer-inventory target selector.

The active GM recalculates current prices, stock, ownership, eligibility and funds. Review includes purchase/sale lines, percentage modifiers and the net native currency payment. Revised price, quantity or accommodation terms require player acceptance through Recalculate before approval. Rejections and closed reviews keep private audit receipts.

Approval transfers ordinary goods, settles native currency once and updates private relationship/service statistics. Finite merchants must afford payouts; infinite funding and stock are explicit settings. Native coin counts remain authoritative; there are no coin Items or a second wallet.

## Pricing and relationships

Catalogue prices are shared base values. Merchant, per-character, negotiation, review and line adjustments modify quotes without rewriting source Items. Additive or compound stacking is configured explicitly; prices round to whole copper once per unit.

Relationships are keyed by character Actor ID, not player account. Completed purchases/sales and GM-decided interactions update memory; browsing does not. State labels and private notes are GM context, not automatic attitude/refusal rules. One player's two PCs retain separate records.

## Negotiation and theft

Players request a negotiation or theft interaction; the GM controls the hidden DC and final outcome. Native Persuasion or Sleight of Hand rolls produce suggestions rather than automatic authority. A successful negotiation can supply a next-purchase modifier. Theft outcomes include success, failure unnoticed, failure noticed and caught; only a GM-approved successful theft transfers the selected visible good.

Dice So Nice may present the native roll locally. It does not reveal DCs, create another roll or decide an outcome.

## Restricted offers

Stock and services share three visibility modes: Public; Hidden until GM reveal; Relationship access after the selected character's completed-purchase threshold. GM reveals apply to the NPC's customers; they are not individual grants. A merchant setting can expose relationship offers to all customers, but it does not expose manually hidden offers.

Eligibility, enabled status, prices and stock still apply after reveal. Hidden IDs cannot bypass checkout or theft validation. Configure rules in Builder Stock/Services; refresh after changes. See [Merchant Data Model](MERCHANT_DATA_MODEL.md) for storage.

## Services and rooms

A service buys its stated work, consultation or arrangement. Most built-in services record payment and require GM completion; they do not automatically repair equipment, create commissioned goods or guarantee information. Agree scope, external costs, timing and outcome before approval.

Accommodation uses configured nights and merchant checkout time, default 10:00 in the world's clock. The GM may revise a purchase's time with player reconfirmation. Optional room actions need explicit room/door mappings. One service line creates one booking/key, and quantity does not reserve extra rooms. See [Integrations](INTEGRATIONS.md).

## Interrupted trades

A failed transfer attempts compensation; unresolved conflicts retain a private recovery receipt and block affected new trades/administration. Inspect the GM error and existing receipt before retrying. Use **Advanced Trade Settings / Recovery** from Merchant Builder. Do not repeat payment, discard pending markers or delete unresolved receipts to hide an error.

Optional actions run after completed native settlement. Missing modules skip safely; ambiguous/failed external actions require manual inspection and do not automatically refund/replay the purchase. Booking recovery is in **Manage Integrations / Room Bookings**.

## Merchant types

[General Store](GENERAL_STORE_GUIDE.md), [Tavern](TAVERN_GUIDE.md), [Blacksmith](BLACKSMITH_GUIDE.md), [Alchemist](ALCHEMIST_GUIDE.md), [Fence](FENCE_GUIDE.md).

## Related documents

[Builder Guide](BUILDER_GUIDE.md), [Known Limitations](KNOWN_LIMITATIONS.md), [Testing](TESTING.md).
