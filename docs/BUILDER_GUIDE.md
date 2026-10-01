# Merchant Builder guide

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
