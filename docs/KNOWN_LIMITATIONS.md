# Known Limitations

**Audience:** GMs, contributors and release maintainers. **Purpose:** distinguish implemented scope from acceptance gaps and future proposals.

## Release status

Milestone 1's shared merchant framework is feature complete for the five current merchant types. The runtime remains an alpha candidate targeting Foundry 14 / D&D5e 5.3.3 with 2014 rules. No compatibility beyond these targets, stable API guarantee, hosted manifest or public-beta release is established.

At milestone closure, 411 automated tests passed. The owner confirmed the corrected Fence assortment works in their live Merchant Builder. That confirmation covers stock generation only; it does not certify every merchant, multiplayer flow, native activity, browser layout or optional integration. Complete the [live acceptance matrix](TESTING.md) before widening claims.

Original project material has no selected distribution license. Review notices and choose a license explicitly before public beta; repository visibility alone is not an open-source grant.

## Functional boundaries

- Restock preferences are stored settings, not an automatic scheduler. Generation preserves existing source identities, including sold-out entries; it does not refill or replace stock silently.
- Built-in work/arrangement services normally record payment for GM completion. Crafting, brewing, actual theft commissions, delivery, appraisal outcomes and provenance laundering are not automatic.
- Relationship states are descriptive; there is no automatic faction/reputation/disguise simulation. Offer restrictions currently use per-character successful-purchase thresholds and GM reveal controls.
- Room bookings do not enforce capacity, occupancy or reservation conflicts. Quantity does not create extra keys/rooms or multiply nights. Native world time requires an active GM for expiry processing.
- Lights expose reference metadata but do not alter token lighting or run timers. Partial supply consumption, liquid volume and packaging transfers require manual bookkeeping.
- Equipped/attuned/nested trade goods require preparation before transfer. Native containers remain separate embedded documents.
- Stock changes require Shop refresh; browsing does not reserve merchandise. Multiple active GM browser tabs and unrelated sheet/module writes are outside module coordination.
- Optional actions are not automatically replayed after uncertain failures; inspect private receipts/bookings and complete recovery deliberately.
- Legacy cleanup protects known table references, but does not scan every Journal, Macro or other compendium reference. Check those before confirming deletion.
- Provider Items/services/integrations have exposed APIs; stock-profile and Builder-UI registration do not have public plugin APIs. See [Public API](API_REFERENCE.md).

## Source warnings

The inactive reserved Item IDs `DT_ITEM_BSM_IRON_BAR` and `DT_ITEM_BSM_COPPER_BAR` remain in the ledger. Blacksmiths reuse `DT_ITEM_GS_BAR_IRON` and `DT_ITEM_GS_BAR_COPPER`; no product is missing. Normal builds preserve older generated documents under inactive reservations. Retired table IDs are also intentionally retained.

## Related documents

[Roadmap](../ROADMAP.md), [Project Philosophy](PROJECT_PHILOSOPHY.md), [Integrations](INTEGRATIONS.md), [Release Process](RELEASE_PROCESS.md).
