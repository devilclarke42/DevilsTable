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

The new ordinary essentials use Often stock; Navigator's Tools are Rarely. None of these eight essentials is guaranteed by every village shop. Existing Town/City draw and prosperity scaling increase opportunities without guaranteeing a complete assortment. Merchant Wagon excludes the rigid ladder and pole; Travelling Apothecary excludes the full herbalism kit; Master Armorer excludes the quiver and bolt case. Other appropriate profiles reuse the same canonical records.

## Validation and limits

Use the normal Item and Stock RollTable builders. New records do not change any existing Item type or ID. A rebuild in a supported world remains required before rolling updated tables. Automated build/stock verification is separate from live Foundry acceptance; no campaign world is attached to development.

See [Content Completeness](CONTENT_COMPLETENESS.md) for delivered batches, coverage and deferred changes.

## Related documents

[Content Standard](CONTENT_STANDARD.md), [Price Guide](PRICE_GUIDE.md), [Weight Guide](WEIGHT_GUIDE.md), [Stock Tables](STOCK_TABLES.md), [Milestone 2A baseline](audits/README.md).

## Adventuring and spellcasting expansion

All 95 audited adventuring-gear source units are now represented. The 34 additions preserve ordinary variants: the four-ounce vial, 1.5-pint bottle, one-gallon iron pot and written lore book remain separate from their smaller/larger or blank counterparts. Native clothing and focuses use equipment/trinket without armour AC; twelve focuses have the native `foc` property. No proficiency or spell effect is granted by purchase.

Healer’s Kit is one ten-charge Item. Its activity spends a charge; the GM marks stabilization. Acid, alchemist’s fire, holy water, antitoxin, ball bearings and caltrops consume one complete purchased dose/bundle. Attack rolls, recurring damage, durations, saves and deployed areas remain manual. Hunting Trap and Portable Ram are reusable. Perfume use is tracked manually until a whole vial is empty.

| Addition | SRD reference price / weight | Project price / weight |
| --- | --- | --- |
| Abacus | Abacus: 2 gp; 2 lb | 1 gp / 1.2 lb |
| Acid, Vial | Acid (vial): 25 gp; 1 lb | 15 gp / 0.5 lb |
| Alchemist's Fire | Alchemist’s fire (flask): 50 gp; 1 lb | 30 gp / 0.7 lb |
| Antitoxin | Antitoxin (vial): 50 gp; weight not listed | 30 gp / 0.1 lb |
| Ball Bearings | Ball bearings (bag of 1,000): 1 gp; 2 lb | 7 sp / 1.6 lb |
| Caltrops | Caltrops (bag of 20): 1 gp; 2 lb | 7 sp / 1.6 lb |
| Book of Lore | Book: 25 gp; 5 lb | 8 gp / 3 lb |
| Glass Bottle, 1.5 pint | Bottle, glass: 2 gp; 2 lb | 2 sp / 0.6 lb |
| Common Clothes | Clothes, common: 5 sp; 3 lb | 4 sp / 2 lb |
| Costume Clothes | Clothes, costume: 5 gp; 4 lb | 4 gp / 3 lb |
| Fine Clothes | Clothes, fine: 15 gp; 6 lb | 10 gp / 4 lb |
| Traveller’s Clothes | Clothes, traveler’s: 2 gp; 4 lb | 1 gp / 3 lb |
| Robes | Robes: 1 gp; 4 lb | 8 sp / 3 lb |
| Arcane Focus, Crystal | Arcane focus, crystal: 10 gp; 1 lb | 8 gp / 0.8 lb |
| Arcane Focus, Orb | Arcane focus, orb: 20 gp; 3 lb | 15 gp / 2.4 lb |
| Arcane Focus, Rod | Arcane focus, rod: 10 gp; 2 lb | 8 gp / 1.6 lb |
| Arcane Focus, Staff | Arcane focus, staff: 5 gp; 4 lb | 4 gp / 3.2 lb |
| Arcane Focus, Wand | Arcane focus, wand: 10 gp; 1 lb | 8 gp / 0.8 lb |
| Druidic Focus, Mistletoe | Druidic focus, sprig of mistletoe: 1 gp; weight not listed | 6 sp / 0.02 lb |
| Druidic Focus, Totem | Druidic focus, totem: 1 gp; weight not listed | 8 sp / 0.1 lb |
| Druidic Focus, Wooden Staff | Druidic focus, wooden staff: 5 gp; 4 lb | 4 gp / 3.2 lb |
| Druidic Focus, Yew Wand | Druidic focus, yew wand: 10 gp; 1 lb | 8 gp / 0.8 lb |
| Holy Symbol, Amulet | Holy symbol, amulet: 5 gp; 1 lb | 4 gp / 0.8 lb |
| Holy Symbol, Emblem | Holy symbol, emblem: 5 gp; weight not listed | 4 gp / 0.05 lb |
| Holy Symbol, Reliquary | Holy symbol, reliquary: 5 gp; 2 lb | 4 gp / 1.6 lb |
| Healer's Kit | Healer’s kit: 5 gp; 3 lb | 4 gp / 2.4 lb |
| Holy Water | Holy water (flask): 25 gp; 1 lb | 20 gp / 0.7 lb |
| Hunting Trap | Hunting trap: 5 gp; 25 lb | 4 gp / 18 lb |
| Magnifying Glass | Magnifying glass: 100 gp; weight not listed | 40 gp / 0.1 lb |
| Perfume | Perfume (vial): 5 gp; weight not listed | 3 gp / 0.1 lb |
| Iron Pot, 1 gallon | Pot, iron: 2 gp; 10 lb | 1 gp / 6 lb |
| Portable Ram | Ram, portable: 4 gp; 35 lb | 3 gp / 25 lb |
| Signet Ring | Signet ring: 5 gp; weight not listed | 4 gp / 0.02 lb |
| Glass Vial, 4 fl oz | Vial: 1 gp; weight not listed | 1 sp / 0.08 lb |

## Artisan tools and musical instruments

Fifteen additional artisan sets and all ten audited musical instruments now use native tool Items. Their exact `type.value`, `baseItem` and default ability were checked against the pinned system source. Possession grants no proficiency or guaranteed work/performance result; crafting inputs, workshops, completed goods and instruction remain separate. Musical instruments may serve as bard focuses under the 2014 class rules.

| Tool / instrument | SRD price / weight | Project price / weight |
| --- | --- | --- |
| Brewer's Supplies | Brewer’s supplies: 20 gp; 9 lb | 15 gp / 7.2 lb |
| Calligrapher's Supplies | Calligrapher’s supplies: 10 gp; 5 lb | 8 gp / 4.0 lb |
| Carpenter's Tools | Carpenter’s tools: 8 gp; 6 lb | 6 gp / 4.8 lb |
| Cartographer's Tools | Cartographer’s tools: 15 gp; 6 lb | 12 gp / 4.8 lb |
| Cobbler's Tools | Cobbler’s tools: 5 gp; 5 lb | 4 gp / 4.0 lb |
| Cook's Utensils | Cook’s utensils: 1 gp; 8 lb | 8 sp / 6.4 lb |
| Glassblower's Tools | Glassblower’s tools: 30 gp; 5 lb | 24 gp / 4.0 lb |
| Jeweler's Tools | Jeweler’s tools: 25 gp; 2 lb | 20 gp / 1.6 lb |
| Leatherworker's Tools | Leatherworker’s tools: 5 gp; 5 lb | 4 gp / 4.0 lb |
| Mason's Tools | Mason’s tools: 10 gp; 8 lb | 8 gp / 6.4 lb |
| Painter's Supplies | Painter’s supplies: 10 gp; 5 lb | 8 gp / 4.0 lb |
| Potter's Tools | Potter’s tools: 10 gp; 3 lb | 8 gp / 2.4 lb |
| Tinker's Tools | Tinker’s tools: 50 gp; 10 lb | 40 gp / 8.0 lb |
| Weaver's Tools | Weaver’s tools: 1 gp; 5 lb | 8 sp / 4.0 lb |
| Woodcarver's Tools | Woodcarver’s tools: 1 gp; 5 lb | 8 sp / 4.0 lb |
| Bagpipes | Bagpipes: 30 gp; 6 lb | 24 gp / 4.8 lb |
| Drum | Drum: 6 gp; 3 lb | 4 gp / 2.4 lb |
| Dulcimer | Dulcimer: 25 gp; 10 lb | 20 gp / 8.0 lb |
| Flute | Flute: 2 gp; 1 lb | 1 gp / 0.8 lb |
| Lute | Lute: 35 gp; 2 lb | 28 gp / 1.6 lb |
| Lyre | Lyre: 30 gp; 2 lb | 24 gp / 1.6 lb |
| Horn | Horn: 3 gp; 2 lb | 2 gp / 1.6 lb |
| Pan Flute | Pan flute: 12 gp; 2 lb | 9 gp / 1.6 lb |
| Shawm | Shawm: 2 gp; 1 lb | 1 gp / 0.8 lb |
| Viol | Viol: 30 gp; 1 lb | 24 gp / 0.8 lb |

All 25 are optional stock. Six everyday artisan sets and three common instruments use Often stock; sixteen specialists use Rarely in the base profile. City profiles may draw all 25 from Often pools, without making every entry guaranteed. Original gaming-set types remain deferred for migration review.

## Commodity additions

Eleven additional commodities use native trade loot. One Item quantity is one complete purchase unit: a pound of grain, spice or bullion, or a square yard of cloth. Stock quantities count additional complete units. Splitting, processing and converting bullion into currency are manual.

| Commodity | SRD benchmark | Project price / weight |
| --- | --- | --- |
| Wheat | Wheat (1 lb): 1 cp; 1 lb | 1 cp / 1 lb |
| Flour | Flour (1 lb): 2 cp; 1 lb | 2 cp / 1 lb |
| Cotton Cloth | Cotton cloth (1 sq yd): 5 sp; weight not listed | 5 cp / 0.25 lb |
| Ginger | Ginger (1 lb): 1 gp; 1 lb | 8 sp / 1 lb |
| Cinnamon | Cinnamon (1 lb): 2 gp; 1 lb | 1 gp / 1 lb |
| Pepper | Pepper (1 lb): 2 gp; 1 lb | 1 gp / 1 lb |
| Cloves | Cloves (1 lb): 3 gp; 1 lb | 2 gp / 1 lb |
| Silver Bar | Silver (1 lb): 5 gp; 1 lb | 5 gp / 1 lb |
| Saffron | Saffron (1 lb): 15 gp; 1 lb | 12 gp / 1 lb |
| Gold Bar | Gold (1 lb): 50 gp; 1 lb | 50 gp / 1 lb |
| Platinum Bar | Platinum (1 lb): 500 gp; 1 lb | 500 gp / 1 lb |

Cotton uses the established textile economy (between existing linen and canvas), rather than importing a mismatched SRD price. Bullion retains full source mass and metal value. Silver, gold and platinum are shared canonical Items for General Stores, Blacksmiths and Fences. Their ordinary commodity status does not imply stolen provenance. The Crime Boss profile’s existing generic valuable-goods rule gates them behind relationship level five. Gold and platinum remain Rarely even for city shops, with the existing rare-stock one-or-two-unit distribution.

## Equipment packs and livestock

The seven pack manifests and proposed fulfilment workflow are in [Equipment Pack Fulfilment](EQUIPMENT_PACKS.md). They are not purchasable full-pack records. Six animal commodities also await a reviewed handover representation. These omissions remain visible in [Content Completeness](CONTENT_COMPLETENESS.md).
