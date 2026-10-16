# Catalogue Audit — Milestone 2A

**Audience:** project owner, content authors and maintainers. **Purpose:** provide an evidence-based content baseline and approval decisions before Milestone 2B.

**Audit date:** 2026-10-16. **Baseline:** main `d94d7fb68e52a80d0d03e7b4b46d4d5c463484eb`, matching public `v0.3.29` and its release target. Module ID `devils-table-merchants`; author Devilclarke; Foundry 14 / D&D5e 5.3.3 / 2014 rules. Default branch and release were checked on GitHub before creating `milestone-2a-catalogue-audit`. This branch changes audit documentation only; it does not update the version, content or public release.

## Executive findings

- **440 unique canonical Items**, **40 services**, **26 templates**, **25 stock profiles**, **100 generated active RollTables**. No duplicate canonical IDs, generated Item IDs or exact names were found. One same-function duplicate pair is verified: ordinary padlocks at 4 gp and 10 gp.
- **125 of 241 SRD equipment-table entries represented: 51.87%.** The denominator is explicit below. This is presence coverage, including reviewed project adaptations and two incomplete tool mappings, not a claim of exact official statistics or all SRD magic-item coverage.
- All **37 weapons, 12 armour types, one shield and four ammunition types** are represented. Weapon damage, versatile dice, properties, range and proficiency categories, and armour AC, Strength, Dexterity limits and Stealth properties match the compared SRD fields. Lance and net special rules are stated for manual GM adjudication. Live Foundry enforcement was not tested.
- The largest missing families are spellcasting supplies, healer supplies, tools/instruments, clothes, seven equipment packs, mounts, vehicles and commodities. See every source row in the coverage matrix.
- **53 matched source entries have different base prices** (sale units normalized); **98 have deliberate weight differences**. These are not automatically errors: current standards deliberately reprice mundane goods and adjust encumbrance weights. The new request to preserve SRD prices conflicts with that established policy and needs an explicit owner decision before corrections.
- All 440 item descriptions, prices, sale units, weights and source fields are populated. All 47 module-owned item icon references resolve locally; 393 item references point to known core icons, whose installed-file existence was not tested here.
- Existing schema, semantic, documentation and regression checks pass (**412 tests**). Passing checks establish structural integrity, not economic correctness, exhaustive SRD completeness, asset rights or live-world compatibility.

## Evidence and reproducibility

The [SRD 5.1 CC PDF](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf) was downloaded from the requested official URL. Equipment tables and commerce prose were inspected directly, especially pp. 62–74; potion rules were checked on pp. 233–234. The PDF SHA-256 and exact baseline commit are embedded in each JSON deliverable. Page references are PDF/printed page numbers, which coincide in this file.

Analysis used the actual exported `loadStockCatalogue`, `catalogueEntryToItem`, `stockProfiles`, `stockGroups`, `stockTableDocuments` and `estimateGeneration` functions. Temporary analysis scripts stayed outside the repository; no new audit tooling, tests or validators are introduced. JSON inventories are static review snapshots: regenerate or reconcile them deliberately after future approved changes. [Validation Record](VALIDATION_RECORD.md) describes checks and limits.

### Audit files

| File | Purpose |
| --- | --- |
| [ITEM_INVENTORY.json](ITEM_INVENTORY.json) | Every current Item: canonical/generated identity, source location, native type, price, weight, sale unit, description/icon status, membership and all profile-tier memberships |
| [CATALOGUE_COVERAGE.json](CATALOGUE_COVERAGE.json) | Every selected SRD equipment-table row with stable source ID, page, official values, exact match/candidate IDs, status, price/weight comparison and selected mechanical evidence |
| [SERVICE_INVENTORY.json](SERVICE_INVENTORY.json) | Every current service: pricing, duration, availability, visibility, target and fulfilment/integration limits |
| [SERVICE_COVERAGE.md](SERVICE_COVERAGE.md) | Official hospitality/transport/labour benchmarks and original service proposals, separate from current offers |
| [STOCK_AUDIT.json](STOCK_AUDIT.json) | All 25 profile pools and 225 analytical settlement/prosperity scenarios using the actual Builder estimator |
| [CONTENT_EXPANSION_PLAN.md](CONTENT_EXPANSION_PLAN.md) | Sequenced implementation proposals and owner decision gates |
| [VALIDATION_RECORD.md](VALIDATION_RECORD.md) | Reproducibility, checks, scope boundaries and observations |

## Current catalogue inventory

### By merchant

Assignments overlap intentionally: one Item can belong to several merchants. Counts below total **511 memberships**, not 511 unique Items. Authoring files are grouped by original authoring location, not exclusive ownership.

| Merchant | Assigned unique Items | Services | Templates | Profiles | Active tables |
| --- | ---: | ---: | ---: | ---: | ---: |
| General Store | 144 | 0 | 3 | 4 | 16 |
| Tavern | 205 | 16 | 9 | 6 | 24 |
| Blacksmith | 73 | 9 | 5 | 5 | 20 |
| Alchemist | 41 | 5 | 4 | 4 | 16 |
| Fence / Black Market | 48 | 10 | 5 | 6 | 24 |
| Unique total | 440 | 40 | 26 | 25 | 100 |

General Store has no built-in services. This is verified source state, not a framework limitation. Alchemist shares six goods, Blacksmith fifteen and Fence thirteen with other catalogues.

### By canonical category

The 55 canonical category totals below count each Item once. Merchant columns count assignments; shared goods keep their original canonical category and appear in each assigned merchant column.

| Category | Unique | General Store | Tavern | Blacksmith | Alchemist | Fence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| alchemical-tools | 5 | 0 | 0 | 0 | 5 | 0 |
| ale | 8 | 0 | 8 | 0 | 0 | 0 |
| ammunition | 4 | 0 | 0 | 4 | 0 | 0 |
| animal | 12 | 12 | 1 | 2 | 0 | 0 |
| animal-feed | 8 | 0 | 8 | 0 | 0 | 0 |
| beer | 8 | 0 | 8 | 0 | 0 | 0 |
| bread | 8 | 0 | 8 | 0 | 0 | 0 |
| breakfast | 8 | 0 | 8 | 0 | 0 | 0 |
| burglary-tools | 4 | 0 | 0 | 0 | 0 | 4 |
| camping | 21 | 21 | 10 | 0 | 0 | 0 |
| cheese | 8 | 0 | 8 | 0 | 0 | 0 |
| containers | 13 | 13 | 7 | 1 | 3 | 3 |
| contraband | 3 | 0 | 0 | 0 | 0 | 3 |
| curiosities | 5 | 0 | 0 | 0 | 0 | 5 |
| desserts | 8 | 0 | 8 | 0 | 0 | 0 |
| dinner | 8 | 0 | 8 | 0 | 0 | 0 |
| disguises | 5 | 0 | 0 | 0 | 0 | 5 |
| fire-lighting | 17 | 17 | 11 | 2 | 2 | 0 |
| fish | 4 | 0 | 4 | 0 | 0 | 0 |
| forgery | 7 | 0 | 0 | 0 | 0 | 7 |
| glassware | 6 | 0 | 0 | 0 | 6 | 0 |
| heavy-armour | 4 | 0 | 0 | 4 | 0 | 0 |
| herbs | 8 | 0 | 0 | 0 | 8 | 0 |
| hot-drinks | 8 | 0 | 8 | 0 | 0 | 0 |
| household | 18 | 18 | 6 | 0 | 0 | 0 |
| imported-drinks | 4 | 0 | 4 | 0 | 0 | 0 |
| ingredients | 5 | 0 | 0 | 0 | 5 | 0 |
| light-armour | 3 | 0 | 0 | 3 | 0 | 0 |
| lunch | 8 | 0 | 8 | 0 | 0 | 0 |
| luxury-meals | 8 | 0 | 8 | 0 | 0 | 0 |
| martial-weapons | 23 | 0 | 0 | 23 | 0 | 2 |
| mead | 8 | 0 | 8 | 0 | 0 | 0 |
| medium-armour | 5 | 0 | 0 | 5 | 0 | 0 |
| non-alcoholic-drinks | 8 | 0 | 8 | 0 | 0 | 0 |
| poisons | 2 | 0 | 0 | 0 | 0 | 2 |
| potions | 5 | 0 | 0 | 0 | 5 | 0 |
| rare-components | 2 | 0 | 0 | 0 | 0 | 2 |
| reagents | 6 | 0 | 0 | 0 | 6 | 1 |
| roasts | 8 | 0 | 8 | 0 | 0 | 0 |
| rope-climbing | 10 | 10 | 1 | 3 | 0 | 1 |
| shields | 1 | 0 | 0 | 1 | 0 | 0 |
| simple-weapons | 14 | 0 | 0 | 14 | 0 | 1 |
| smuggling | 4 | 0 | 0 | 0 | 0 | 4 |
| snacks | 8 | 0 | 8 | 0 | 0 | 0 |
| soups | 4 | 0 | 4 | 0 | 0 | 0 |
| spirits | 8 | 0 | 8 | 0 | 0 | 0 |
| stews | 8 | 0 | 8 | 0 | 0 | 0 |
| stolen-goods | 3 | 0 | 0 | 0 | 0 | 3 |
| tavern-supplies | 4 | 0 | 4 | 0 | 0 | 0 |
| tools | 19 | 16 | 0 | 8 | 0 | 1 |
| trade-goods | 12 | 11 | 0 | 3 | 0 | 0 |
| travel | 13 | 13 | 1 | 0 | 0 | 2 |
| travel-meals | 8 | 0 | 8 | 0 | 0 | 0 |
| wine | 8 | 0 | 8 | 0 | 0 | 0 |
| writing | 13 | 13 | 0 | 0 | 1 | 2 |

### Native Item types and provenance

| Native Item type | Count |
| --- | ---: |
| Consumable | 190 |
| Loot | 173 |
| Weapon | 37 |
| Container | 21 |
| Equipment | 13 |
| Tool | 6 |

All generated Items start at quantity one; quantity means one explicit purchase unit, not necessarily one physical piece. Pitons are bundles of ten; ammunition is sold individually.

Source declarations split into **88 records explicitly naming CC-BY-4.0/SRD mechanics** and **352 declaring original project content/text**. All original-text licences remain pending. These are source-label counts, not a legal determination of origin; a mundane original product may cover an SRD shopping function. SRD coverage and source labels are independent dimensions.

| Exact source licence declaration | Records |
| --- | ---: |
| Original project content; distribution license pending. | 293 |
| Original project text: distribution license pending; referenced SRD 5.1 rules: CC-BY-4.0. | 20 |
| SRD 5.1 mechanics: CC-BY-4.0. Original project descriptions: distribution license pending. | 56 |
| SRD 5.1 mechanics: CC-BY-4.0; original text distribution license pending. | 2 |
| SRD 5.1 mechanics: CC-BY-4.0; Original project text: distribution license pending. | 10 |
| Original project text: distribution license pending. | 59 |

## SRD coverage methodology and results

The **241-entry denominator** is the priced/named Equipment table entries on pp. 63–72: 37 weapons, 13 armour/shield entries, 95 adventuring goods, four ammunition bundles, 35 tools, seven equipment packs, eight mounts, thirteen tack/land-vehicle entries, six waterborne vehicles and 23 individually split trade commodities/livestock. Barding is one formula entry. The tools-table vehicle proficiency cross-reference is not an extra product. Feed is counted as a tangible daily feed unit; stabling is in the service matrix. Food/drink/lodging, lifestyles, hirelings and transport fares are audited separately as commerce offers, preventing a changing service denominator from obscuring equipment coverage.

A source row is **represented** if an equivalent functional sale unit is present, even when an explicitly authored price/weight adaptation requires review. Source ammunition bundles are compared to individual project pieces by unit price. Pitons are normalized from one source piton to a project ten-piton bundle. Armour spelling and reordered weapon names are aliases, not gaps.

Seven near matches are **not** counted as source-unit coverage: a one-quart bottle versus the SRD 1.5-pint bottle; a blank book versus a book of content; a cloak versus a full traveller outfit; a rope ladder versus a rigid ten-foot ladder; a two-quart camp pot versus a one-gallon iron pot; a one-ounce vial versus a four-ounce vial; and stolen jewellery versus an ordinary signet ring. These variants remain useful and should not be deleted merely to improve the coverage number. A broken focus explicitly cannot function as a spellcasting focus.

| SRD group | Source entries | Represented | Presence coverage |
| --- | ---: | ---: | ---: |
| simple-melee | 10 | 10 | 100.00% |
| simple-ranged | 4 | 4 | 100.00% |
| martial-melee | 18 | 18 | 100.00% |
| martial-ranged | 5 | 5 | 100.00% |
| light-armour | 3 | 3 | 100.00% |
| medium-armour | 5 | 5 | 100.00% |
| heavy-armour | 4 | 4 | 100.00% |
| shields | 1 | 1 | 100.00% |
| adventuring-gear | 95 | 55 | 57.89% |
| ammunition | 4 | 4 | 100.00% |
| tools | 35 | 8 | 22.86% |
| equipment-packs | 7 | 0 | 0.00% |
| mounts | 8 | 0 | 0.00% |
| tack-and-land-vehicles | 13 | 2 | 15.38% |
| waterborne-vehicles | 6 | 0 | 0.00% |
| trade-goods | 23 | 6 | 26.09% |

The matrix contains **71 complete**, **2 incomplete**, **1 duplicate**, **58 needs-review** and **109 missing** rows. Seven needs-review rows are the unrepresented near matches above. Thus **116 entries lack an equivalent source unit**: 109 missing plus seven near matches. The remaining review rows mostly reflect intentional project price choices. `complete` permits a documented weight adjustment; it does not mean an exact official-weight edition. No single percentage should be presented as “rules-perfect”.

The supplementary magic review records the three higher healing potions and climbing potion outside the core denominator. Their rules are in SRD 5.1; their prices are project choices, not inferred official fixed prices. A complete catalogue of all SRD magic items, every priced spell component, every poison or book-specific product is **not** claimed. Later alchemical/magical expansion requires its own explicit source-entry baseline rather than treating this 241-row baseline as all possible D&D commerce.

### Missing essentials

- Adventuring: acid, alchemist’s fire, antitoxin, healer’s kit, ball bearings, caltrops, hunting trap, quiver, bolt case, ten-foot pole, rigid ladder, portable ram, magnifying glass, perfume, robes and complete clothing sets.
- Spellcasting: component pouch, spellbook, all five arcane focuses, all four druidic focuses, all three holy-symbol forms and holy water. Broken Spell Focus and stolen reliquary are not approved substitutes.
- Tools: 15 of 17 artisan tool sets are absent; herbalism and navigator’s tools are absent; all ten musical instruments are absent. Two gaming sets exist physically but lack native tool proficiency mappings.
- Transport: all eight priced mounts, six waterborne vehicles, carriage/cart/chariot/sled/wagon, four saddles, bit/bridle and barding. Selling living creatures/vehicles needs an agreed representation and manual handover, not an assumed inventory-to-Actor converter.
- Commodities: wheat, flour, chicken, cotton, ginger, goat, cinnamon, pepper, sheep, cloves, pig, silver, cow, saffron, ox, gold and platinum. A mixed grain feed bag is not automatically wheat; a spice parcel is not a pound of a named spice.
- Services: priced coach fares, ship passage, skilled/untrained hire, per-mile messenger, tolls and ammunition silvering. Existing local courier, served meal and room options are useful original offers, not the source units/grades.

## Findings requiring review

### AUD-DUP-01 — One verified same-function duplicate pair

`DT_ITEM_GS_PADLOCK` (Padlock, 4 gp) and `DT_ITEM_BSM_LOCK` (Lock, 10 gp) both supply an ordinary iron padlock and key, use the DC 15 thieves’ tools benchmark, weigh 0.5 lb and use the same icon/native loot mapping. Neither describes a meaningful quality or security difference. This is **one pair / two records**, not two duplicate IDs. Consolidation or a documented product distinction needs an identity-preserving migration plan; do not simply delete an ID or change existing world copies.

No other exact-name, exact-description or duplicate canonical/document-ID groups were found. Similar mortars, multiple candles, cloaks and containers have distinct units or specifications and are candidates for human review, not proven duplicates. The six capacity/function near matches and ordinary signet gap are explicitly recorded, not automatically merged.

### AUD-PRICE-01 — Official-price policy versus established project economy

The current [Price Guide](../PRICE_GUIDE.md) deliberately uses 1–9 cp, 1–9 sp and whole gp and treats official prices as reference. The requested audit policy asks to preserve official prices unless an intentional configurable variation is marked. Base price adaptations are authored constants; general merchant modifiers exist, but there is no switch that restores per-item SRD prices. The schema also cannot express every official individual unit price, such as a sling bullet at 0.2 cp. **Owner decision required:** keep explicitly labelled project economics, adopt official base prices with a reviewed project-price layer, or offer separately specified units/variants. No prices were changed.

53 matched SRD rows differ after unit normalization. Examples: ink 1 ounce is 2 sp versus 10 gp; spyglass 100 gp versus 1,000 gp; sack 1 sp versus 1 cp; healing potion 40 gp versus 50 gp; alchemist’s supplies 35 gp versus 50 gp; hooded lantern 6 gp versus 5 gp. These are not conversion bugs. The lock pair adds an independent inconsistency. Arrow and blowgun needle individual prices normalize correctly; crossbow bolt is 2 cp versus source 5 cp per piece, and sling bullet 2 cp versus source 0.2 cp. Review the explicit ammunition unit policy before treating them as ordinary price typos.

### AUD-WEIGHT-01 — Preserve intentional adjustments; improve comparative metadata

98 matched rows have different weights on equivalent normalized units; 17 represented rows have an unspecified source weight rather than a numeric baseline. All 440 configured weights are finite, positive pounds (0.002–52 lb), with nonblank explanatory notes; no missing, negative or silently zeroed weights were found. All 50 weapons/armour/shield records use the declared 80% baseline rule except the sling's practical positive weight where the SRD has a dash. Do not reverse those values during a data cleanup.

Waterskin is sold empty at 0.5 lb with two quarts/four pounds of water capacity: 4.5 lb filled, compared with the SRD's 5 lb full. Its 0.5 lb is not an accidental tenfold underweight waterskin. Container capacity is not shell weight. Rationale for some Alchemist/Fence stock is repeated boilerplate; consider recording a source weight, unit basis and item-specific adjustment reason as structured metadata in a separately approved content-contract change.

### AUD-TOOL-01 — Two gaming-set mappings incomplete

`DT_ITEM_TAV_BONE_DICE` and `DT_ITEM_TAV_PLAYING_CARDS` are `loot/gear`, deliberately leaving gaming checks to the GM. They cover physical sets but not native D&D5e `tool/game` associations. Native `tool/game` is already accepted by item validation, so a reviewed content remap can reuse the existing framework; preserve identities and assess existing-world type-change conflicts before shipping.

### AUD-META-01 / AUD-META-02 — Source branding and magic rarity

296 Items still use the earlier “Devil’s Table: Goods & Provisions” source title, while 144 use the current title. This is source metadata, not a competing module ID, but generated source displays are inconsistent. Preserve actual historical attribution while clarifying the current collection title in a later metadata pass.

All five potions omit native `system.rarity`: the four healing strengths and climbing potion do not display their SRD rarity through the converter. The schema/converter currently has no supported generic rarity field. Healing dice and the action-per-dose behaviour match the inspected SRD values; climbing speed/advantage are described for manual application. Add rarity metadata only after reviewing a generic data-contract extension, not with an Alchemist-specific converter branch.

### AUD-UNIT-01 — Capacity variants and incomplete native representations

The seven near matches are retained rather than incorrectly certified as exact source-unit coverage. `DT_ITEM_ALC_VIAL` is also loot/material with a one-ounce description, not a native four-ounce container. A source-complete version needs a distinct, clear sale unit and reviewed container mapping. The current Barrel and Wash Bucket prioritize liquid volume; their separate SRD solid capacities are not independently represented as alternate native capacity modes. Clarify this limit rather than claiming both are fully automated.

### AUD-ICON-01 — Three likely off-theme references

Obsidian Idol, Broken Spell Focus and Foreign Medallion all reference `icons/sundries/books/book-rounded-red.webp`. The path is known, but the depicted subject is a book, not the listed object. Review replacements from approved references before release. This is a semantic asset finding, not a broken-file claim. No item has an empty icon path or generic `icons/svg` placeholder. Room services use a shared bedroll icon and all ten Fence services use a generic book SVG; these are optional polish candidates, not functional failures.

### AUD-SERVICE-01 — 40 offers lack per-record source/licence metadata

The current service schema has no `source` field. Only silvering one weapon directly matches a verified SRD fixed benchmark. Other defined prices, durations and recommended ranges are project offers even when the activity is official commerce. All work is manual after payment; no current service definition automatically manufactures, repairs, heals, identifies or delivers an Item. Accommodation can use configured optional room actions. Audit inference is labelled in the inventory; do not brand project defaults as published prices.

### AUD-STOCK-01 — Reachable content, uneven assortment and rarity exposure

Every one of the 511 merchant memberships appears in at least one appropriate stock profile. Every active category definition has assigned products. No indexed Item is orphaned, no registered source file is missing, and generated stock references resolve to the generated Item/table set. Base profiles include every assigned good. Specialised exclusions are authored and intentional; exclusions are not missing canonical content.

Stock weighting is **uniform within a chosen tier**, not a per-product frequency field. Always-tier stock adds every member without using a rotating draw. Settlement/prosperity changes draws, ordinary quantities and rare-tier chance, but does not reduce the Always pool or invent settlement-only membership filters. Thus Village General Store guarantees 82 products even in a poor settlement, while Village Blacksmith guarantees three; this deserves balance review rather than an automatic reduction. New core goods should not all default to Always.

The base Village Blacksmith has 41 Rarely products out of 73, with 8 draws at 15% rare per draw under average conditions: an individual rare item has about 2.93% inclusion probability in one generated stock list. All stock exists and is reachable, yet frequently desired equipment may be hard to roll in that base profile. Town and military profiles broaden access.

Village Herbalist can roll superior/supreme healing, while Town Alchemist excludes them; master retains access. This is documented current policy, but is counter to a simple settlement progression and merits an owner balance decision. The 225 analytical scenarios expose actual current settings rather than assuming City always has every item.

Fence profiles retain four guaranteed practical goods and 1–2 unit caps. Cautious Fence Village/Poor expects 7.90 distinct products; Village/Average expects 10.40. The base Fence Village/Average expects 12.50. Rare stock is deliberately more likely than at legal merchants; hidden inventory may make the player-visible assortment smaller than these totals.

Roadside Tavern and Travelling Smith have empty rare pools. A rare-tier draw yields no extra stock; it does not promote another tier. This is intentional, but reviewers may decide whether the empty probability is desirable.

Restock daily/weekly settings are preferences only: no automatic timed stock replenishment runs. Applying stock preserves persistent Actor inventory semantics; a fresh-stock expectation is not a claim about additions to an already stocked Actor.

## Architecture and extension assessment

Canonical pipeline: `data/catalogue.json` → 57 active JSON item arrays → schema and semantic validation → deterministic Item conversion → world master Item compendium. `data/catalogues.json`/categories/memberships select views; `data/stock.json`, quantity policy and economy generate stable stock profiles/tables. The Builder adds settlement/prosperity scaling and previews. Services are a separate registry, not Item duplicates.

The generated world collections are `world.devils-table-items`, `world.devils-table-stock-tables`, `world.devils-table-merchant-templates` and transaction Journal history (`world.devils-table-transactions`). No generated pack databases are bundled in the manifest. The audit generated plans in memory; it did not inspect an actual campaign's installed compendiums, actors or receipts. “No orphan” is a source/plan finding, not a claim that every campaign has been cleaned.

442 Item IDs are reserved: 440 active plus `DT_ITEM_BSM_IRON_BAR` and `DT_ITEM_BSM_COPPER_BAR`, unused reservations preserved against reuse. Shared active bars use `DT_ITEM_GS_BAR_IRON` and `DT_ITEM_GS_BAR_COPPER`. The table ledger has 200 reservations, of which 100 generate current tables; retired category scopes are identity history, not 100 broken live tables.

No evidence requires a new merchant-specific architecture. Existing native mappings can add most mundane tools/gear and manual services. Genuine generic limits must be stated: the single-dose consumable converter cannot author a native ten-use healer’s kit; native focus/scroll consumable and equipment subtypes are not currently accepted; rarity/source-price metadata have no authored contract; compound equipment-pack fulfilment and living mount/vehicle handover are not automatic. These are scoped adapter/data-contract proposals for later review, not reasons to rewrite trading, payments, profiles or public APIs during the audit.

## Licensing and source boundaries

SRD 5.1 is available under CC-BY-4.0 with its prescribed attribution. The repository retains SRD and upstream D&D5e notices. Compare the attribution wording to the exact p. 1 notice during release preparation; current notices link the PDF rather than the originally prescribed resources page. Core icon paths reference the installed library and do not grant rights to redistribute core artwork. Original project artwork, descriptions and code still have no selected downstream reuse licence; public repository access alone does not specify one. The owner may distribute their own work, but external reuse/contribution terms remain unclear.

| Source family / proposed use | Current permission basis | Audit disposition |
| --- | --- | --- |
| Equipment, services and potion mechanics actually in SRD 5.1 | CC-BY-4.0, retain required attribution and indicate adaptations | Eligible; use exact page entries and independent wording |
| PHB 2014 equipment also in SRD | SRD entry, not ownership of the whole PHB | Eligible only through the matched SRD content |
| PHB-only gaming sets, trinket-table text or extra book text | No additional redistribution licence established here | `not-distributable` on the current project licence basis; permission review or independent generic design, no protected text copied |
| DMG 2014 items outside SRD, additional poison descriptions/prices or setting-specific material | No additional redistribution licence established here | Quarantine proposed direct reproduction; first check an exact SRD overlap, otherwise obtain permission or author an independent alternative |
| Xanathar tool expansions, crafting/downtime tables and named common magic items | Not presumed licensed merely because official or readable online | Do not import tables/text; independently authored services can use SRD baselines without copying the supplement |
| Sword Coast/adventure-specific branded goods, characters, places and narrative descriptions | No product-specific redistribution permission established | Avoid protected setting expression; use original regional descriptions or request permission |
| Original household, food, clothing, materials and professional-service designs | Project-authored; downstream licence undecided | Useful original expansion, explicitly labelled original rather than official D&D content |

`not-distributable` here means no permission basis has been established for the proposed direct reproduction in this GitHub package. It is not a claim that independently created mechanics/concepts or every work in a publication are prohibited. This audit does not determine copyright status for arbitrary mechanics, grant permission, or treat DMsGuild-specific permissions as a licence for a general GitHub module.

Official source checks: [SRD page and licensing FAQ](https://www.dndbeyond.com/srd), [Creator FAQ](https://www.dndbeyond.com/creator-faq), [PHB 2014 contents](https://www.dndbeyond.com/sources/dnd/phb-2014). Public Basic Rules availability is not itself a licence for all online material; use the downloaded CC SRD as the reusable rules baseline.

## Validation recommendations

Existing schema/semantic validation already rejects duplicate IDs, unsupported Item types, invalid prices/currencies, negative/missing weights, unsafe icon paths, missing memberships and broken stock references. Tests exercise builder idempotence and selected native mechanics. Reuse these instead of adding redundant tests.

Recommended later additions, subject to approval:

1. Validate a reviewed SRD coverage baseline and aliases; fail on an unexpectedly lost match rather than treating every pending gap as a CI failure.
2. Verify official-vs-project values against explicit source unit counts, empty/full state, price policy and documented weight exceptions. Do not infer economic equality from display names.
3. Add a reviewed same-function duplicate/allowed-variant list (including the padlocks); fuzzy name checks should suggest review, not merge records.
4. Add service provenance once its generic schema is approved; distinguish published benchmarks, original defaults and GM quotes.
5. Validate potion rarity, native tool bases and future multi-use consumable mappings with meaningful converter/read-back checks.
6. Check installed core icon paths in an authorized Foundry test environment and visually review off-theme references; existing reference fixtures are not file existence proof.
7. Add profile reachability and stock-envelope checks for expected settlement differences and rare probabilities using the existing estimator, with approved bounds rather than fragile exact random lists.
8. Continue generated-compendium convergence checks and compare semantic source-owned fields, preserving reserved IDs and world edits outside builder ownership.

No new tooling or tests were implemented during this audit.

## Priorities and recommended next task

First decide price policy, duplicate identity treatment and scope of native multi-use/focus/rarity support. The smallest content-only high-value addition is **eight entries**: component pouch, spellbook, herbalism kit, navigator’s tools, quiver, crossbow bolt case, rigid ten-foot ladder and ten-foot pole. These use current loot/tool/container mappings with manual rules where stated. Reserve stable IDs only after approval, assign appropriate existing merchants and add conservative stock rules. Do not slip a healer’s-kit converter redesign into that batch.

Milestone 2B should cover that small foundation, approved padlock/metadata decisions, then essential consumables and spellcasting supplies under separately reviewed generic adapter work where needed. See [Content Expansion Plan](CONTENT_EXPANSION_PLAN.md) for acceptance gates and later batches. **Milestone 2B has not begun; no merge to main is authorized by this audit.**

## Related documents

[Audit index](README.md), [Service Coverage](SERVICE_COVERAGE.md), [Price Guide](../PRICE_GUIDE.md), [Weight Guide](../WEIGHT_GUIDE.md), [Source Data](../SOURCE_DATA.md), [Architecture](../ARCHITECTURE.md), [Source Notices](../SOURCE_NOTICES.md).
