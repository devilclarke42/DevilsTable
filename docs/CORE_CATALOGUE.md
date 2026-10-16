# Core Catalogue

**Audience:** GMs and content authors. **Purpose:** describe source-derived core equipment, purchase units, native behaviour and intentional economic/weight adaptations.

## Economy and source policy

Devil's Table's custom economy remains the default. SRD 5.1 prices are references, not replacement prices. Existing goods are not repriced. New source comparisons are retained in `source.reference` and item-specific rationale in `weight.notes`, using the existing data contract. Project capacities are labelled where the SRD supplies only a count or no capacity. Contents are never counted twice.

All new descriptions are original; reusable mechanics are based on the [CC SRD 5.1](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf), pp. 67–70. See [Source Notices](SOURCE_NOTICES.md). Native tool shapes and referenced core icons were checked against [D&D5e release-5.3.3](https://github.com/foundryvtt/dnd5e/tree/release-5.3.3/packs/_source/items). No core icon images are redistributed.

## Essential equipment

| Product | Type / native base | SRD price / weight | Project price / weight | Merchants |
| --- | --- | --- | --- | --- |
| Component Pouch | Container | 25 gp / 2 lb | 12 gp / 1.2 lb | General Store |
| Spellbook | Loot / gear | 50 gp / 3 lb | 25 gp / 2 lb | General Store |
| Herbalism Kit | Tool / herb | 5 gp / 3 lb | 4 gp / 2.4 lb | General Store, Alchemist |
| Navigator's Tools | Tool / navg | 25 gp / 2 lb | 20 gp / 1.6 lb | General Store |
| Quiver | Container | 1 gp / 1 lb | 7 sp / 0.6 lb | General Store, Blacksmith |
| Crossbow Bolt Case | Container | 1 gp / 1 lb | 7 sp / 0.6 lb | General Store, Blacksmith |
| Rigid Ladder, 10 ft. | Loot / gear | 1 sp / 25 lb | 8 cp / 12 lb | General Store |
| Pole, 10 ft. | Loot / gear | 5 cp / 7 lb | 4 cp / 4 lb | General Store |

Component Pouch is stocked with an abstract assortment of ordinary spell components; it never supplies specially priced components. Its carried mass includes those abstract supplies. Native capacity controls only additional physical Items. It does not automatically replenish consumed components or waive a free-hand requirement.

Spellbook contains 100 blank vellum pages. Spells, copying supplies and transcription costs are separate; recording and preparation are manual. Neither it nor Component Pouch is a tool-proficiency Item.

Herbalism Kit and Navigator's Tools use native supported tool base identities, with default Wisdom and Intelligence checks respectively. Possession does not grant proficiency. The GM chooses the appropriate ability and adjudicates scope. Kits do not craft medicine or chart a safe route automatically.

Quiver and Crossbow Bolt Case are sold empty, with one-pound and 1.5-pound native contents allowances respectively. Their project volume limits do not automatically enforce the described twenty-projectile capacity or limit contents to ammunition. The GM checks count and fit.

Rigid ladders and poles keep their full ten-foot length despite reduced carried weight. They do not fit arbitrary containers simply because mass allows it, grant extra weapon reach, or automatically detect traps.

## Availability and stock

The new ordinary essentials use Often stock; Navigator's Tools are Rarely. No new item is guaranteed by every village shop. Existing Town/City draw and prosperity scaling increase opportunities without guaranteeing a complete assortment. Merchant Wagon excludes the rigid ladder and pole; Travelling Apothecary excludes the full herbalism kit; Master Armorer excludes the quiver and bolt case. Other appropriate profiles reuse the same canonical records.

## Validation and limits

Use the normal Item and Stock RollTable builders. New records do not change any existing Item type or ID. A rebuild in a supported world remains required before rolling updated tables. Automated build/stock verification is separate from live Foundry acceptance; no campaign world is attached to development.

See [Content Completeness](CONTENT_COMPLETENESS.md) for delivered batches, coverage and deferred changes.

## Related documents

[Content Standard](CONTENT_STANDARD.md), [Price Guide](PRICE_GUIDE.md), [Weight Guide](WEIGHT_GUIDE.md), [Stock Tables](STOCK_TABLES.md), [Milestone 2A baseline](audits/README.md).
