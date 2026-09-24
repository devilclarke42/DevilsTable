# Weight Guide

**Status:** official adjusted-weight standard for Variant Encumbrance.

Equipment weight should make packing, transport and resupply meaningful without turning ordinary
small purchases into implausible burdens. Devil's Table therefore authors adjusted weights instead
of blindly copying official values or applying a universal reduction. The JSON weight is copied
exactly into the generated Item. The module does not enable encumbrance or change a world's rules.

## Rules baseline

For an ordinary character without relevant size/carrying exceptions, the 2014 variant imposes a
10-foot speed reduction above five times Strength in pounds. Above ten times Strength, up to the
usual carrying limit of fifteen times Strength, it imposes a 20-foot reduction and disadvantage on
Strength, Dexterity and Constitution checks, attacks and saves. The variant also replaces use of
the armour table's Strength requirement. Apply the actual creature's rules where exceptions exist.

These thresholds explain why many small weights matter. They are not new automation provided by
this module. See the official [2014 lifting, carrying and encumbrance rules](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/using-ability-scores#Strength).

## Data format and unit of account

```json
{
  "value": 5,
  "units": "lb",
  "notes": "Adjusted dry weight for one complete 50-foot coil; count additional coils separately."
}
```

`value` must be finite and nonnegative; containers must be strictly positive. Store pounds, not
ounces or kilograms, and use a practical decimal such as 0.5, 0.25, 0.1 or 0.02. Avoid needless
precision that suggests a laboratory measurement. `notes` must explain what is weighed and why
the chosen value is appropriate. A nonblank phrase such as “adjusted” alone is not sufficient review.

Weight belongs to one complete `saleUnit`, matching its price. Four bundles of Pitons are four
times the two-pound bundle weight. A kit's contents must not be added again as separate physical
Items unless the original bundle is explicitly split under GM bookkeeping.

## Adjustment method

1. Establish the official comparison, if one exists, and check whether it describes an empty
   object, a filled container, an individual piece or a bundle.
2. Define the project's object: dimensions/useful capacity, material, intended durability, included
   fittings, contents and packaging. A smaller travel pot is not the same object as a large iron pot.
3. Choose a plausible useful weight for that product. Reduce exaggerated mundane burdens where
   justified, but retain the real transport significance of water, fuel, feed, bulk wood and metal.
4. Compare similar catalogue products. A material advantage should make sense; it is not an excuse
   to create universally superior, negligible-weight equipment at ordinary prices.
5. Record the rationale and inclusions/exclusions in `weight.notes`, with source differences in
   `source.reference` or the content review document.
6. Review the complete travel load and test the native Item/container behaviour in Foundry.

Never infer a weight from price, rarity or icon. Never assume a dash in an official equipment table
means a real object has no mass. Give small physical goods a practical nonzero value. Zero is
structurally supported for future concepts but needs an explicit review justification; it is not
the default for chalk, needles, paper or similar supplies.

## Examples already in the catalogue

| Comparable product | 2014 reference weight | Project weight | Authored reasoning |
| --- | ---: | ---: | --- |
| Torch | 1 lb | 0.5 lb | A dry wooden torch with its resinous wrapping |
| Hempen Rope, 50 ft | 10 lb | 5 lb | A practical complete dry coil |
| Silk Rope, 50 ft | 5 lb | 2.5 lb | A full coil, preserving a material advantage over hemp |
| Two-person Tent | 20 lb | 8 lb | A compact canvas set including poles, pegs and guy lines |

The reference figures come from the [2014 equipment table](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment#AdventuringGear).
These examples demonstrate individual design decisions, not an instruction to halve every weight.
Current original project goods such as Soap (0.25 lb) and Signal Whistle (0.02 lb) use practical
small weights with explicit purchase units and rationales.

## Empty shells, contents and capacities

A container's `weight.value` is its empty shell plus stated fittings. Capacity is a separate limit
for contents, not additional carried mass by itself. Contents contribute normal weight once.
Mundane containers do not grant `weightlessContents`.

- Backpack: 2 lb empty; carried gear adds its own weight. Externally lashed gear is not free mass.
- Waterskin: 0.5 lb empty. The project uses a game allowance of 2 lb per US quart of water, so
  its two-quart water load adds 4 lb and the filled total is 4.5 lb.
- Lamp Oil: the sold full flask is 1 lb total: 0.75 lb oil plus 0.25 lb container and stopper.
  Do not carry a full flask and also count its transferred oil as a second full supply.
- Pitons: one bundle contains ten at 0.2 lb each, totalling 2 lb including negligible wrapping.

The water allowance is a stated game convention, not a precision physical density measurement.
Track liquid contents separately from an empty-container Item. Volume, shape, sealing and whether
an object fits require GM judgement; the module does not automate every physical constraint.

Native capacities use positive pounds plus a positive volume in `cubicFoot`, `pint`, `quart` or
`gallon`. Liquid measures are US measures. The converter expresses volume in cubic feet using
231 cubic inches per US gallon and 1,728 cubic inches per cubic foot. Preserve the authored source
units and do not change capacity merely to compensate for a lighter shell.

## Consumption and gradual use

Use the full stocked unit's weight when supplied. Native supported consumption removes completed
sale units; it does not continuously reduce a partially used bag, ink bottle, candle or ration.
Fuel transfer, remaining packaging and partial quantities are manual until a reviewed workflow
supports them. A light's burn duration must not be changed merely to justify its adjusted weight.

Stock quantities are suggestions of available sale units. They do not multiply the weight stored
on the canonical Item; actual carried mass follows the quantities placed into a character's inventory.
Always Stock means reliable availability, not an infinite or weightless stack.

## Review checklist

- Price, stock quantity, weight and consumption use the same purchase unit.
- The note distinguishes empty/full, included/excluded parts and project adjustments.
- Similar goods preserve sensible material and capacity relationships.
- Heavy supplies still create transport choices; small physical goods are not casually weightless.
- Contents and packaging are counted once, and container capacity is not confused with shell mass.
- A target-world test confirms quantities and contained Items contribute the expected mass.

Change an existing weight deliberately and document the balance effect; never change its permanent
ID. Review the [content standard](CONTENT_STANDARD.md) and [release process](RELEASE_PROCESS.md)
alongside this guide when shipping an adjustment.
