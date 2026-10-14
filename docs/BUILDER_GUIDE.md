# Builder Guide

**Audience:** GMs and content maintainers. **Purpose:** distinguish catalogue builds from live merchant configuration and explain safe editing.

## Content builders

Open the Catalogue Builder and RollTable Builder in module settings. Select **Merchant Type** and **Settlement** separately. All Merchant Types/All Settlements select available definitions; Advanced filters contains stock-profile refinements and Legacy Category.

Item builds read canonical source and reconcile the shared Master Item Catalogue. Settlement is informational for Item builds: goods are not duplicated or omitted by settlement. Stock-table builds use authored profile settlement assignments and generate four tables per selected profile. A settlement without an authored profile does not fall back silently.

Preview reports creates, updates, unchanged records and warnings. Confirm the intended build, then repeat to verify convergence. Builders preserve unmanaged and inactive reserved documents. Services are reference counts, not generated Item documents. World imports and Actor inventory are independent copies.

**Legacy Category** filters rolled stock suggestions and legacy cleanup; it does not create a new category table set. A category roll uses `categoryDraws`, which may be smaller than a whole assortment. Normal Merchant Builder generation uses the saved whole stock profile and settlement/prosperity scaling. See [Stock Tables](STOCK_TABLES.md).

## Create or reopen a merchant

Right-click an ordinary world NPC in the Actors sidebar: **Convert to Merchant** appears before conversion and **Open Merchant Builder** afterward. The NPC sheet and module settings use the same launcher. Characters, compendium actors and unlinked synthetic Actors are not conversion targets. New conversions start Closed until configured.

Conversion preserves inventory, cash, biography, portrait, ownership and token configuration. Keep NPC ownership GM-only and place a linked token. Existing business history/settings survive re-enabling. All GMs may inspect; active-GM authority is required for administration writes.

## Tabs

| Tab | Work |
| --- | --- |
| Setup | Preset, catalogue, settlement, prosperity, economic/stock profile, availability, pricing, buying multiplier, unlimited settings, checkout time and private notes |
| Identity | Read-only native identity; editable public business name/title/descriptions and private Merchant Tags |
| Stock | Generation estimates/previews, edited preview quantities and existing-offer visibility |
| Services | Categories, generated offerings, enabled/available state, price/visibility overrides and room configuration |
| Cash | Generated/replacement native wallet preview and explicit application |
| Manage | Current statistics, Empty Stock, advanced trade/recovery and confirmed merchant reset |

System Tags are transient read-only descriptors from native fields. Merchant Tags describe the business privately and grant no mechanics. Public descriptions and business titles are explicitly player-facing. Edit native identity through the Actor sheet rather than maintaining duplicate copies.

## Presets and drafts

A preset changes the editable draft; it does not immediately replace world data. Save / Convert before generation. Custom templates store portable configuration only, excluding inventory, cash balances, relationships and history, in a GM-only template compendium.

Unsaved settings and previews remain local. Reload/switch confirms discarding drafts. Stale snapshots or a pending checkout/recovery block conflicting writes. Do not use several active-GM tabs to edit the same merchant.

## Stock generation

Generate a preview, review goods/quantities/value and explicitly apply. Zero omits a proposed addition. Existing source identities, including sold-out entries, are skipped; generation does not refill or replace them. Empty Stock is a separate destructive action.

The saved stock profile defines Always/Often/Rarely pools, exclusions, rotating attempts, optional tier odds, tag visibility rules and quantity caps. Settlement/prosperity scale draws, quantities and rare chance. Merchant Builder estimates use these same rules. Fence profiles guarantee four practical products plus rotating selections, with one/two-copy limits; see [Fence Guide](FENCE_GUIDE.md).

Rebuild affected Stock RollTables after source/profile changes before rolling. Merely upgrading the module does not rewrite existing inventory or stock tables.

## Cash and statistics

Initial float draws within the settlement range, applies prosperity/economic-profile factors and distributes exact value into native coins. Existing wallet/stock/history or an initialization marker normally preserves established merchants. Infinite funding generates no fictitious coins. Explicit **Apply Float** replacement uses the reviewed total, not an amount added on top.

The stock preview can carry a cash plan; funds are only applied with qualifying additions. Cash can be reviewed/applied separately. Changes to wallets/settings invalidate stale previews. If stock succeeds but a later cash write fails, inspect both before retrying.

Statistics derive from native physical stock/cash and saved records. Lifetime trading totals depend on retained relationships; rejection counts refer to retained receipts. Hidden/manual physical stock is included. Invalid price/quantity entries are reported rather than invented.

## Service editing

Save Setup first. Eligible catalogue defaults seed once per identity, preserving manual removals/disabled settings/overrides. Generate Offers adds eligible category definitions while retaining saved overrides and confirms discarding unsaved service edits.

**Enabled** hides an offer when false; **Available now** retains a visible unavailable offering subject to normal eligibility. Visibility rules can further restrict enabled offers. Prices and optional room mappings belong to this NPC. See [Merchant Services](MERCHANT_SERVICES.md) for authoring and [Integrations](INTEGRATIONS.md) for rooms.

## Destructive operations

Empty Stock deletes physical embedded goods, including hidden/manual/nested entries, while retaining features, spells, money and merchant records. Merchant Reset removes business configuration, offer controls and retained transaction history while preserving ordinary NPC inventory/cash/identity. Resolve recovery first. Active room booking journals remain independent so rental access can still be recovered.

Legacy table cleanup is separately previewed and confirmed; protect external links and back up the world. Never use deletion or reset as a substitute for recovering an interrupted trade.

## Related documents

[Merchant Guide](MERCHANT_GUIDE.md), [Stock Tables](STOCK_TABLES.md), [Testing](TESTING.md), [Known Limitations](KNOWN_LIMITATIONS.md).
