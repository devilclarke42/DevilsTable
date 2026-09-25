# Merchant Standard

**Status:** official merchant design and stock-authoring standard.  
**Current implementation:** alpha.7, five shop definitions, eight merchant profiles, 32 active RollTables and weighted quantity suggestions.

A merchant should feel like a believable business: essentials are dependable, useful extras vary,
and scarce goods are memorable. Players should be able to make ordinary purchases without a
separate scarcity roll for every candle, while unusual products may encourage travel, negotiation
or an order. Stock is finite. A successful availability roll is not a promise of unlimited supply.

## One canonical item, several merchants

Each product exists once in canonical JSON. The `shops` array assigns it to any appropriate shop
types. A Bottle sold by the Tavern and Alchemist is the same Item, with the same permanent ID,
base price, weight and description. A merchant-specific display, quote or available quantity belongs
to that merchant's stock instance, not a duplicate catalogue record.

Current shop types are Tavern, General Store, Alchemist, Blacksmith and Black Market. General Store
contains 144 goods across ten curated categories. Other shops currently expose only the shared goods already authored:
31 Tavern, 6 Alchemist, 7 Blacksmith and 4 Black Market. Their coverage is explicitly partial.
Do not invent stock from a category plan or a sentence in Merchant Notes to make a shop look complete.

## Stock language and intended experience

Availability and contextual conditions are different dimensions. **Always Stock** is a guarantee
within the authored assortment; **Common**, **Uncommon** and **Rare** describe ordinary access.
**Seasonal**, **Imported** and **Illegal** describe conditions or trade context and can coexist with
those frequency descriptions. None of these labels is a D&D magic-item rarity.

| Term | Design rule and player experience | Current representation |
| --- | --- | --- |
| Always Stock | Include every applicable authored essential when generating stock. Quantities are finite and purchases can exhaust an accepted stock list. | `core`, or an explicit shop override to `always` |
| Common | Regular practical trade: players should expect to find many such goods, with ordinary quantities. A particular optional good need not appear every visit. | `variable` / `often` pool |
| Uncommon | Less routine local demand, manufacture or delivery. It should occur less frequently than Common in the mature merchant system, without being treated as a singular rarity. | Currently shares `variable` / `often`; there is no independent Uncommon probability yet |
| Rare | Difficult to obtain here, sometimes special-order. It should seldom appear and usually have only one sale unit when present. | `special-order` / `rarely` pool |
| Seasonal | Availability depends on an identified growing, harvesting, hunting or festival season. Out-of-season supply needs an explicit explanation. | Descriptive tags/notes and GM judgement; no automatic calendar gate |
| Imported | Depends on a credible external supply route or unusual origin. Disruption can matter; imports need not always be Rare or expensive. | Descriptive tags/notes and GM judgement; no automatic route or price modifier |
| Illegal | Restricted by the campaign's fictional laws or local authorities. Access depends on merchant, trust and setting circumstances. | Descriptive tags/notes and appropriate shop assignments; no automated legal/access system |

The current schema accepts only `core`, `variable` and `special-order` in `availability`. Do not
insert `uncommon`, `seasonal`, `imported` or `illegal` there. Tags such as `seasonal`, `season-winter`,
`imported` and `illegal` can describe authored goods but do not currently alter stock rolls.
Any new tag must be consistent with the item's description and reviewed vocabulary.

Common and Uncommon are intentionally distinguished as design requirements even though the current
Often pool does not distinguish their chances. A future structured implementation must add schema,
validation, migration and tests together. Do not tell players that an unimplemented gate or tier is
already being calculated.

Black Market membership does not automatically make an object illegal: the current shared Lockbox,
Silk Rope, Compass and Spyglass remain ordinary goods. Conversely, a campaign may restrict a good
that is legal elsewhere. Keep fictional legal status separate from the physical product's identity.

## Merchant Notes

Every shop definition in `data/shops.json` requires:

- `alwaysStocks`: practical essentials and business expectations.
- `oftenStocks`: believable rotating trade and occasional useful extras.
- `rarelyStocks`: unusual stock, imports or special orders.

Use concrete product names or useful product groups, not generic descriptions such as “normal items”.
Lists must be nonempty and cannot place the same phrase in conflicting tiers. Notes can describe
future goods, but their presence does not create Items or table results. For example, a General
Store note may expect rations before a reviewed rations record is authored.

Merchant Notes are GM/builder guidance only. They must not enter Item or RollTable descriptions,
flags or exported player-facing inventory. Structured IDs in the stock policy determine actual
membership. Review notes and structured policy together so the intended shop and generated stock
do not drift apart.

## Current selection algorithm

Each merchant profile uses four native compendium tables: Always Stock, Often Stock, Rarely Stock and Rotating
Stock. Eight merchant profiles therefore need **32 tables**, regardless of category count. The builder uses the
same tables for category-filtered lists; no quantity or category tables are generated.

1. Resolve the selected shop, merchant profile and optional category against validated canonical data.
2. Include every eligible Always good.
3. Make the shop's suggested number of rotating attempts: d100 1–80 selects Often, 81–95 selects
   Rarely, and 96–100 adds no item.
4. A successful tier draw selects equally among remaining eligible goods in that tier. Do not
   duplicate an already selected product. Empty or exhausted tiers add nothing; they never promote
   Rare stock or borrow a good from another category.
5. Stop at the attempt limit or when both rotating pools are exhausted. Then roll each selected
   product's quantity separately.

Defaults are stored in `data/stock.json`: Tavern 10 whole-shop / 3 category attempts; Village General Store
8 / 3; Alchemist 4 / 2; Blacksmith 3 / 2; Black Market 6 / 2. An API draw-count override is bounded
to 0–50. Chances describe attempts, not the final probability of seeing any particular item.

Per-shop overrides may change effective tiers without changing base item availability. Current
examples: Lamp Oil is Often at the Alchemist; Lockbox is Often at the Blacksmith; Lockbox and Silk
Rope are Often at the Black Market. Village retains its base assignments; variants use the explicit policy below.

## General Store merchant profiles

All four profiles reference the same canonical General Store Items. Village retains the original
profile identity and source availability. Town and City promote selected useful goods to regular
stock; Wagon excludes eleven bulky goods and rotates fifteen others instead of guaranteeing them.
An assortment count is a count of distinct products; quantity rolls happen separately.

| Profile | Eligible items | Always / Often / Rarely | Whole-shop / category attempts |
| --- | ---: | --- | --- |
| Village General Store | 144 | 82 / 54 / 8 | 8 / 3 |
| Town General Store | 144 | 87 / 49 / 8 | 14 / 4 |
| City General Store | 144 | 90 / 53 / 1 | 22 / 6 |
| Merchant Wagon | 133 | 66 / 59 / 8 | 6 / 2 |

Select one profile to roll stock. **All profiles** builds or previews the sixteen General Store
tables together but cannot produce one merchant's stock list. Other shops keep their existing
four-table sets and partial coverage. No Tavern content is added in Sprint 3.

Variant descriptions and Merchant Notes live in `data/stock.json`, while base merchant guidance
remains in `data/shops.json`. Both are builder-only. These notes describe believable supply;
only structured exclusions and overrides change table membership. See [SPRINT_3_REVIEW.md](SPRINT_3_REVIEW.md)
for the exact profile differences and item review.

## Weighted quantity policy

Quantities count complete sale units, and cheaper/more common goods have higher expected stock.
The current matrix in `data/stock-quantities.json` is:

| Effective stock tier | 1–9 cp | 1–9 sp | 1–24 gp | 25+ gp |
| --- | --- | --- | --- | --- |
| Always | Abundant | Common | Limited | Scarce |
| Often | Common | Limited | Scarce | Scarce |
| Rarely | Rare | Rare | Rare | Rare |

Here **Common** is also a quantity-profile name; the quantity matrix uses the effective table tier,
not a new item-availability enum.

| Quantity profile | Sale units and percentile weights |
| --- | --- |
| Abundant | 4 (10%), 6 (20%), 8 (25%), 12 (30%), 20 (15%) |
| Common | 2 (10%), 3 (15%), 4 (30%), 6 (30%), 8 (15%) |
| Limited | 1 (15%), 2 (40%), 3 (30%), 4 (15%) |
| Scarce | 1 (65%), 2 (30%), 3 (5%) |
| Rare | 1 (95%), 2 (5%) |

The quantity die is rolled after assortment selection. It does not affect availability and does
not multiply the canonical Item's price or weight fields. Four Pitons units mean forty pitons in
four priced bundles, not four individual pitons. Always Stock can still have a small quantity for
a costly product. Random outcomes can overlap; the standard concerns expected supply, not a promise
that every cheap Item will exceed every dearer Item on every roll.

Validation requires unique profiles/rules/outcomes, positive whole quantities no greater than 100,
weights totalling 100, and all twelve tier/price mappings. Expected stock may not increase with
price or scarcity. Rare quantities must be one at least 90% of the time and never exceed two;
the shipped policy is stricter at 95% one. Larger future merchants need an explicitly reviewed
policy rather than an undocumented multiplier.

## Using a generated list in play

**Roll Stock & Quantities** returns a suggestion. It does not save merchant state, deduct purchases,
transfer Items, charge coins, send chat or schedule restocking. Each click samples a new list.
The GM should record the accepted list for the relevant merchant and trading period; a new roll
does not mean that sold goods have magically replenished.

Show players the product, quantity available, price per purchase unit and useful description.
Keep internal Merchant Notes and implementation details out of ordinary shopping. When availability
is denied by season, import conditions or local restrictions, give a believable reason and a possible
next step when appropriate. Do not use rare-stock absence to block basic participation in the game.

Native table draws provide availability without the builder's category filtering and quantity
rolls. The native Always table deliberately uses overlapping 1–1 ranges; do not Normalize it.
The current module continues to use compendiums and does not automatically create world-tab copies.

## Maintenance and future acceptance

Normal rebuilds update generated compendium data from JSON. They preserve Items, unrelated tables
and retired category tables. A separately confirmed legacy cleanup can remove eligible superseded
alpha.5 category tables after reviewing edited-data and known-reference protections. Historical
tables whose membership or names differ from current source remain protected, even without manual edits. All permanent
table IDs stay reserved. See [STOCK_TABLES.md](STOCK_TABLES.md) for exact steps and reference-check limits.

The 0.7.0 milestone must formalise Common/Uncommon distinctions and contextual availability across
the completed catalogues without multiplying tables per item/category. The 0.8.0 Merchant Builder
must add saved merchant stock and explicit GM overrides; the 0.9.0 economy work must separate local
quotes from canonical prices. These are roadmap requirements, not features supplied by this
documentation sprint.
