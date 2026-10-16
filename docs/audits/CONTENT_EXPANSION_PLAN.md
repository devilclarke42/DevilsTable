# Content Expansion Plan — After Milestone 2A

**Audience:** owner, maintainers and content contributors. **Purpose:** sequence small, reviewable content batches from verified gaps. This is a proposal, not authorization to implement Milestone 2B.

**Baseline:** 0.3.29, main `d94d7fb68e52a80d0d03e7b4b46d4d5c463484eb`, audited 2026-10-16. No arbitrary release versions are assigned. Each batch needs source review and normal release validation before publication.

## Decisions before implementation

1. **Base prices:** the requested SRD-preservation goal and current deliberately adjusted Price Guide conflict. Choose an explicit price policy: labelled project adaptations, exact SRD bases, or an approved configurable layer. Record official units and benchmarks before changing values. Existing general merchant modifiers do not restore a different official price for every item.
2. **Identity:** decide how to reconcile Padlock and Lock. Preserve both historic IDs and affected world documents through a reviewed compatibility plan, or establish a real product distinction. No deletion, silent type conversion or ID reuse.
3. **Licence and provenance:** retain SRD/upstream notices, use the required SRD attribution, choose downstream terms for original code/text/artwork, and establish service provenance. No assumption that an entire official book is covered by the SRD.
4. **Automation boundaries:** allow honest manual descriptions where appropriate. Review generic native multi-use, focus/scroll and rarity contracts separately; do not bundle merchant-specific code into a content pass.
5. **Merchant fit:** approve sensible memberships and stock tiers for additions. General Store/Alchemist/Blacksmith/Fence can share one canonical record. A Tavern may arrange a service without being the actual specialist; document that distinction.

## Recommended Milestone 2B — Core Catalogue Completion

Begin with the eight-entry foundation below. It offers useful equipment with existing native mappings and a clear acceptance boundary. Do not make the first implementation task all 116 unrepresented source units.

| Source entry | Existing canonical equivalent | Recommended representation | Proposed merchants | Key acceptance check |
| --- | --- | --- | --- | --- |
| Component pouch | None | Loot/gear, manual component rules | General Store, Alchemist | State costly-component exclusions; distinguish from ordinary pouch |
| Spellbook | None; Blank Book is not equivalent | Loot/gear, 100-page manual spell record | General Store, Alchemist | Do not imply spells are included or prepared automatically |
| Herbalism kit | None | Native tool with reviewed system base | Alchemist, General Store | Correct proficiency/base association; distinguish kit from herb packets |
| Navigator’s tools | None | Native tool with reviewed system base | General Store; optionally travelling Fence | Compass alone is not a complete tool set |
| Quiver | None | Native container | General Store, Blacksmith | Twenty-arrow specification; capacity and empty weight stated |
| Crossbow bolt case | None | Native container | General Store, Blacksmith | Twenty-bolt specification; not a generic document tube |
| Rigid ten-foot ladder | None; rope ladder is a variant | Loot/gear | General Store | Length, rigidity, transport burden and source weight basis explicit |
| Ten-foot pole | None | Loot/gear | General Store | Length and awkward carrying implications explicit; no invented reach bonus |

Canonical IDs shown as absent above are not pre-reserved by the audit. Reserve new permanent IDs through the existing process after approval. Proposed assignments are recommendations, not current memberships. A Fence should stock suitable equivalents with its existing pricing/provenance/visibility policies, not stolen copies under new canonical IDs.

This foundation does not require changing transactions, public APIs, service execution or merchant types. Copy no unlicensed book text; source rules come from the exact CC SRD entries. Native tool shapes must be checked against the pinned system version before implementation.

### Small correction track

Review the padlock pair, two gaming-set native mappings, three off-theme Fence icons and legacy source titles alongside the foundation. A gaming-set type change must handle builder conflicts and existing world copies; it is not safe to alter `loot` to `tool` and assume all rebuilds are transparent. Rarity requires its own approved generic metadata contract. None of these corrections have been applied.

### Second core batch — consumables and hazards

After reviewing the relevant generic mapping limits, consider Healer’s Kit, Acid, Alchemist’s Fire, Antitoxin, Holy Water, Ball Bearings, Caltrops and Hunting Trap. Prioritize explicit use counts, action costs, durations, save DCs, damage and manual adjudication limits.

A healer’s kit has ten uses; the current non-native consumable converter only authors one complete-unit use. Select a reviewed generic reusable/limited-use contract or ship a clearly manual record with accurate bookkeeping instructions. Do not claim ten-use native automation from a one-dose Item. Similarly, no new condition application, ongoing fire scheduler or terrain effects are required merely to sell these goods. Any such automation needs separate approval.

## Later content batches

| Order | Batch | Verified gap / purpose | Conditions before shipping |
| --- | --- | --- | --- |
| 1 | Remaining SRD tools and instruments | Fifteen artisan sets, ten instruments, and native gaming-set completeness | Shared base identity, correct proficiency and tool activities; no copied Xanathar optional rules |
| 2 | Focuses, symbols and clothing | Five arcane focuses, four druidic focuses, three holy symbols, four outfits and robes | Honest manual focus rules or a reviewed generic native subtype extension; original ordinary jewellery distinct from stolen goods |
| 3 | Commodity units and standard-size containers | Seventeen missing trade commodities/livestock; seven equipment near matches with size/function differences | Preserve original useful sizes; match source units; no duplicate canonical records for different sellers; settle price policy first |
| 4 | Equipment packs | All seven packs absent | Reconcile component list and bundle discount; choose manual bundle bookkeeping or approved generic contents fulfilment; avoid extra/free duplicated Items |
| 5 | Tack, mounts, land and water vehicles | Four saddles, bit/bridle, barding, five drawn vehicles, eight mounts, six vessels | Agree Items vs bookings vs Actor handover; manual fulfilment sufficient initially; no carried ship/animal body-weight fiction |
| 6 | Core services and transport | Coach, ship fare, skilled/untrained hire, per-mile messenger, toll and ammunition silvering | Published rates and units explicit; skilled pay is a minimum; labour/route availability GM-confirmed |
| 7 | Hospitality and daily commerce | Six lodging grades, six daily meal grades, named drink units, ordinary meat/banquet | Keep existing original menu variants; room/person and meal/day units clear; no double billing with lifestyles or animal feed |
| 8 | Professional, medical and religious work | Tool repair, custom manufacture, guides/porters/guards, mundane treatment and religious services | GM-agreed concrete quote and completion; no invented universal official price or automatic healing |
| 9 | Alchemical and magical commerce | Existing five potions plus a defined later SRD consumable/component baseline | Set source scope before new completeness percentages; rarity, costly components and manual effects explicit; no automatic import of every DMG item |
| 10 | Illicit commerce quality | Existing Fence services already cover the requested core activities | Improve varied curiosities, provenanced goods and service clarity; no duplicate stolen versions of normal tools; hidden access and low-unit stock remain generic |
| 11 | Original fantasy commerce | Clothing accessories, merchant supplies, raw materials, regional provisions, animal care, repairs and specialist labour | Label original; compare existing 440 goods to prevent cosmetic duplication; define unit, price, adjusted weight and actual use |
| 12 | Balance and acceptance pass | Settlement/profile distribution, rare exposure, stock value versus wallets, icons, live multiplayer | Use approved stock envelopes and actual Foundry acceptance, not only more catalogue records |

These are batch boundaries, not twelve promised releases. Combine or split only when review shows coherent scope. Do not assign a version until an implementation batch is approved and ready for a release candidate.

## Source intake rules

- SRD 5.1 is the primary 2014 reusable baseline. Record exact page/table entry and unit. Preserve source prices unless the approved policy explicitly marks the variation.
- For PHB/DMG content, establish an exact SRD overlap first. For non-SRD text/tables, including Xanathar, Sword Coast and adventure-specific material, establish a licence or permission before copying. Otherwise design an independent original equivalent and label it accordingly.
- Existing borrowed D&D5e native structures retain their upstream notices. Referenced core icons are not assets to repackage.
- Original additions need useful distinctions: a second herbal tea or metal bar is not justified simply by another merchant selling it. A vessel of a different capacity can be a real variant if clearly named and specified.
- Preserve adjusted weights when deliberate. Compare empty/full units and packaging before recommending a change. Do not apply an automatic percentage reduction to all new objects.

## Acceptance criteria for each implementation batch

1. Reviewable source coverage rows name the additions/corrections and exact source/licence basis; original goods are marked original.
2. New IDs are unique and reserved; existing IDs remain stable. Same good across merchants remains one record.
3. Sale units, price and weight refer to the same complete purchase. Official values and approved departures are explicit.
4. Native mappings preserve 2014 behaviour and honestly describe manual portions; no undocumented automatic fulfilment is implied.
5. Memberships, base/variant stock pools, availability/visibility and quantities are reviewed across Village/Town/City and relevant prosperity levels. Avoid adding all new goods to Always.
6. Existing validation and regression tests pass. Add only meaningful tests for new source-contract or behaviour changes, not a duplicate of source JSON.
7. A supported Foundry 14 / D&D5e 5.3.3 world verifies affected item use, rebuild convergence and one relevant purchase/service path. Broader multiplayer/integration acceptance remains a separate release gate.
8. Coverage snapshots and user-facing documentation are reconciled deliberately. No arbitrary completeness target overrides accurate source units or licensing constraints.

## Owner review checklist

Approve the eight-entry foundation, choose the price policy and identify which corrections may ship with it. Approve any generic consumable/rarity/focus extension separately. Review the audit branch before merging. **No Milestone 2B implementation, version bump or main merge is part of Milestone 2A.**

## Related documents

[Catalogue Audit](CATALOGUE_AUDIT.md), [Coverage Matrix](CATALOGUE_COVERAGE.json), [Service Coverage](SERVICE_COVERAGE.md), [Content Standard](../CONTENT_STANDARD.md), [Price Guide](../PRICE_GUIDE.md), [Weight Guide](../WEIGHT_GUIDE.md), [Roadmap](../../ROADMAP.md).
