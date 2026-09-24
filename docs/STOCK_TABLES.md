# Stock RollTables

Stock tables are generated from canonical JSON through their own settings button:
**Configure Settings → Devil's Table → Build/Rebuild Stock RollTables → Open RollTable Builder**.
The Item builder and table builder run separately. Build Items first so table references resolve.

## Coverage

Each shop has one four-table set, for **20 active tables** in `world.devils-table-stock-tables`.
Category selection filters these shared tables when rolling stock. It does not generate another set.

| Shop | Authored goods | Always / Often / Rarely | Active tables | Whole-shop / category draws |
| --- | ---: | --- | ---: | --- |
| Tavern | 31 | 25 / 6 / 0 | 4 | 10 / 3 |
| General Store | 69 | 47 / 16 / 6 | 4 | 8 / 3 |
| Alchemist | 6 | 4 / 2 / 0 | 4 | 4 / 2 |
| Blacksmith | 7 | 3 / 4 / 0 | 4 | 3 / 2 |
| Black Market | 4 | 0 / 2 / 2 | 4 | 6 / 2 |

Goods are shared references, not copies; the same item can appear in several shops. General Store
covers the complete agreed list. Other shops are explicitly **partial**, containing only their
already-authored shared goods. No meals, potions, weapons or other future catalogue entries are
invented to fill a table. Empty tiers remain available for future reviewed source content.

| Shop | Categories |
| --- | --- |
| Tavern | Containers; Fire & Lighting; Rope & Climbing; Camping; Household; Animal; Travel |
| General Store | All eight categories, including Writing |
| Alchemist | Containers; Fire & Lighting; Writing |
| Blacksmith | Containers; Fire & Lighting; Rope & Climbing; Animal |
| Black Market | Containers; Rope & Climbing; Travel |

## How stock works

| Table | Behavior |
| --- | --- |
| Always Stock | One 1d1 draw returns all its item results through overlapping 1–1 ranges. An empty tier returns a clear text result. |
| Often Stock | Equal chance per item within the Often pool; use Rotating Stock to apply availability. |
| Rarely Stock | Equal chance per item within the Rarely pool; use Rotating Stock to apply availability. |
| Rotating Stock | 1d100: 1–80 draws Often, 81–95 draws Rarely, 96–100 adds no stock. An empty tier adds no item. |

The 80/15/5 probabilities and draw counts are initial project defaults for review, editable in
`data/stock.json`. They describe each rotating attempt, not the chance that an individual item
will appear across the entire stock list. More attempts increase the chance of rare goods.
Always goods are included independently of those rolls. Availability means a product can be
bought. The builder suggests quantities separately; the GM controls actual inventory and restock timing.

Default tiers come from item availability: `core` → Always, `variable` → Often, `special-order` →
Rarely. Explicit local overrides make Lamp Oil Often at the Alchemist, Lockbox Often at the
Blacksmith, and Lockbox/Silk Rope Often at the Black Market. The General Store keeps all original
availability assignments. Merchant Notes remain builder guidance and never become table content.

## Build and roll

1. Build/rebuild the 69 Items using the existing Compendium Builder. An accepted alpha.4 pack
   should report 69 unchanged, with the same UUIDs, prices and weights.
2. Open the separate RollTable Builder. Select **All shops → All categories**.
3. **Validate / Preview Tables** should show 20 creates on a new pack, with partial-catalogue
   notices for the four unfinished shops. Preview performs no writes. Each shop uses four tables.
4. **Build / Rebuild Tables** creates the separate Stock RollTables compendium. Repeating the
   same build should show 20 unchanged. A missing referenced Item blocks preflight with its ID.
5. Select one shop, and optionally one category, then click **Roll Stock & Quantities**. The report
   lists Always goods and rotating choices with quantities, prices and purchase units. All-shops selection
   disables this action because a stock list belongs to one shop.

**Roll Stock** reads and checks the built tables, rolls Foundry dice, and samples without duplicates.
Each successful tier roll chooses one remaining eligible item from that tier. An empty/exhausted
tier consumes an attempt without promoting a rare item; attempts stop early if both pools are
exhausted. The action makes no chat messages, saved stock record, inventory changes, or table
drawn-state changes. It refuses missing or outdated tables until they are rebuilt.

For example, the General Store list always contains its 47 core goods, with up to eight additional
distinct goods. Travel always contains Walking Stick, Bell and Signal Whistle. Its Often pool is
empty, so an Often result adds nothing; Compass or Spyglass can appear only on a Rarely result.

## Weighted quantities

After assortment selection, each distinct good receives one d100 quantity roll. The effective
shop tier and canonical price band select a profile in `data/stock-quantities.json`.

| Effective tier | 1–9 cp | 1–9 sp | 1–24 gp | 25+ gp |
| --- | --- | --- | --- | --- |
| Always | Abundant | Common | Limited | Scarce |
| Often | Common | Limited | Scarce | Scarce |
| Rarely | Rare | Rare | Rare | Rare |

| Profile | Quantity: probability | Expected sale units |
| --- | --- | ---: |
| Abundant | 4: 10%; 6: 20%; 8: 25%; 12: 30%; 20: 15% | 10.2 |
| Common | 2: 10%; 3: 15%; 4: 30%; 6: 30%; 8: 15% | 4.85 |
| Limited | 1: 15%; 2: 40%; 3: 30%; 4: 15% | 2.45 |
| Scarce | 1: 65%; 2: 30%; 3: 5% | 1.4 |
| Rare | 1: 95%; 2: 5% | 1.05 |

These are weighted outcomes, not a uniform roll across the minimum/maximum. Broad price bands
give a tendency rather than guaranteeing every cheap good outnumbers every expensive good.
For example, core Torches use Abundant, core Hempen Rope uses Common, and a General Store Spyglass
uses Rare. Four Pitons units mean four ten-piton bundles: 40 pitons, 4 × 5 sp and 4 × 2 lb.
Quantity does not create extra compendium Items, change canonical price/weight, or write inventory.

Profile weights must total 100, outcomes must be unique positive whole quantities no greater than
100, and all 12 tier/price combinations must resolve. Expected stock cannot rise with price or
scarcity. Rare profiles must give one at least 90% of the time and never more than two; current
defaults are 95%/5%. No quantity RollTable documents are generated.

## Native Foundry draws

For Foundry's normal table controls, import the relevant **Always Stock** and **Rotating Stock**
tables into the world. Draw Always once, then draw Rotating up to the suggested count. Nested
results reference the generated compendium pools and return real Item references. Keep the Item
and stock compendiums in the world so these UUIDs continue to resolve.

Do **not Normalize Always Stock**: the shared 1–1 ranges deliberately return every core item.
Native draws use replacement and can repeat goods; ignore repeated availability results or use
the builder's duplicate-free Roll Stock action. Native chat output and drawn-state behavior are
Foundry controls, separate from the builder action. Imported world-table copies are independent
and are not refreshed by a later compendium rebuild.
Native draws provide availability only. Use the builder for category filtering and weighted quantities.

## Upgrade from alpha.5

Normal builds recognise the same 20 whole-shop tables and preserve the 100 old category tables.
To remove the latter, select **All shops → All categories → Preview Legacy Cleanup**. The report
lists each proposed removal and protected table; confirm only after reviewing it and backing up
the world. A pristine alpha.5 pack then contains 20 tables. A protected pack may retain more.

Cleanup requires current compact tables and removes only exact, reserved legacy category tables
whose generated fields still match. Edited results/names, assigned folders and foreign flags are
protected. References from retained tables in this stock pack or from world RollTables protect
the target and its dependency chain. **Journal, macro and other-compendium links are not scanned**;
review those before confirming. Repeated cleanup does nothing once eligible tables are gone.
Interrupted cleanup requires a fresh preview; the original pack lock is restored and a separate
cleanup record reports success/failure. Ordinary rebuilding does not recreate retired category tables.

## Source and rebuild policy

Edit `data/stock.json` and `data/stock-quantities.json`. New shops require table reservations in
`data/table-id-ledger.json`; new category filters do not. Retired IDs remain reserved forever.
The [source contract](SOURCE_DATA.md) documents every field and identity rule. Build Items before
tables when item identity, membership or names change. Never hand-edit generated pack data as source.

Rebuilds update owned fields and result rows, including removing obsolete generated rows. Items
are never deleted. Whole-table deletion happens only through the separately confirmed legacy cleanup.
Unrelated tables, folders and foreign flags remain intact.
Custom result rows in a selected generated table block the build; keep custom tables separate.
If a build is interrupted, correct the reported error and rerun to converge. The pack's original
lock state is restored; a newly created pack ends locked. Use one active-GM browser tab.

Automated tests cover the stock rules and persistence boundary. Follow the
[live acceptance checklist](TESTING.md) in V14 / D&D5e 5.3.3 on The Forge before declaring compatibility.
