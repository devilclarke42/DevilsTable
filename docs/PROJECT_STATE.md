# Project state

Updated 2026-09-28 for `0.3.0-alpha.3`.

## Sprint 8A candidate

Devil's Table: Trade & Merchants now includes GM Shop Administration, Merchant Summary, confirmed
Empty Stock, economy policy inputs and a one-time native cash float. Stable IDs, live inventory,
private merchant records and all Tavern source content are preserved. Compendium display labels
have been reviewed; existing-pack labels are runtime aliases, not metadata migrations.
Automated validation passes: 144 active Items, 32 Stock RollTables and 306 tests.
See [Merchant administration](MERCHANT_ADMINISTRATION.md) for formulas, safeguards and live checks.
The prior catalogue activation state below is unchanged. No new gameplay was added.

## Catalogue baseline

Sprint 8 is Catalogue Framework & Merchant UX. Data-defined catalogues and categories drive the
Shop UI. Source JSON generates one shared Item compendium; merchant NPC embedded Items remain
live stock. Actor portraits, exact token names, immediate public-field search, populated category
tabs and a persistent basket are implemented. Provider registration feeds the existing validator
and shared builder. See [Catalogue framework](CATALOGUE_FRAMEWORK.md) for the complete contract.

The active build contains 144 General Store Items and 32 Stock RollTables. All 296 previously
reserved Item IDs remain reserved. The earlier `0.3.0-alpha.1` candidate authored 152 Tavern Items
before the sprint was revised. Those files and their former stock policy are retained as deferred
review material; they are not loaded into active builds. Existing world compendium and Actor
Items are not deleted. Tavern has only 31 shared General Store goods in current stock generation.

## Stable baseline and limits

The owner reported working purchases, rejection, recovery and Sprint 7 interactions. Transaction
settlement, native currencies, GM approval, revised-price consent and recovery remain the existing
implementation. Automated checks cover concurrency using two, three and five simulated clients.

This workspace has no live Foundry V14 / D&D5e 5.3.3 world. Sprint 8's runtime visuals and actual
multiplayer acceptance require owner testing. Automated results must not be described as live
verification. Existing limits include refresh-based stock snapshots, one active GM browser session,
and the previously documented distance-enforcement limitation.

## Review sequence

1. Install `0.3.0-alpha.2`, restart/reconnect the test world and select the merchant's catalogue in
   Merchant Administration. Existing merchant inventories remain intact.
2. Open the shop as a player without NPC ownership. Check portrait, token name, catalogue and status.
3. Search by a tag and category label; confirm focus remains in the input and basket items remain.
4. Empty a stocked category as GM, refresh the shop and verify its tab disappears. Check the basket
   remains accessible while scrolling inventory and confirm prices match GM review.
5. Repeat a purchase/rejection with multiple browsing players and record any native Foundry error.
6. Review the framework before resuming Tavern authoring. Services, a full Merchant Builder and
   restocking need separately approved scopes.
