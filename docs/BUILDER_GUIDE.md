# Merchant Builder guide

## Sprint 13A — Builder workflow (alpha.21)

Choose **Merchant Type** for the business catalogue and **Settlement** independently. Native dropdowns keep the forms compact as new merchant types are registered. **All Merchant Types** and **All Settlements** select all available definitions without a scrolling list of checkboxes.

The RollTable Builder filters existing stock profiles using `data/economy.json` settlement assignments; profiles without an explicit assignment use the economy default. A settlement with no authored profile shows an empty selection rather than silently building another settlement. **Advanced filters** contains the optional stock-profile refinement and **Legacy Category**, with an explanatory tooltip. Legacy Category limits stock suggestions and legacy cleanup, not modern shared table generation. Preview, build and cleanup use the same profile scope. Existing table IDs and links remain unchanged.

The Compendium Builder uses the same Merchant Type / Settlement layout. Settlement is informational there: canonical products are shared across settlements, so Item builds never duplicate or omit products based on settlement. Services are reference counts and are not Item documents. Build Preview updates with selections and shows type, settlement, categories, products, services and table count. Its build-time range is an explicitly rough planning estimate (0.1 seconds per product or 0.25 per table, with a broad upper margin), not a measured performance promise.

The individual Merchant Builder and NPC configuration use **Merchant Type** too. An NPC still needs one concrete settlement; All Settlements belongs to batch content tools only. Templates may retain descriptive names such as Village Smith, while Merchant Type and Settlement remain independently editable. The existing configuration grid and isolated filter helper can accommodate future filters without encoding them into names; no region, climate or culture mechanics are introduced.


## Blacksmith presets

Apply Village Smith, Town Blacksmith, Master Armorer, Military Quartermaster or Travelling Smith. Save the configuration to seed eligible services, then preview and apply stock and float. Services retain existing overrides. These presets reuse catalogue, stock and economy data; no smith-specific Builder controls are required. See [Blacksmith Guide](BLACKSMITH_GUIDE.md).


Open **Merchant Builder** from module settings or the GM Shop UI. Select a standard NPC in Setup. Only the active GM may apply administration changes. The panel uses six direct-access tabs; Back/Next is optional and navigation never commits edits.

| Tab | Use |
| --- | --- |
| Setup | Select NPC, apply/save templates, choose catalogue, economy and trade configuration; Save / Convert |
| Identity | Inspect live native identity; edit business name, title, Merchant Tags and public descriptions |
| Stock | Preview generated stock, edit proposed quantities and confirm application |
| Services | Generate offerings, search/filter by category/status, set enabled/available states and prices, inspect usage |
| Cash | Preview or reroll the float, manually override it and explicitly replace the native wallet |
| Manage | Review statistics, Empty Stock, advanced settings/recovery or confirmed merchant reset |

## Editing identity

Save / Convert in Setup before saving merchant metadata. Actor information is read-only: change native information on the Actor, not in a second merchant form. Native updates refresh the Identity tab without discarding typed merchant text. Business fields are separate: a token named “Old Nan” can trade as “The Copper Kettle”. The Shop's primary name remains “Old Nan”.

Merchant Tags are comma separated, GM-only business descriptors. Save normalizes and deduplicates them. System Tags are automatically derived and cannot be edited here. Public and shop descriptions are explicitly player-visible; they never copy the Actor's biography. See [Merchant Identity](MERCHANT_IDENTITY.md) for field ownership and privacy.

## Editing services

Save the catalogue and economic profile in Setup first. In **Services**, choose categories and Preview / Generate Offers. Confirmation adds eligible references while preserving saved overrides; it discards unsaved service edits. Generating services never creates inventory Items.

Search covers names, descriptions, tags and categories. Category and status filters combine with search. Hidden rows retain edits and remain part of Save Service Offerings. Each category groups its services, including units, durations, recommended price ranges and usage statistics.

- **Offer this service** adds/removes the definition reference. Removing it does not erase historical usage.
- **Enabled** controls whether customers see the offering.
- **Available now** temporarily prevents purchase without hiding an enabled offering. It cannot override catalogue/profile or character requirements.
- **Unit price and denomination** override the definition's base price. Existing merchant/character/negotiation modifiers still apply.
- **Purchased, revenue, last purchase and popularity** are accumulated transaction statistics, not editable stock counts.

Save Service Offerings applies the entire form, including filtered-out rows. Refresh the player Shop to load current offerings. Server-side checkout always rechecks availability. Shared world-definition JSON remains in a collapsed advanced section and affects all merchants; validate it before saving.

## Drafts and conflicts

Identity and Services drafts survive tab changes and ordinary panel renders. Switching NPC or Reload prompts before discarding edits. Closing the panel discards drafts without changing the world. A concurrent change may make the panel stale; Reload rather than overwriting another window's work. Active checkouts and unresolved recovery prevent administration writes.

Stock and cash previews remain separate from application. Identity/service saves invalidate old generation previews; generate again before applying. Reset removes merchant metadata, including new identity/service fields, but preserves native Actor biography, portrait, ownership, inventory and coins.

For generation formulas, templates and cash behaviour, see the [Merchant Guide](MERCHANT_GUIDE.md). For service authoring, see [Merchant Services](MERCHANT_SERVICES.md).

## Optional room integrations (alpha.10)

Builder → Services → Service actions and accommodation now configures room names, Wall UUIDs, key names, expiry and duration. Enable Lock & Key keys and/or Calendaria bookings when available, then Save Service Offerings. Unavailable enhancements are skipped; payment and history remain normal. Settings → Manage Integrations / Room Bookings provides independent toggles and explicit checkout/key recovery. Calendar notes do not reserve room capacity. See [Integrations](INTEGRATIONS.md) for the complete workflow and live checks.

## Accommodation checkout time

In **Merchant Builder → Setup**, set **Accommodation checkout time** using HH:mm (default **10:00**, or 10 am), then save configuration. This is specific to the merchant and is included in saved templates. Older templates and merchants default to 10:00.

For a rental purchase, GM Review shows the booked nights and an editable checkout time. An override applies to every accommodation line in that purchase, without changing the merchant default. Recalculate asks the player to accept changed terms before approval. One night ends on the next calendar date at that time; weekly lodging covers seven nights. Existing bookings are not rescheduled.

With configured integrations, the same endpoint drives calendar notes and Expire on Checkout keys. An active GM processes expiry when world time advances; no player morning-checkout button is required. Persistent and Manual Recovery key policies remain unchanged. Without integrations, the room terms are still displayed and recorded, with no automated room or key management.

## Tavern presets and stories

Apply a Tavern preset in Setup and save, then review Stock, Services and Cash. Nine Tavern presets cover Village Inn, Roadside Tavern, Dockside Tavern, Luxury Inn, Coaching Inn, Roadhouse, Noble Inn, Poor Hamlet Tavern and Town Inn. Optional stories, greetings and specialities are editable GM notes; they do not create campaign facts. Preset changes preserve existing inventory and manual service offers. See [Tavern Guide](TAVERN_GUIDE.md) for stock/service differences and room setup.

## NPC-first workflow (alpha.15)

Start from a world NPC sheet's **Devil's Table** tab. Enable the merchant, edit catalogue, economic profile, settlement, prosperity, availability, pricing and restock preference, then **Save Merchant Settings**. Native Actor information stays on the Actor sheet. Disabling the merchant preserves stock, wallet and private history.

Choose **Devils Table: Make merchant** from the sheet’s three-dot menu or Actor Directory context menu to open the Merchant Builder with that NPC selected. The tab's **Services & Room Integrations** button opens Services directly. Enabled merchants have a small GM-only Directory badge. These controls require a world NPC; unlinked synthetic token Actors and compendium Actors must first be represented by a world NPC and linked token.

For content builds, choose a scope in the compact selectors, read Generation Summary, Preview, then confirm Build. Merchant/profile guidance and maintenance stay collapsed until needed. Services in a summary are catalogue references, never Item-compendium entries. RollTable category selection filters sample rolls/cleanup; builds still generate four tables per selected profile.

Dice So Nice is optional and automatically presents native player negotiation/theft rolls locally. Players receive the numeric result without the hidden DC. Failures in dice presentation never stop the transaction workflow. See [UX workflows](UX_WORKFLOWS.md) for complete usage and the live acceptance checklist.

Enabled merchants display a GM-only **Merchant** Directory badge and a small **SHOP** marker on linked canvas tokens. Disabling the merchant removes these indicators. No token image or status effect is changed. The native sheet three-dot menu replaces the exposed header button. Live Foundry rendering remains to be confirmed.
