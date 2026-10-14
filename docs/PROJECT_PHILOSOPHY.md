# Project Philosophy

**Audience:** maintainers, developers and content designers. **Purpose:** provide the enduring reference for architectural and product decisions.

## Goals

Make everyday commerce useful in play: believable goods, copper/silver purchases, meaningful carrying weight, persistent merchants and clear GM authority. Support a growing set of merchant businesses through shared infrastructure and authored data.

## Design principles

- **Foundry first:** native NPC Actors, embedded Items, Tokens, Journals, ownership and D&D5e currency own world state. Do not duplicate inventory, wallets, identity or calendars in a parallel store.
- **One product, one identity:** a product shared by several merchants keeps one canonical record and UUID. Names, prices and file locations may change; permanent IDs and reserved identities are never recycled.
- **Data-driven business differences:** catalogues, stock profiles, services and presets describe businesses. No merchant-name switch should be needed for a new merchant type.
- **One sale unit:** price, weight, stock and consumption all describe the same explicit purchased unit. Adjusted weights are authored decisions, not guessed conversion multipliers.
- **GM authority and privacy:** players request identities and quantities; the active GM resolves offers, ownership, prices, eligibility and funds. Project only approved public fields.
- **Explicit, reviewable writes:** builders preview before applying; normal rebuilds preserve unmanaged/retired documents. Destructive cleanup/reset is separate and confirmed.
- **Recovery over false atomicity:** Foundry writes span multiple documents. Coordinate one active GM, persist receipts/checkpoints, verify writes and compensate failed native transfers. Do not claim isolation from external edits.
- **Honest mechanics:** retain the 2014 baseline and identify project economic/weight changes. Manual adjudication must be stated where automation does not exist.

## Architectural boundaries

Canonical JSON is the publishing source; generated compendiums are outputs; Actor copies are live play data. Merchant configuration references native state. Catalogue categories organise presentation; stock profiles select assortment; services sell work/arrangements without fake Items.

Calculation, validation, application UI and world writes have separate responsibilities. Keep schema validation bounded and local; unknown fields fail rather than being ignored. Preserve compatibility identifiers such as `shops`, `black-market` and existing collection names even when display terminology improves.

## Integration philosophy

Optional-module APIs and foreign flags belong only in adapters. Capability detection and opt-out should leave basic merchant trading usable. Native payment settles once before optional fulfilment; durable attempt markers prevent automatic replay of ambiguous actions. Local visual presentation has a separate allowlist from GM world writes. Room calendars present bookings; they do not silently become a reservation simulator.

## Future framework changes

Prefer content/configuration and existing extension points first. A proposed framework change must identify the missing capability, show use across merchant types, define validation/security/recovery boundaries, preserve saved identities and include meaningful regression coverage. Changes to public contracts require documentation and version/migration review. New reputation, crafting or capacity systems need separately agreed scope.

## Evidence and presentation

Describe shipped behaviour separately from proposals. Record automated and live checks separately. Keep source notices and useful provenance; preserve transient development history in Git rather than duplicating it across user guides. Public beta requires an explicit license and live acceptance record.

## Related documents

[Architecture](ARCHITECTURE.md), [Public API](API_REFERENCE.md), [Content Standard](CONTENT_STANDARD.md), [Merchant Standard](MERCHANT_STANDARD.md), [Release Process](RELEASE_PROCESS.md).
