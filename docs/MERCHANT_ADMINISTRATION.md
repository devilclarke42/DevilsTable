# Merchant administration — Sprint 8A

Devil's Table: Trade & Merchants is the public project name. The module ID remains
`devils-table`: flags, settings, socket channels, package paths, source IDs and document UUIDs
retain their existing identities. Existing Item source attribution is historical provenance;
it has not been rewritten to change the branding of already-authored catalogue content.

## Compendium review

| Purpose | Display name | Stable collection |
| --- | --- | --- |
| Shared canonical Item build | Devil's Table — Master Item Catalogue | `world.devils-table-items` |
| Merchant stock generation | Devil's Table — Merchant Stock RollTables | `world.devils-table-stock-tables` |
| Private transaction receipts and recovery data | Devil's Table — Transaction History (GM Only) | `world.devils-table-transactions` |

New packs receive these labels when the builder creates them. Existing packs keep their stored
metadata; the module applies a display-title alias when ready and after pack creation. The alias
is local to these three collections and lasts while the module is enabled. It does not copy
packs, move documents, change access, or invalidate saved UUIDs. Foundry V14 has no documented
CompendiumCollection metadata-rename method; this avoids calling an invented update API.
The existing-pack directory display remains a live Foundry acceptance check.

Merchant Templates are future data, not an empty compendium created in this sprint. Relationships
remain private merchant Actor flags keyed by character Actor ID. No relationship compendium is
necessary. The transaction history stays GM-only; renaming never changes its permissions.

## Opening the tools

Enable an existing NPC through Settings → Devil's Table: Trade & Merchants → Merchant
Administration. Open its Shop UI as GM and select **Administration**. The portrait and exact
linked token name remain in the header. Return to Inventory restores the existing basket.

All GMs can inspect the summary. Only Foundry's active GM can perform stock and cash writes.
Players receive neither administration controls nor private summary data. These fields are
read directly on the GM client, never added to the player browse projection.

The summary contains settlement, prosperity, merchant profile, physical stock units and entries,
stock value, native cash, wealth, lifetime purchases and sales, successful transactions, retained
rejections, availability, relationship count and last recorded stock addition.

### How values are calculated

- **Stock units:** sum of valid nonnegative integer quantities. **Entries:** embedded physical
  Item documents; a stack is one entry and native containers remain individual documents.
- **Inventory value:** native Item price or a valid offer-price override multiplied by quantity.
  It includes hidden/manual physical inventory. It excludes NPC features and spells. Invalid
  prices/quantities are flagged as excluded, never silently treated as trustworthy values.
  Pricing modifiers and speculative resale profit are not applied.
- **Cash:** existing `Actor.system.currency`, formatted in sensible denominations. Infinite
  funding is explicitly labelled; it does not turn the actual wallet into fictitious coins.
- **Wealth:** finite recorded inventory value plus native cash, not an economy simulation.
- **Lifetime purchases:** money paid by the merchant (`receivedMinor` on customer records).
  **Lifetime sales:** money paid to the merchant (`spentMinor`). Successful transactions sum
  relationship transaction counts. These totals survive receipt retention but depend on those
  relationship records being retained; they are not a reconstruction of pre-module trades.
- **Rejected transactions:** the current private ledger index, excluding interaction requests.
  Retention can remove older receipts, so the label explicitly says “retained history.”
- **Last restock / inventory addition:** the module's most recent successful population, or
  initial manual stocking. Older history and arbitrary later manual Item edits are not inferred.
  An absent timestamp displays “Not recorded.” This is a real-world timestamp, not world time.

Statistics are an ordered list of label/value records. Adding another statistic does not require
new bespoke template markup. Only ledger index fields needed for counting are requested.

## Empty Stock

The GM confirms the number of physical inventory entries to remove. This includes weapons,
equipment, consumables, tools, loot and containers, including hidden, manual, equipped and nested
goods. NPC features and spells remain. Merchant settings, notes, relationships, transaction
history and cash remain. A legacy merchant receives a one-time float-preservation marker before
removal so clearing its stock cannot make it eligible for fresh cash.

The operation uses native embedded Item deletion in bounded batches. It verifies the inventory
has not changed during confirmation and checks each deletion batch. Cancellation makes no
changes. A hook-cancelled or failed deletion is reported as partial; refresh and inspect the
remaining inventory before retrying. Successful deletions are not silently recreated.

Administration, stock population, checkout and transaction recovery share operation guards.
An outstanding checkout, pending recovery or active transaction blocks destructive administration;
browsing remains available. Guards coordinate module operations on the active GM client.
They do not prohibit another GM or another module from editing an Actor sheet directly.

## Initial cash float

`data/economy.json` defines settlements, prosperity factors, merchant profiles, default selections,
stock-profile hints and coin-value shares. Validation runs in the CLI and before runtime use.
The defaults are village, average prosperity and everyday merchant. Explicit merchant selections
win over stock-profile hints. Town/city/wagon General Store profiles provide data-defined hints;
a new catalogue can use the defaults or add policy entries without modifying Shop UI code.

The initial amount is a uniformly rolled integer within the settlement range, multiplied by the
prosperity and merchant-profile percentages, then rounded to the nearest copper of value.
Copper is the internal calculation unit; the UI displays formatted native denominations.

| Settlement | Base float, before multipliers |
| --- | --- |
| Village | 20–60 gp |
| Town | 80–180 gp |
| City | 250–500 gp |

Prosperity factors are Struggling 50%, Average 100%, Prosperous 175%. Profile factors are Modest
trader 75%, Everyday merchant 100%, Specialist merchant 150%, Luxury merchant 300%. For example,
a city luxury merchant at average prosperity starts with 750–1,500 gp of currency value.
These are editable project policy values, not fixed gameplay constants embedded in UI code.

Coin-value shares default to 80% gp, 15% sp and 5% cp. Whole coins are allocated and any rounding
remainder goes to copper, preserving the exact total. Native pp and ep fields remain supported.
No coin Items, parallel wallet or replacement D&D5e currency system is introduced.

### Initialization and preservation

1. Stock preview plans the float without writing any cash. Review the formatted planned amount
   before applying the stock. Cancelling or rerolling a preview has no world effect.
2. Successful first population commits cash and the initialization marker in one native Actor
   update. Manual first stocking uses native Item creation hooks and the same planning/commit
   functions. It applies only to an enabled merchant and runs on the active GM.
3. A nonzero wallet is preserved. Already-stocked merchants and merchants with relationships are
   treated conservatively as established merchants. Infinite-funds merchants receive no coins.
4. The initialization marker prevents repeat grants even after spending all cash or Empty Stock.
   Editing economy settings never refills a wallet. An unchanged world does not receive cash
   just because it is opened or the module is upgraded.
5. Wallet/settings/marker changes invalidate a preview. Roll a fresh preview instead of applying
   stale assumptions. The GM may always edit native Actor currency intentionally.

Foundry does not provide a multi-document atomic stock-and-wallet transaction here. If stock
creation succeeds but the subsequent Actor update fails, inventory can remain populated. The
error requires inspection of stock and the native wallet; there is no blind retry grant or
automatic second float. Resolve the wallet manually if needed, then make a new stock preview.
Do not delete initialization markers to repair an unrelated stock problem.

## Storage and future economy boundaries

All fields live below `flags.devils-table.merchant`:

| Field | Meaning |
| --- | --- |
| `economy.settlement` | Settlement policy ID |
| `economy.prosperity` | Prosperity policy ID |
| `economy.profile` | Economic merchant profile ID, distinct from catalogue identity |
| `initialFloat` | Status, generated amount, inputs, timestamp and policy version |
| `administration.lastStockedAt` | Latest module-recorded stock addition |
| `administration.lastEmptiedAt` | Latest completed Empty Stock action |

Existing merchant configuration, relationships and transaction/recovery storage remain unchanged.
Inventory remains solely `Actor.items`. Future stock-size, rarity and restock systems can consume
these three economy inputs. This sprint implements none of those simulations or new gameplay.
All Tavern source files, memberships, permanent IDs and current activation/deferred state remain
as they were before consolidation.

## Validation and live acceptance

Automated tests cover policy constraints, exact cash conservation, settlement/profile scaling,
read-only previews, one-time initialization, existing-wallet preservation, infinite funding,
stale-plan rejection, GM authorization, cancelled/partial deletions, inventory edits during
confirmation, shared operation guards, statistics and compendium identity preservation. A hook
simulation checks manual first-stock initialization and duplicate event suppression. Player UI
tests verify administration stays inaccessible. Existing transaction/concurrency tests remain.

This does not substitute for Foundry V14 / D&D5e 5.3.3 multiplayer testing. Before accepting:

1. Open an existing world: check new pack titles, stable saved UUIDs and private ledger access.
2. Compare GM and player Shop UI: only GM has Administration; portrait/token name remain correct.
3. On a new empty NPC, choose economy inputs, preview stock and apply. Verify the displayed float
   equals native Actor cash. Repeat population and confirm there is no second grant.
4. On another enabled empty NPC, manually drag in its first physical Item; verify a single float.
5. Check an NPC with existing funds, an established inventory and an infinite-funds NPC: none
   should receive replacement cash.
6. Cancel Empty Stock, then confirm it on a test merchant. Verify all physical goods disappear,
   while features, spells, notes, relationships, history and cash remain. Re-stock: no new float.
7. Leave a checkout open while another GM attempts administration: writes should be blocked and
   other players should still browse. Complete an ordinary purchase and rejection afterward.
8. Check summary values and layout at your usual window sizes and on The Forge.
