# Stock RollTables

Stock tables are generated from canonical JSON through their own settings button:
**Configure Settings → Devil's Table → Build/Rebuild Stock RollTables → Open RollTable Builder**.
The Item builder and table builder run separately. Build Items first so table references resolve.

## Coverage

Each merchant profile has one four-table set, for **32 active tables** in `world.devils-table-stock-tables`.
Category selection filters these shared tables when rolling stock. It does not generate another set.

| Shop | Authored goods | Always / Often / Rarely | Active tables | Whole-shop / category draws |
| --- | ---: | --- | ---: | --- |
| Tavern | 31 | 25 / 6 / 0 | 4 | 10 / 3 |
| Village General Store | 144 | 82 / 54 / 8 | 4 | 8 / 3 |
| Town General Store | 144 | 87 / 49 / 8 | 4 | 14 / 4 |
| City General Store | 144 | 90 / 53 / 1 | 4 | 22 / 6 |
| Merchant Wagon | 133 | 66 / 59 / 8 | 4 | 6 / 2 |
| Alchemist | 6 | 4 / 2 / 0 | 4 | 4 / 2 |
| Blacksmith | 7 | 3 / 4 / 0 | 4 | 3 / 2 |
| Black Market | 4 | 0 / 2 / 2 | 4 | 6 / 2 |

Goods are shared references, not copies; the same item can appear in several shops. General Store
covers the complete agreed list. Other shops are explicitly **partial**, containing only their
already-authored shared goods. No meals, potions, weapons or other future catalogue entries are
invented to fill a table. Empty tiers remain available for future reviewed source content.

| Shop | Categories |
| --- | --- |
| Tavern | Containers; Lighting & Fire; Rope & Climbing; Camping; Household; Animal Supplies; Travel |
| General Store | All ten categories, including Tools and Trade Goods |
| Alchemist | Containers; Lighting & Fire; Writing |
| Blacksmith | Containers; Lighting & Fire; Rope & Climbing; Animal Supplies |
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
Blacksmith, and Lockbox/Silk Rope Often at the Black Market. Village keeps all source availability assignments. Town, City and Wagon apply
their explicit overrides/exclusions; quantity profiles use the resulting effective tier. Merchant Notes remain builder guidance and never become table content.

## Build and roll

1. Build/rebuild all 144 Items using the existing Compendium Builder. An alpha.4–alpha.6 pack
   previews 75 creates, 13 Container sale-unit updates and 56 unchanged. Existing UUIDs, prices
   and weights remain intact; a repeat build reports 144 unchanged.
2. Open the separate RollTable Builder. Select **All shops → All categories**.
3. **Validate / Preview Tables** should show 32 creates on a new pack, with partial-catalogue
   notices for the four unfinished shops. Preview performs no writes. Each merchant profile uses four tables.
4. **Build / Rebuild Tables** creates the separate Stock RollTables compendium. Repeating the
   same build should show 32 unchanged. A missing referenced Item blocks preflight with its ID.
5. Select one shop and merchant profile, and optionally one category, then click **Roll Stock & Quantities**. The report
   lists Always goods and rotating choices with quantities, prices and purchase units. All-shops and All-profiles selections
   disable this action because a stock list belongs to one merchant profile.

**Roll Stock** reads and checks the built tables, rolls Foundry dice, and samples without duplicates.
Each successful tier roll chooses one remaining eligible item from that tier. An empty/exhausted
tier consumes an attempt without promoting a rare item; attempts stop early if both pools are
exhausted. The action makes no chat messages, saved stock record, inventory changes, or table
drawn-state changes. It refuses missing or outdated tables until they are rebuilt.

For example, Village includes its 82 Always goods with up to eight distinct extras. City includes
90 Always goods with up to twenty-two extras; Spyglass is its only Rarely good. Village Compass
is Rarely, but City Compass is Often. Wagon excludes eleven bulky products before sampling.
Category selection filters these same pools and uses the selected profile's category attempt count.

General Store offers **All profiles** for building sixteen tables at once, or one named profile
for building four. A category filter changes stock selection, not which table set is generated.
Merchant Notes shown for Village, Town, City and Wagon remain private builder guidance.

The API preserves base-profile defaults for existing callers and adds explicit variant selection:

```js
const api = game.modules.get("devils-table").api;
await api.rebuildStockTables({ shopId: "general-store", profileId: "DT_TABLE_GS_CITY" }); // preview
await api.rollStock({ shopId: "general-store", profileId: "DT_TABLE_GS_CITY", categoryId: "travel" });
```

Omitting `profileId` from a table build includes all selected shop profiles; omitting it from a
stock roll uses that shop's base profile. Invalid cross-shop profile selections fail before writes.

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

## Upgrade from alpha.5 or alpha.6

Normal builds retain all twenty existing whole-shop identities, update the three Village item
pools and create twelve variant tables: 12 creates, 3 updates and 17 unchanged. A repeat build
reports 32 unchanged active tables. Any of the 100 old category tables remain preserved.

For cleanup, select **All shops → All categories → Preview Legacy Cleanup**. The report lists
each proposed removal and protected table; confirm only after review and a world backup. Legacy
comparison uses current canonical source. Older category names or memberships that no longer match
are protected even if nobody edited them. The expanded catalogue therefore does not promise
removal of all 100 historical tables; never bypass the protection to force a target count.

Cleanup requires current compact tables and removes only exact, reserved legacy category tables
whose generated fields still match. Edited results/names, assigned folders and foreign flags are
protected. References from retained tables in this stock pack or from world RollTables protect
the target and its dependency chain. **Journal, macro and other-compendium links are not scanned**;
review those before confirming. Repeated cleanup does nothing once eligible tables are gone.
Interrupted cleanup requires a fresh preview; the original pack lock is restored and a separate
cleanup record reports success/failure. Ordinary rebuilding does not recreate retired category tables.

## Source and rebuild policy

Edit `data/stock.json` and `data/stock-quantities.json`. New merchant profiles require table reservations in
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
