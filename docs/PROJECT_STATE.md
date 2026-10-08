# Project state

## Sprint 14 — Daily merchant workflow (alpha.23)

Right-click a world NPC in the Actors sidebar. **Convert to Merchant** enables merchant flags and opens Setup; **Open Merchant Builder** appears for enabled merchants and opens their existing configuration. The sheet header menu and Devil's Table tab use the same terminology. Player characters, compendium entries, unlinked synthetic Actors and player users are excluded.

Conversion preserves native inventory, currency, biography, portrait, ownership and token configuration. Existing merchant notes, relationships and history are retained when re-enabling. New merchants start Closed until configured; previously configured availability is retained. The existing active-GM administration guard protects conversion during a pending checkout or recovery. Opening an enabled merchant is read-only and available to GMs.

All Builder entry points share a launcher, including the Shop UI and public API. The NPC tab offers **View Statistics**, which opens the existing Manage tab directly. Existing merchant badges remain the visual indicator. Summary and statistics stay in the existing Builder rather than adding a blocking preview window. Stock generation and Empty Stock remain in the Builder with their existing previews and confirmation; the directory never modifies inventory or money.

Live check: right-click an ordinary NPC, convert it, verify its currency and inventory are unchanged, then reopen the menu and confirm only Open Merchant Builder is visible. Check the sheet menu, Statistics shortcut and GM-only visibility. Automated checks cover conversion preservation, dynamic menu conditions and callbacks; live Foundry rendering remains a GM verification.


## 0.3.0-alpha.22 — Merchant menu access

- Renamed the sheet menu action to **Devils Table: Make merchant**.
- Updated the Actors sidebar context entry to the Foundry V14 menu API, opening the Merchant Builder for the right-clicked NPC. GM-only access and existing NPC eligibility are preserved; repeated registration cannot duplicate the entry.
- Automated menu checks cover the V14 callback target and label. Live sidebar rendering remains a Foundry smoke check.

## Sprint 13A — Builder workflow (alpha.21)

Choose **Merchant Type** for the business catalogue and **Settlement** independently. Native dropdowns keep the forms compact as new merchant types are registered. **All Merchant Types** and **All Settlements** select all available definitions without a scrolling list of checkboxes.

The RollTable Builder filters existing stock profiles using `data/economy.json` settlement assignments; profiles without an explicit assignment use the economy default. A settlement with no authored profile shows an empty selection rather than silently building another settlement. **Advanced filters** contains the optional stock-profile refinement and **Legacy Category**, with an explanatory tooltip. Legacy Category limits stock suggestions and legacy cleanup, not modern shared table generation. Preview, build and cleanup use the same profile scope. Existing table IDs and links remain unchanged.

The Compendium Builder uses the same Merchant Type / Settlement layout. Settlement is informational there: canonical products are shared across settlements, so Item builds never duplicate or omit products based on settlement. Services are reference counts and are not Item documents. Build Preview updates with selections and shows type, settlement, categories, products, services and table count. Its build-time range is an explicitly rough planning estimate (0.1 seconds per product or 0.25 per table, with a broad upper margin), not a measured performance promise.

The individual Merchant Builder and NPC configuration use **Merchant Type** too. An NPC still needs one concrete settlement; All Settlements belongs to batch content tools only. Templates may retain descriptive names such as Village Smith, while Merchant Type and Settlement remain independently editable. The existing configuration grid and isolated filter helper can accommodate future filters without encoding them into names; no region, climate or culture mechanics are introduced.

## Current fix — 0.3.0-alpha.20

The final reported Net mismatch was save.ability stored as a scalar string instead of the native array. Source now uses ["str"]; other authored native save activities were checked. Existing compendiums can be rebuilt in place. Live confirmation remains pending.


## Current fix — 0.3.0-alpha.19

The remaining weapon/tool activity mismatches were blank duration and template units saved as inst and ft. Canonical JSON now explicitly matches these native defaults. Strict read-back verification remains unchanged; rebuild the existing compendium in place. Live confirmation remains pending.


## Current fix — 0.3.0-alpha.18

Blacksmith native data now omits unset optional fields, including armour magicalBonus. Explicit null values could be absent in Foundry read-back, triggering repeated updates. Smith's Tools uses self range units. No global null/missing equivalence was added. Rebuild existing compendiums in place; live confirmation remains pending.



## Sprint 13 candidate — 0.3.0-alpha.17

Blacksmith implementation adds 58 products and shares 15 existing goods, giving 73 smith products. Nine smith services and five presets reuse the existing pipeline. Project totals are 370 Items, 25 services and 68 tables. Required-item selection is generic and non-consuming. Native equipment conversion is implemented; live Foundry V14/D&D5e 5.3.3/Forge acceptance remains pending. See [Blacksmith Guide](BLACKSMITH_GUIDE.md).


Updated 2026-10-07 for `0.3.0-alpha.17`.

## Previous candidate — alpha.16 / UX & Workflow Polish

Implemented NPC sheet configuration, three-dot/Directory Builder entry, merchant badges, optional local Dice So Nice presentation and compact content builders with source summaries. Existing transaction authority, source IDs, inventory and catalogue data are retained. Merchant disabling preserves business history. No dedicated sidebar was added because existing Actor entry points cover this workflow.

See [UX Workflows](UX_WORKFLOWS.md) for the review and live acceptance checklist. Automated tests run at packaging; live Foundry V14 / D&D5e 5.3.3 sheet rendering and Dice So Nice visual/multiplayer acceptance remain pending. No live compatibility certification is claimed.

## Previous candidate — alpha.13 / Tavern Completion

The source implementation includes 205 Tavern products, 16 services, nine Tavern presets and six stock profiles. Project totals are 312 Items and 52 Stock tables. Six existing supplies gain Tavern membership only; sixteen products and four services fill the remaining gaps. Private stories use editable notes. Room mapping remains GM-configured; new room forms preselect supported available integrations without overriding existing choices.

Shop description disclosure, compact category navigation, narrow-window layout and accessible labels are implemented. All 376 automated tests pass. Coverage includes alpha.12 upgrade and repeated-build convergence, mixed purchases, service eligibility and optional integration lifecycle. Live Foundry/Forge, visual/mobile and external-module acceptance remains pending. The complete workflow is in [Tavern Guide](TAVERN_GUIDE.md).

## Previous candidate — alpha.12 / Accommodation checkout times


Room checkout defaults to 10:00; Builder Setup stores a merchant default and GM Review permits a purchase-only override with player reconfirmation. New booking endpoints use calendar nights and native clock components; previous bookings are preserved. Weekly lodging has seven-night metadata.

Pricing modifiers and breakdowns are collapsed by default in GM checkout; line percentage controls have their own disclosure. Basket quantities, prices, final total and approval/rejection remain visible. The payment and transfer engine is unchanged. Existing integration acceptance remains pending. Automated regression checks are run during packaging.

## Previous candidate — alpha.10 / Sprint 10C

Optional integration framework and accommodation adapters are implemented. Services remain usable without either module. Lock & Key grants unique rental access across configured doors; Calendaria creates private check-in/out notes. Bookings survive receipt retention and allow timed/manual key revocation. Native payments still occur once. The Shop icon aligns with its catalogue label and the title uses token/business names.

All 363 automated tests pass, including regression trading, missing modules, partial fulfilment, private projection and concurrent shared-door grants. Validation still covers 296 Items, 12 services and 32 Stock RollTables. The alpha.10 ZIP is a test candidate; no live Foundry/Forge integration certification was performed. See [acceptance checklist](INTEGRATIONS.md#validation-and-live-acceptance).

## Previous candidate — alpha.9 / Sprint 11A

Native identity is derived live and read-only; business metadata and private Merchant Tags are isolated in module flags. Builder Identity and Services tabs are implemented. Services include search, grouping, status filters, prices, temporary availability and usage. Native data, receipts and source content remain intact; no destructive migration is required.

All 353 automated tests pass; validation covers 296 Items, 12 services and 32 Stock RollTables. The alpha.9 ZIP includes the runtime source, templates and documentation. Live Foundry/Forge acceptance remains pending; see [Identity checklist](MERCHANT_IDENTITY.md#acceptance-in-foundry). Broader Sprint 11 business-profile editing and world generation are not implemented by this refinement.

## Previous candidate — alpha.8 / Sprint 10B

Twelve record-only Tavern services are available, with units, durations and suggested pricing.
Builder Save seeds eligible defaults once per identity and preserves manual removals/overrides.
Four Tavern presets vary settlement, prosperity and profile. The existing 152 Tavern food/drink
Items are active, giving 296 total Items and 32 stock tables. No source Item contents changed.
All 346 automated tests pass. See TAVERN_SERVICES.md for setup and live acceptance. Live Foundry validation remains pending.

## Previous candidate — alpha.7 / Sprint 10A

Services are a separate JSON registry with GM world authoring, catalogue/economy eligibility,
Shop tab/search, mixed baskets, shared pricing/approval/native currency, guarded administration
and verified usage counters. Optional native actions execute after payment with an auditable
non-replay policy. No service Items or new compendiums exist. Tavern data is unchanged.
All 341 automated tests pass; 144 production Items and 32 stock tables still validate.
Live multiplayer and optional integration acceptance remains pending; see MERCHANT_SERVICES.md.

## Previous candidate — alpha.6 (user confirmed working)


Builder tabs replace the long single view. Stock quantities and final cash remain editable;
manual cash rolls work for existing finite-funds merchants. Manage includes a confirmed merchant
reset that clears this NPC's history/configuration while preserving ordinary Actor data and cash.
Reset is guarded against active trades and unresolved recovery. All 329 automated tests pass.
Live Foundry/Forge acceptance remains required.

## Current hotfix

Alpha.5 fixes the Builder close button and groups identical empty containers in the Shop display,
while preserving separate native document identities. No source Item or transaction storage migration.
All 322 automated tests pass; live Foundry confirmation remains required.

## Sprint 9 candidate

The Merchant Builder is implemented as a single editable GM panel with data-driven configuration,
stock estimates, independent regeneration and native stock/cash application. Five built-in presets
and private custom templates are available. Existing NPC data and source catalogue identities are
preserved. See [Merchant Guide](MERCHANT_GUIDE.md) for workflow and live acceptance requirements.
Validation passes for 144 active Items, 32 Stock RollTables and 320 automated tests.
The panel's actions and transaction additions have automated coverage; no live Foundry/Forge
multiplayer session was available here. Restock profiles are preferences only, not a scheduler.

## Sprint 8A candidate

Devil's Table: Trade & Merchants now includes GM Shop Administration, Merchant Summary, confirmed
Empty Stock, economy policy inputs and a one-time native cash float. Stable IDs, live inventory,
private merchant records and all Tavern source content are preserved. Compendium display labels
have been reviewed; existing-pack labels are runtime aliases, not metadata migrations.
Automated validation passes: 144 active Items, 32 Stock RollTables and 306 tests.
See [Merchant administration](MERCHANT_ADMINISTRATION.md) for formulas, safeguards and live checks.
The prior catalogue activation state below is unchanged. No new gameplay was added.

## Catalogue baseline

Sprint 8 is Catalogue Framework & Merchant UX. Data-defined catalogues and categories drive the
Shop UI. Source JSON generates one shared Item compendium; merchant NPC embedded Items remain
live stock. Actor portraits, exact token names, immediate public-field search, populated category
tabs and a persistent basket are implemented. Provider registration feeds the existing validator
and shared builder. See [Catalogue framework](CATALOGUE_FRAMEWORK.md) for the complete contract.

The active build contains 144 General Store Items and 32 Stock RollTables. All 296 previously
reserved Item IDs remain reserved. The earlier `0.3.0-alpha.1` candidate authored 152 Tavern Items
before the sprint was revised. Those files and their former stock policy are retained as deferred
review material; they are not loaded into active builds. Existing world compendium and Actor
Items are not deleted. Tavern has only 31 shared General Store goods in current stock generation.

## Stable baseline and limits

The owner reported working purchases, rejection, recovery and Sprint 7 interactions. Transaction
settlement, native currencies, GM approval, revised-price consent and recovery remain the existing
implementation. Automated checks cover concurrency using two, three and five simulated clients.

This workspace has no live Foundry V14 / D&D5e 5.3.3 world. Sprint 8's runtime visuals and actual
multiplayer acceptance require owner testing. Automated results must not be described as live
verification. Existing limits include refresh-based stock snapshots, one active GM browser session,
and the previously documented distance-enforcement limitation.

## Review sequence

1. Install `0.3.0-alpha.2`, restart/reconnect the test world and select the merchant's catalogue in
   Merchant Administration. Existing merchant inventories remain intact.
2. Open the shop as a player without NPC ownership. Check portrait, token name, catalogue and status.
3. Search by a tag and category label; confirm focus remains in the input and basket items remain.
4. Empty a stocked category as GM, refresh the shop and verify its tab disappears. Check the basket
   remains accessible while scrolling inventory and confirm prices match GM review.
5. Repeat a purchase/rejection with multiple browsing players and record any native Foundry error.
6. Review the framework before resuming Tavern authoring. Services, a full Merchant Builder and
   restocking need separately approved scopes.

Enabled merchants display a GM-only **Merchant** Directory badge and a small **SHOP** marker on linked canvas tokens. Disabling the merchant removes these indicators. No token image or status effect is changed. The native sheet three-dot menu replaces the exposed header button. Live Foundry rendering remains to be confirmed.
