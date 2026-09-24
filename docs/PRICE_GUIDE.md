# Price Guide

**Status:** official economy standard for authored catalogue prices.

Devil's Table treats copper and silver as useful money. Ordinary shopping should involve buying
soap, candles, rope and supplies in small denominations, while significant or specialist equipment
still requires a deliberate investment. The 2014 rules provide a mechanical reference, not a
price list that must be copied without judgement.

## Price format and bands

Store one purchase price as `{ "value": 7, "denomination": "sp" }`. `value` is a positive whole
integer. Only `cp`, `sp` and `gp` are supported; copper and silver amounts must be 1–9.
Free goods, fractional amounts, ep, pp and computed regional prices require a reviewed extension.

| Band | Source price | Intended use |
| --- | --- | --- |
| Everyday | 1–9 cp | Small domestic goods and frequently replaced supplies |
| Common | 1–9 sp | Ordinary useful purchases and basic travel equipment |
| Equipment | 1–24 gp | Durable or specialised practical equipment requiring meaningful spending |
| Specialist | 25+ gp | Precision work, unusual manufacture or difficult-to-source goods |

The shared boundary belongs to Specialist: **25 gp is not in both bands**. Gold has no arbitrary
upper price cap, but a high number needs a clear product and balance rationale. Price bands are
economic labels; they are not D&D magic-item rarity.

Use the ordinary relationships of ten copper to one silver and ten silver to one gold when
comparing costs. Store the useful denomination directly: 1 sp rather than 10 cp, and 1 gp rather
than 10 sp. The current contract deliberately does not express every intermediate copper value
above 9 cp. For a new good estimated around 15 cp, choose and justify a sensible project price
such as 1 sp or 2 sp. Do not write an invalid decimal or silently round a price during building.

## How to choose a price

1. Define exactly what is sold. Establish count, length, quality, packaging, contents and fittings.
2. Compare neighbouring catalogue goods of similar material, manufacture and usefulness.
3. Consider supply and workmanship. A simple clay vessel and a precision lens should not sit
   in the same price band merely because both are carried in one hand.
4. Use the 2014 price as context where a comparable product exists, then choose the project's
   value deliberately. Retain mechanical effects independently of that economic choice.
5. Review travel budgets and likely purchase frequency. A handful of domestic goods should not
   consume the same budget as substantial adventuring equipment without a reason.
6. Record a material change in the review notes/changelog. Preserve the item's permanent ID.

Lower is not automatically better. The aim is coherent everyday commerce, not a blanket discount.
Small improved goods can cost more than the rulebook example; a formerly extreme specialist price
can be reduced without changing what the item does. Avoid importing modern wage or retail models
as an automatic conversion. Merchant personality, scarcity and local circumstances are GM context
until a reviewed economy system supports explicit adjustments.

## Current catalogue examples

| Item and sale unit | Project price | Reason for its place in the economy |
| --- | --- | --- |
| Candle, one small candle | 1 cp | A cheap, regularly replaced light source |
| Torch, one | 2 cp | Everyday fuel with a short useful life |
| Soap, one bar | 4 cp | An ordinary household purchase with repeated uses |
| Lamp Oil, one pint in its flask | 2 sp | A complete fuel purchase including packaging |
| Hempen Rope, one 50-foot coil | 7 sp | Common practical equipment, with the full length stated |
| Backpack, one empty pack | 8 sp | Accessible carrying equipment; contents are separate |
| Tent, one two-person set | 3 gp | Shelter with poles, pegs and guy lines included |
| Lockbox, one fitted box and key | 12 gp | More workmanship and security than a plain container |
| Compass, one pocket instrument | 25 gp | Specialist navigation equipment |
| Spyglass, one collapsible instrument | 100 gp | Precision optics remain a significant purchase |

These are the current canonical values, not new proposed prices or prices changed by this
documentation sprint. Consult JSON when a later revision changes an example.

## Bundles, containers and consistency

Price applies to one `saleUnit`. Pitons cost 5 sp for ten, and Horseshoes cost 8 sp for four with
their fitting nails. A stock quantity of four Pitons means four bundles costing 20 sp in total,
not four individual pitons priced at the bundle rate. Kits include only their stated parts.

Empty containers do not include free water, oil or other contents. Filled goods such as Lamp Oil
include their named packaging in price and weight. Transferring contents does not manufacture a
second full Item or automatically refund packaging. Avoid accidental profit loops between a bundle,
its components and its container; proposed component listings need an explicit comparison.

The same canonical good has the same base price across shop assignments. Do not duplicate the
Item just to make one merchant charge more. Merchant-specific quotes, discounts, sell-back rates
and regional multipliers belong to a future merchant/economy layer, not a rewrite of the base Item.

## Relationship to stock and mechanics

The quantity policy uses these four bands and effective shop availability. Cheaper bands tend to
produce more sale units; Rare goods nearly always produce one. Price does not itself decide whether
a product is Always, Often or Rarely stocked. A 12 gp Lockbox can be Rarely at the General Store
and Often at a Blacksmith through an explicit stock override.

Changing a price can cross a quantity band. Review that effect along with the price change, and
follow [MERCHANT_STANDARD.md](MERCHANT_STANDARD.md). Preserve rule effects such as rope strength,
light range and use duration unless a separately justified mechanics change is approved. A cheaper
spyglass does not gain or lose magnification because its price changed.

## Acceptance criteria

A price is ready when it is valid whole cp/sp/gp, tied to the correct sale unit, consistent with
related goods, attributed as a project choice where appropriate, and reviewed for stock-band and
bundle effects. Automated validation checks formats and boundaries; reviewers own economic judgement.
The 0.9.0 economy milestone will evaluate wider campaign balance without silently discarding this
established copper-and-silver philosophy.
