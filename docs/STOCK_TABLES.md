# Stock RollTables

Stock tables are generated from canonical JSON through their own settings button:
**Configure Settings → Devil's Table → Build/Rebuild Stock RollTables → Open RollTable Builder**.
The Item builder and table builder run separately. Build Items first so table references resolve.

## Coverage

Each shop has a whole-shop set plus a set for each populated category. Each set contains four
tables, for **120 tables** in `world.devils-table-stock-tables`.

| Shop | Authored goods | Always / Often / Rarely | Category sets | Total tables | Whole-shop / category draws |
| --- | ---: | --- | ---: | ---: | --- |
| Tavern | 31 | 25 / 6 / 0 | 7 | 32 | 10 / 3 |
| General Store | 69 | 47 / 16 / 6 | 8 | 36 | 8 / 3 |
| Alchemist | 6 | 4 / 2 / 0 | 3 | 16 | 4 / 2 |
| Blacksmith | 7 | 3 / 4 / 0 | 4 | 20 | 3 / 2 |
| Black Market | 4 | 0 / 2 / 2 | 3 | 16 | 6 / 2 |

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
bought; quantities, restock timing and prices beyond the canonical item price remain GM choices.

Default tiers come from item availability: `core` → Always, `variable` → Often, `special-order` →
Rarely. Explicit local overrides make Lamp Oil Often at the Alchemist, Lockbox Often at the
Blacksmith, and Lockbox/Silk Rope Often at the Black Market. The General Store keeps all original
availability assignments. Merchant Notes remain builder guidance and never become table content.

## Build and roll

1. Build/rebuild the 69 Items using the existing Compendium Builder. An accepted alpha.4 pack
   should report 69 unchanged, with the same UUIDs, prices and weights.
2. Open the separate RollTable Builder. Select **All shops → All categories + shop overview**.
3. **Validate / Preview Tables** should show 120 creates on a new pack, with partial-catalogue
   notices for the four unfinished shops. Preview performs no writes. General Store alone shows
   36 tables; a single populated category under one shop shows four.
4. **Build / Rebuild Tables** creates the separate Stock RollTables compendium. Repeating the
   same build should show 120 unchanged. A missing referenced Item blocks preflight with its ID.
5. Select one shop, and optionally one category, then click **Roll Stock**. The report lists all
   Always goods followed by rotating choices, with prices and purchase units. All-shops selection
   disables this action because a stock list belongs to one shop.

**Roll Stock** reads and checks the built tables, rolls Foundry dice, and samples without duplicates.
Each successful tier roll chooses one remaining eligible item from that tier. An empty/exhausted
tier consumes an attempt without promoting a rare item; attempts stop early if both pools are
exhausted. The action makes no chat messages, saved stock record, inventory changes, or table
drawn-state changes. It refuses missing or outdated tables until they are rebuilt.

For example, the General Store list always contains its 47 core goods, with up to eight additional
distinct goods. Travel always contains Walking Stick, Bell and Signal Whistle. Its Often pool is
empty, so an Often result adds nothing; Compass or Spyglass can appear only on a Rarely result.

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

## Source and rebuild policy

Edit `data/stock.json` and, when adding scopes, reserve table IDs in `data/table-id-ledger.json`.
The [source contract](SOURCE_DATA.md) documents every field and identity rule. Build Items before
tables when item identity, membership or names change. Never hand-edit generated pack data as source.

Rebuilds update owned fields and result rows, including removing obsolete generated rows. Items
and whole tables are never deleted. Unrelated tables, folders and foreign flags remain intact.
Custom result rows in a selected generated table block the build; keep custom tables separate.
If a build is interrupted, correct the reported error and rerun to converge. The pack's original
lock state is restored; a newly created pack ends locked. Use one active-GM browser tab.

Automated tests cover the stock rules and persistence boundary. Follow the
[live acceptance checklist](TESTING.md) in V14 / D&D5e 5.3.3 on The Forge before declaring compatibility.
