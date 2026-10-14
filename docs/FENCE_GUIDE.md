# Fence Guide — Sprint 16 / alpha.27

Fence is the display name of the existing `black-market` catalogue identity. Black Market Dealer, Smuggler and Underground Trader are descriptive aliases. Existing Actor flags, Item identities, stock table IDs and compendium UUIDs are retained. No merchant-specific checkout, wallet, theft or service branch was added.

## Catalogue

48 goods: 35 new records and 13 shared goods. The shared range includes containers, silk rope, writing supplies, a crowbar, ordinary weapons and sulfur. All keep their original price, weight, category and native mechanics. No duplicate “stolen dagger” Item is introduced; the GM records provenance in private notes or custom stock descriptions.

New stock covers disguises, forgery, burglary tools, smuggling props, campaign-dependent contraband, stolen valuables, curiosities, gems and rare components. Disguise Kit, Forgery Kit, Thieves’ Tools and Poisoner’s Kit are native tool Items with 2014 proficiency identities. Basic Poison is a consumable vial with a 2014 action. Coating, the saving throw and extra damage are resolved manually, as its description states. Mundane disguise/forgery supplies add no invented skill bonuses. There are no new magical item powers, firearms, poison recipes or automatic spell-component certification.

Official equipment mechanics were checked against [SRD 5.1](https://www.dndbeyond.com/attachments/39j2li89/SRD5.1-CCBY4.0License.pdf). Native tool mappings use [D&D5e release-5.3.3 config](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/config.mjs) and [ToolData](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/item/tool.mjs). Other stock uses original mundane descriptions. Kit weights use the established 80% baseline adjustment; all other records explain their complete carried sale unit. Contraband and stolen goods are campaign labels, not a universal Forgotten Realms legal system.

Icons reuse reviewed core/module references. `assets/icons/gem.svg` is original project-authored vector geometry, created for this sprint, with no external artwork; it is shared by loose gems/components and has no mechanical meaning.

## Setup

1. Convert an ordinary NPC and apply a Fence template in Merchant Builder.
2. Save Setup. This seeds eligible services once and preserves manual removals and overrides.
3. Build Fence Items and Stock RollTables with the existing content builders. Rebuild the original black-market tables in place after upgrading.
4. Preview stock and cash, review quantities, then explicitly apply.
5. In Stock, expand **Existing stock visibility**. Edit each offer’s mode, completed-purchase threshold and GM reveal toggle, then Save Stock Visibility.
6. In Services, use **Enabled** to manually hide a service or expand Visibility rules for the same shared access policy. Save Service Offerings.
7. Refresh the player Shop after changing offerings. Select the purchasing character to evaluate relationship access.

Templates offer a profile-specific base markup and buying multiplier; both remain editable. Stock-profile selection supplies the assortment and default rules for newly generated offers. It does not rewrite existing stock. Repeated generation preserves existing source identities, including sold-out goods and their visibility overrides.

| Template | Base markup | Buying multiplier | Base draws | Quantity cap | Business emphasis |
| --- | ---: | ---: | ---: | ---: | --- |
| Cautious Fence | +60% | 0.40 | 4 | 1 | Excludes restricted goods and expensive identifiable trophies |
| Greedy Fence | +160% | 0.65 | 7 | 2 | Larger opportunistic pool and higher rare-tier odds |
| Guild Fence | +25% | 0.60 | 8 | 2 | Restricted goods unlock after five completed purchases |
| Travelling Fence | +35% | 0.35 | 4 | 1 | Only goods weighing at most one pound |
| Crime Boss | +100% | 0.75 | 10 | 1 | Valuable stock restricted to established customers |

Settlement and prosperity still scale draws and cash. Profile-specific tier chances weight rare pools more strongly than ordinary legal merchants, and quantity caps apply after settlement scaling. Native manual table draws use the same authored tier odds; quantities and visibility are applied by Roll Stock / Merchant Builder. Suggested negotiation DCs and personality remain editable GM notes; the existing GM interaction review retains final authority.

## Services

All ten services use the shared registry, eligibility, mixed basket, currency settlement, receipts and usage counters. Payment records an agreed consultation or arrangement. It does not perform the fictional task, teleport goods, erase provenance, create Items, locate guaranteed treasure or bypass GM adjudication. Scope, external charges, schedule and outcome must be agreed before approval. Future integrations can use existing service actions.

| Service | Base fee | Default visibility |
| --- | ---: | --- |
| Launder Stolen Goods | 10 gp | Two completed purchases |
| Find Buyer | 5 gp | Public |
| Acquire Contraband | 25 gp | GM reveal; Greedy/Guild/Boss profiles |
| Locate Rare Item | 15 gp | Three completed purchases |
| Arrange Smuggling | 20 gp | Three completed purchases; Guild/Travelling/Boss |
| Forgery Consultation | 5 gp | Public |
| Appraise Illegal Goods | 3 gp | Public |
| Discreet Delivery | 5 gp | Public |
| Commission Theft | 50 gp | GM reveal; Greedy/Boss |
| Smuggling Route | 30 gp | GM reveal; Guild/Travelling/Boss |

## Shared visibility contract

Inventory uses `flags.devils-table.offer.visibility` on the merchant’s embedded Item. Services use an offering-level `visibility` override, falling back to the definition’s default `visibility`. Policies are plain data:

```json
{"mode":"relationship","minPurchases":3,"revealed":false}
```

- `public`: visible to all; absent policies preserve old public behaviour.
- `hidden`: visible only when the GM sets `revealed: true`. Enabling a service alone does not override a hidden default policy.
- `relationship`: visible when this character’s merchant memory has at least the threshold number of `successfulPurchases` (default three). Browsing, failed trades and theft do not increment that counter. The GM reveal toggle or the merchant’s **Reveal relationship offers to all customers** setting also grants access.

Visibility never bypasses catalogue membership, service enablement, economic eligibility, level/type requirements, stock availability or funds. No selected/owned character means no relationship access. Invalid stored policies fail closed. Reveals apply to every customer of this NPC; they are not per-character grants. Relationships remain per-character. Reputation tiers, factions, per-character manual grants and stolen-property tracking are future extensions, not implemented mechanics.

The active GM computes visibility before sending public Shop projections, before quoting checkout and before allowing theft. Hidden offers are absent rather than marked “secret”. Prices, names and IDs for hidden offers do not enter the Shop response. Guessing a stock ID cannot purchase or steal it. Shared module JSON/compendiums are reference content, not secret storage; do not place campaign secrets in public definitions. NPC ownership must remain GM-only. Transfer removes merchant offer flags from customer Items.

All stock visibility writes use the existing administration guard, stale-state detection and read-back verification. Service overrides use existing guarded service saves. Hidden offer changes cannot be applied through these controls during an active checkout or unresolved recovery.

## Framework review

**Can every current merchant type use the same Merchant Framework without bespoke code? Yes, for the implemented scope.** General Stores, Taverns, Blacksmiths, Alchemists and Fences share catalogue registration, native stock, Builder, pricing, per-character memory, transactions, services and optional actions. The new visibility policy, profile tier odds and quantity caps are merchant-neutral capabilities. No runtime branch checks for Fence/black-market to decide trading behaviour.

The framework can be considered feature complete for these current merchant types. Next work should focus on content review, polish and release readiness. This is an architectural conclusion and does not certify live compatibility. Full reputation simulation, automatic commission fulfilment and provenance tracking remain out of scope.

## Acceptance

Automated coverage checks canonical builds, isolated customer access, hidden checkout/theft rejection, public projection, manual reveals, disabled/profile-ineligible services, guarded editing, sparse profile generation, mixed checkout, transfer privacy and rollback.

Live Foundry V14 / D&D5e 5.3.3 / Forge checks remain required:

- Apply every template; build/rebuild Items and tables twice; confirm native kits render and roll correctly.
- Use two owned PCs and a player client. Unlock one PC through completed purchases; confirm the other still cannot see the restricted offers.
- Reveal and hide stock/services. Refresh the Shop and verify stale baskets cannot buy hidden stock.
- Verify mixed goods/service checkout, revised offers, finite cash, concurrent last-item purchases, negotiation and theft through the existing review.
- Confirm no campaign notes, visibility policy or hidden offer identity appears in player responses, and purchased Items contain no merchant offer controls.
- Open the Builder with many offerings; inspect tab scrolling, visibility controls and unsaved edits on rerender.
