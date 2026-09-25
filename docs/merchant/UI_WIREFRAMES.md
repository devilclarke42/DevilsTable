# Merchant UI wireframes — Sprint 4 proposal

**Status:** interaction design for review. Tables describe screen regions and actions, not current
HTML templates or shipped UI. Player and GM windows should use Foundry V14 ApplicationV2 patterns,
keyboard controls, clear focus, readable light/dark themes and text alongside icons.

## 1. Token entry and player browse window

On right-click of a **visible, nearby merchant token**, show a token-scoped action labelled
**Browse Merchant**. Keep Foundry's normal token controls intact. If the PC is too far away,
show distance and a disabled action; if no PC token is controlled, prompt the player to select
their character. Test this flow on a player who does **not** own the merchant token.

| Region | Content and behaviour |
| --- | --- |
| Header | Merchant name and portrait, optional public description, scene distance and neutral/suggested greeting. |
| Search/filter | Search public name and description; optional category/price sorting. Page the results; no GM-private stock tiers or relationships. |
| Stock row | Icon, Item name, sale unit, GM-approved public description, quoted price, available count or “available,” plus Add button. Unpriced or unreviewed external Items show “ask the merchant,” with no price or private description guessed. |
| Basket panel | Product, requested quantity, current quote, subtotal, Remove/change buttons and “prices/stock confirmed at checkout” label. The basket is local to the player's session. |
| Actions | **Request negotiation** (advisory), **Checkout**, **Close**. Disable Checkout when out of range, GM offline, merchant occupied, no valid PC, or basket empty. |
| Feedback | “Another customer bought the last copy; review your basket,” “Merchant occupied,” and explicit pending/approved/rejected/recovery messages. |

Before checkout, a PC may switch from purchasing to **Offer Items for Sale**. The panel lists only
that PC's eligible embedded Items and editable quantities. Valuation is an offer for GM review;
missing or unusual prices remain unquoted until the GM supplies one. A player's basket does not
reserve either side's goods. Show the selected PC Actor so users sharing an account cannot trade
as the wrong character accidentally.

## 2. GM merchant management sheet

Entry: a GM-only **Merchant** tab or separate management window opened from the standard NPC sheet.
The Actor remains a normal D&D5e NPC; existing stats, effects, biography and Item editing stay on
its native sheet.

| Tab | Fields and controls |
| --- | --- |
| Profile | Enabled, merchant ID, template, shop/stock profile, scene access distance, finite/infinite wallet, currency mode. “Preview template” never overwrites a configured NPC. |
| Inventory | Native embedded Items, source linkage, quantity, sale unit, offer price/override, unlimited flag, restock target/suppression and last reviewed edit. Seed stock, add manual offer, suppress and reconcile. |
| Wallet | Native cp/sp/gp (plus supported world denominations), balance, denomination limits, coin handling mode and projected result of a proposed settlement. |
| Notes & greetings | Public Notes, private GM Notes, and editable greetings for the nine relationship states. Source Merchant Notes are a starting prompt, not a synchronized override. |
| Customers | Search PC name/ID; first/last confirmed visit, state, counters and private relationship note. GM can record an encounter or correct a record with a reason. |
| History | Search status, merchant, PC and date; show receipts in bounded pages, not an ever-growing Actor flag. |

Editable note templates must be generic: **Innkeeper** “Ask about rooms, meals and local travel”;
**General Store** “Frequent purchases: rope, candles and rations”; **Blacksmith** “Confirm sizes
and repair lead times”; **Alchemist** “Clarify the preparation and its safe handling.” These are
sample GM prompts, not random local people, quests or campaign lore. Each note can be cleared.
Templates do not imply that un-authored Tavern/Alchemist/Blacksmith Items have been created.

## 3. Single GM checkout decision window

One active request per merchant, with the focused decision window showing:

| Region | GM view and edit controls |
| --- | --- |
| Identity | Merchant and source token, requesting User, trading PC Actor and portrait, current distance, time, pending transaction ID. |
| Purchases | Each offer, requested/available quantity, sale unit, editable final quantity and unit price, plus stock delta. |
| Sales | Each PC Item, actual available quantity, item state/contents warning, editable accepted quantity and offer price. |
| Negotiation | GM-selected skill and DC or no roll; visible result; suggested percentage/amount; editable or discardable discount. |
| Relationships | Private state, prior transaction count, money spent/received, last visit and editable customer note. |
| Notes | GM Notes and trading-relevant guidance; Public Notes alongside for context. None leaks to the player window. |
| Currency | Gross buy/sell totals, discount, net due, tender, change or payout, merchant and PC coin counts before/after, explicit mode and any shortfall. |
| Final actions | **Approve & commit**, **Reject**, **Edit transaction**, **Request exact payment**, **Set manual settlement**, **Cancel/close**. Approval is disabled until every discrepancy has a documented resolution. |

The window re-renders a diff if the merchant/PC state changed while it was open. GM edits to
quantities or prices refresh the coin solver and final preview; they cannot directly change Actor
documents before approval. If an approval partially fails, replace success with a recovery view
showing saved stages and current Actor values. Do not offer a blind second Apply button.

## 4. Negotiation dialog

| Person | Screen state |
| --- | --- |
| Player | “Ask to negotiate” sends a request; after GM permission, a clearly named skill check button appears. No automatic roll. |
| GM | Choose **no roll**, select a skill (Persuasion offered first), choose/edit a suggested DC, or decline negotiation. The GM sees the result and an advisory discount. |
| Both | The player's request and rolled result are visible as appropriate; the final discount and completed totals are displayed only once the GM approves a trade. |

Future skills plug into the same approved check request/result shape. A roll can inform RP without
granting a discount. A failed roll need not create a penalty. A GM may apply a discount without a
roll, or reject the suggested discount after a success.

## 5. Stock restock preview and transaction search

| Window | Visible information |
| --- | --- |
| Restock preview (GM) | Current vs target quantity per opted-in offer, proposed top-up, source status, manual-edit conflict and Skip/Apply selection. Show source profiles and suggested weighted quantities without auto replacing the inventory. |
| History search (GM) | Merchant, PC, time span, status, amount band and free-text Item name; paged receipt results, details on demand, recovery records clearly marked. |

Restock does not run on every world load. If an explicit schedule is enabled, the GM still sees
the pending preview before writing. This avoids hundreds of Actors changing when a world opens.

## Accessibility and edge states

Use labels and tab order for all actions, focus the first unresolved issue in a GM approval,
announce stock/price changes in a live region, and pair the colour of a status with a text label.
Escape/sanitize external Item text. Show empty inventory, unpriced Item, missing GM, no valid PC,
unlinked merchant token, unsupported currency and recovery states without blank windows. Keep
search local to the authorized public projection; avoid loading the full Item catalogue or every
merchant's history when one shop opens.
