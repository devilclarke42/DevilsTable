# Design Decisions

This is the project's durable decision record. The decisions below are accepted standards unless
explicitly marked as planned. They explain the reasons and consequences behind the current design;
implementation details remain in [ARCHITECTURE.md](ARCHITECTURE.md).

When a decision changes, add a dated amendment describing the evidence, consequences and migration.
Do not erase the old rationale or quietly change an identity contract. Current user instructions
and reviewed repository decisions must be reflected together before implementation proceeds.

## 1. JSON source is canonical

**Decision:** author product data, merchant definitions, category plans, stock policy and quantity
policy as reviewable JSON in the repository.

**Why:** structured source can be validated, diffed, reviewed, regenerated and scaled to thousands
of Items. A binary Foundry database or a collection edited in one person's world is a poor shared
authoring record and hides accidental drift.

**Consequences:** edit source before rebuilding; register content files explicitly; reject unknown
fields and unsupported mechanics. Generated descriptions, compendium databases and ZIPs are outputs.
Manual changes to actor/world copies do not become official catalogue changes.

## 2. Compendiums are generated

**Decision:** modular builders turn validated source into one world Item compendium and one stock
RollTable compendium. Items and tables have separate settings actions.

**Why:** generation makes the content reproducible while preserving native Foundry documents and
real UUID references. Separate builders make the dependency clear: Items exist before tables link
to them. Generating world packs works with the current Forge installation workflow.

**Consequences:** normal rebuilding creates missing documents, updates owned fields and skips
unchanged data. It does not update actor inventories or automatically populate the RollTables tab.
Generated databases are not committed or bundled in the current runtime ZIP. World copies are
independent. A future bundled-pack release requires its own reviewed packaging and migration design.

## 3. Variant Encumbrance guides adjusted weights

**Decision:** use 2014 mechanics with individually authored adjusted weights in pounds.

**Why:** meaningful transport choices are central to the intended play, but some official mundane
weights impose excessive burdens or hide a distinction between an empty and a filled object.
Blind multiplication would preserve those inconsistencies.

**Consequences:** copy source mass exactly; document the rationale and complete sale unit; count
contents and packaging once. Ordinary containers never grant weightless storage. The module does
not change world encumbrance settings. See [WEIGHT_GUIDE.md](WEIGHT_GUIDE.md).

## 4. Icons are shared

**Decision:** reuse suitable core and project icons, with lightweight 256×256 WebP as the standard
for new module-owned raster assets.

**Why:** shared imagery keeps downloads, caching and maintenance manageable as the catalogue grows.
Many product variations are better distinguished by a readable name than another near-identical image.

**Consequences:** search the existing library first, avoid duplicate exports, review provenance and
small-size readability, and keep editable masters out of the runtime payload. Existing accepted SVG
and core references remain compatible; the documentation sprint does not replace them. See
[ICON_STANDARD.md](ICON_STANDARD.md).

## 5. General Store is built category-first

**Decision:** complete curated categories in reviewable batches before expanding another merchant's
catalogue. General Store began with thirteen Containers, followed by the other seven approved categories.

**Why:** a curated taxonomy establishes a coherent baseline for descriptions, prices, weights,
icons and mechanics. Hundreds of unrelated entries would multiply unresolved design choices and
make quality review harder.

**Consequences:** the agreed General Store list contains 69 Items across eight categories. Category
plans do not create inventory, and future categories need deliberate scope and review. “Complete”
means the agreed curated list, not every object that any general store could sell.

**Amendment — 2026-09-25:** Sprint 3 deliberately expands the agreed scope to 144 goods in ten
categories, including Tools and Trade Goods. It preserves the original 69 identities and economics,
completes one merchant, and stops before Tavern. The category-first rationale remains unchanged.

## 6. One canonical item is shared between merchants

**Decision:** use multiple `shops` tags and optional stock-tier overrides on one Item rather than
creating merchant-specific duplicates.

**Why:** the same rope, bottle or lockbox should not acquire conflicting weights, text or identities
because it appears in two businesses. Shared records reduce maintenance and support consistent UUIDs.

**Consequences:** origin prefixes never change when shop membership changes. Each Item has one
base price and one purchase unit. Merchant quotes, stock quantities and future local conditions are
separate from the canonical product. A genuinely different product requires a reviewed new identity.

## 7. Permanent identity is independent of display and storage

**Decision:** reserve human-readable Item and table IDs in append-only ledgers and derive Foundry
document IDs through the frozen mapping.

**Why:** links must survive renaming, price changes and source-file reorganisation. Reusing a retired
identity could silently redirect a player's saved reference to an unrelated product.

**Consequences:** never recycle IDs, change the hash algorithm casually, or treat a display name as
identity. Validate collisions across active and reserved IDs. Retired category table IDs remain
reserved even after approved cleanup; an Item type change requires deliberate migration.

## 8. Price, weight and quantity describe one purchase

**Decision:** require explicit sale units for new content and sensible whole cp/sp/gp prices.

**Why:** ten pitons, a fifty-foot rope and a filled fuel flask need unambiguous purchasing and carried
mass. Copper and silver should remain useful in ordinary play rather than every transaction costing
several gold pieces.

**Consequences:** a quantity of four bundles means four bundles, not four pieces. No converter guesses
bundle composition or silently changes currency. Price bands guide supply but do not redefine game
mechanics or magical rarity. Existing thirteen Containers retain their documented legacy `saleUnit`
exception; all new records follow [CONTENT_STANDARD.md](CONTENT_STANDARD.md).

**Amendment — 2026-09-25:** all thirteen original Containers gain explicit sale units. The schema
now requires the field on every Item, ending the legacy exception. Only the generated sale-unit
metadata changes for those records; purchase contents, IDs, economics and mechanics are preserved.

## 9. Stock uses compact shared tables and separate quantity rolls

**Decision:** as of alpha.6, generate four tables per shop—20 total—and filter their pools for
category stock. Roll weighted quantities after choosing the assortment.

**Why:** alpha.5's 120 tables repeated the same stock logic across 25 category sets. Shared pools
retain shop/category choices with fewer documents and no need for another table per quantity profile.
Separating quantity from presence makes the supply model understandable and testable.

**Consequences:** existing whole-shop UUIDs and fields remain unchanged. Always goods are guaranteed;
rotating defaults stay 80% Often, 15% Rarely and 5% no extra stock. Empty/exhausted tiers add nothing.
Current Rare quantity defaults are one at 95% and two at 5%; cheaper/common goods use larger weighted
profiles. Native draws provide availability; the builder supplies category filtering and quantities.
Stock lists remain suggestions, not saved merchant inventory.

**Amendment — 2026-09-25:** four General Store merchant profiles require sixteen tables; together
with the other shops there are 32 active tables. All twenty existing whole-shop identities remain.
The three Village item pools update to include the larger catalogue. Category and quantity tables
remain unnecessary, and all 100 retired category IDs remain reserved.

## 10. Rebuild safety and retirement are explicit

**Decision:** normal builders do not delete Items or whole tables. The alpha.6 legacy-category cleanup
is a separate, narrowly scoped operation with preview and exact-ID confirmation.

**Why:** generated data can coexist with user content and saved references. Quietly deleting a pack
or replacing every document would damage those relationships. Old redundant category tables still
need a practical reviewed retirement path.

**Consequences:** protect edited/organised legacy data, foreign flags and incoming references from
this pack/world RollTables; review journals, macros and other packs separately. Require working
compact tables first. Restore locks, detect partial writes/deletes, and require a new cleanup preview
after interruption. Batch operations are not transactions. The shared client guard is not a
distributed lock; operate from one active-GM tab. General Item retirement remains future work.

## 11. Merchant Notes stay with the builder

**Decision:** retain Always/Often/Rarely guidance in shop definitions for the GM, without exporting
it into Items or RollTables.

**Why:** notes explain a merchant's intended character and may discuss stock not yet authored. They
are not mechanical identifiers or player-facing product text.

**Consequences:** actual stock uses validated Item IDs, tags and structured profiles. Seasonal,
Imported and Illegal context is currently descriptive; Common/Uncommon distinctions need future
structured support. Do not imply those planned conditions are already automated. See
[MERCHANT_STANDARD.md](MERCHANT_STANDARD.md).

## 12. Compatibility and release claims require evidence

**Decision:** target V14 / D&D5e 5.3.3 explicitly, retain the 2014 rules baseline, and use a versioned
Forge-compatible custom-package ZIP until a hosted installation release is deliberately established.

**Why:** native schemas and lifecycle APIs change. Automated model doubles and a passing build cannot
prove live Foundry/Forge compatibility, and a URL that does not host a real release is not an installer.

**Consequences:** run validation and tests, record live acceptance details, preserve the supported
version guards, and do not set manifest verification claims without evidence. Public publication also
requires the owner's distribution-licence decision and provenance review. ZIP creation and CI artifact
upload do not constitute a public release. See [RELEASE_PROCESS.md](RELEASE_PROCESS.md).

## 13. Documentation standards and implementation are distinct deliverables

**Decision:** these nine standards documents govern future development, while explicitly identifying
schema limits, current behaviour and planned milestones.

**Why:** complete standards should guide the project without pretending that every described
editorial rule, merchant condition or release procedure is already automated.

**Consequences:** the weighted-quantity/compact-table work was committed before this documentation
sprint. That documentation sprint changed Markdown only. The official milestone roadmap/changelog
live under `/docs`; the existing root records retain detailed implementation and alpha-build history.
Future changes must update the relevant standard, implementation, validation and evidence together.

## 14. Merchant variants inherit one catalogue and stock policy

**Accepted — 2026-09-25.** Village, Town, City and Wagon share one General Store catalogue. A small
optional variant definition supplies a permanent profile prefix, draw defaults, exclusions,
availability overrides and private Merchant Notes. Existing conversion and persistence stay intact.

**Why:** these are different merchant assortments, not different products. Inheritance avoids copied
catalogues and keeps future price/weight corrections consistent. Effective availability also selects
the existing quantity policy, so a locally common product can have larger suggested stock.

**Consequences:** base APIs remain compatible; table previews/builds can select all variants, while
a stock roll selects one. Four tables per profile hold Item references; no duplicate Item documents
or category/quantity tables are introduced. Merchant Notes never enter compendium metadata. The
Wagon excludes bulky stock explicitly rather than silently changing canonical shop tags.

## Sprint 4 proposal awaiting review

The [Merchant System specification](merchant/MERCHANT_SYSTEM_SPECIFICATION.md) proposes NPC Actors
with native Items and wallets, GM-only relationship records, an approval-led checkout and an
auditable transaction ledger. The [technical justification](merchant/TECHNICAL_JUSTIFICATION.md)
records challenged assumptions and blocking Foundry V14 proof points. These are **proposals**,
not accepted numbered decisions or implemented features. Add dated decisions here only after
the owner reviews the design before Sprint 5.
