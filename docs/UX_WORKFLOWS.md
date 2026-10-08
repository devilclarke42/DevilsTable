# GM workflows and interface review

Sprint 12A, candidate `0.3.0-alpha.15`. Target: Foundry V14 and D&D5e 5.3.3.

## NPC-first management

Open a world NPC's standard D&D5e sheet and select the store icon labelled **Devil's Table**. Set **Merchant enabled**, catalogue, economic profile, settlement, prosperity, availability, pricing, room checkout time and restock preference. Click **Save Merchant Settings**. Changes stay local until saved. Disabling keeps native inventory, currency, relationships, notes and history and removes access from existing linked tokens.

The sheet’s three-dot menu and Actor Directory context menu offer **Devils Table: Make merchant**, opening the existing Builder for that Actor. Enabled merchants have a small store badge in the GM's Actor Directory. Conversion remains subject to active-GM authority and transaction locks.

The tab links directly to the Builder's Services tab for offerings, room mappings and optional integrations. World tools are collapsed under **World tools and integrations**. Use the Builder for reusable presets, generation previews, stock, cash, identity, notes, advanced trading and recovery. Actor biography, portrait, ownership, items and wallet remain native.

The tab supports the standard 5.3.3 NPC sheet's primary navigation and tab body. Compatible alternate sheets with that structure can receive it; other V2 NPC sheets retain the header and Directory fallback. Compendium Actors and unlinked synthetic token Actors are excluded: import the NPC into the world and use linked tokens. Player sheets receive no administration controls. Live verification of sheet integration remains required; alternate sheet compatibility is not certified.

## Content builder workflow

Both content builders follow **scope → summary → preview → confirmed build → report**. Native catalogue/category selectors replace button grids. Choose **All catalogues** to include every source catalogue. Choose **All profiles** within a catalogue for its settlement/stock variants. Existing single-scope/all-scope semantics are retained; this sprint does not add arbitrary disjoint multi-selection.

The Item builder keeps Merchant Notes collapsed. The Stock RollTable builder collapses all profile guidance under one disclosure and puts destructive legacy cleanup under Maintenance. Reports scroll within a bounded area and announce updates with a live status region. Windows are resizable and their selection fields wrap as available width changes.

Generation Summary shows selected catalogue count, categories containing products, unique products, catalogue service references and, for the table builder, the number of tables to inspect. Services are not generated into Item compendiums. RollTable summaries cover the full selected profile scope: category selection filters stock samples and legacy cleanup, not the four-table generation scheme. Source counts are informational; Preview determines actual creates, updates and preserved documents. Time depends on host and world size, so no unmeasured seconds estimate is shown.

## Player roll presentation

Negotiation and theft continue to use native `Actor.rollSkill`, including the native roll configuration dialog. When Dice So Nice is active and its API is available, the Integration Manager displays the already evaluated roll on the rolling player's client. It does not reroll, broadcast, create a second chat message or send merchant state to the adapter. The player receives their numeric total. The GM receives the existing result for private DC comparison and approval.

Missing, disabled or failing animations silently fall back to the ordinary native result. Presentation does not delay the GM response. Duplicate authenticated roll queries share the existing cached roll, so they do not replay dice animations. The separate client presentation allowlist cannot invoke GM service actions. The integration can be disabled independently in Integration Settings.

## Interface decisions

| Interface | Review outcome |
| --- | --- |
| NPC sheet | Primary location for routine merchant settings; explicit Save avoids native Actor autosave handling module drafts. |
| Actor Directory | Context action and one small GM-only badge. No duplicate merchant list. |
| Shop Inventory and Services | Existing search, category filters, disclosure descriptions and persistent basket retained. |
| Merchant Builder | Existing Setup / Identity / Stock / Services / Cash / Manage tabs retained; direct Services entry added. |
| Services editor | Existing search, category grouping, offer toggles and collapsed action configuration retained. |
| GM checkout | Existing collapsed pricing and currency disclosures retained. |
| Item builder | Compact scope selectors and summary; guidance collapsed. |
| Stock table builder | Compact scope selectors, summary, grouped guidance and separate maintenance disclosure. |
| Legacy administration | Remains available for advanced trade terms and recovery; ordinary creation now begins at the NPC. |
| Integrations | Existing status/settings panel includes optional Dice So Nice presentation. |

A permanent Devil's Table sidebar would duplicate the Actor Directory and the Builder's NPC selection. The NPC tab, header action and Directory menu place the common tasks at their existing Foundry entry points with no new persistent workspace.

## Live acceptance

Automated tests cover authority, preservation, stale settings, merchant locks, counts, optional presentation failures and duplicate roll queries. They do not replace a live Foundry session. Check the following on The Forge with the target system:

1. Open an NPC, use the Devil's Table tab, save, switch native tabs and rerender the sheet. Check no duplicate buttons/panels appear and that native edits still work.
2. Convert from the three-dot menu and Directory menu. Check the store badge appears; disable, re-enable and verify linked-token browsing follows it.
3. As a player, verify the administration tab/menu is absent. Browse the same merchant normally.
4. Negotiate and attempt theft with Dice So Nice active, inactive and locally hidden. Check one native roll and at most one local animation; no DC or merchant outcome is published.
5. Preview all catalogues and all stock profiles. Check the summary, collapsible guidance, progress, keyboard navigation and narrow-window scrolling.
6. Build from the confirmed preview and verify the established catalogue/stock output remains unchanged. No new gameplay or content is introduced by this sprint.

## Reviewed extension points

- [D&D5e 5.3.3 NPC sheet](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/applications/actor/npc-sheet.mjs) and its primary tab markup.
- [Foundry V14 document context hook](https://foundryvtt.com/api/v14/functions/hookEvents.getDocumentContextOptions.html): `getActorContextOptions`.
- [ApplicationV2 tab navigation](https://foundryvtt.com/api/v14/classes/foundry.applications.api.ApplicationV2.html): native `data-action="tab"` and `changeTab` contract.
- [Dice So Nice roll API](https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Roll): `showForRoll`. Runtime availability is capability-checked; no untested version guarantee is made.

Enabled merchants display a GM-only **Merchant** Directory badge and a small **SHOP** marker on linked canvas tokens. Disabling the merchant removes these indicators. No token image or status effect is changed. The native sheet three-dot menu replaces the exposed header button. Live Foundry rendering remains to be confirmed.
