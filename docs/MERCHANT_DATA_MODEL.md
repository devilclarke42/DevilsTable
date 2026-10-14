# Merchant Data Model

**Audience:** developers and recovery maintainers. **Purpose:** describe current saved state without presenting proposed fields as implemented APIs.

## Native ownership

Merchant identity/inventory/currency remain on standard world NPC Actors and embedded Items. Linked tokens provide entry/position; they do not duplicate wallets or customer history. Customer Actors own funds and possessions. Full receipts use the GM-only world transaction compendium; booking leases use private world Journals.

## Merchant flag

Current configuration is under `flags.devils-table.merchant`. Treat this as internal persistence, not a stable write API. Preserve unrelated fields and use validated Builder/administration functions.

| Path within merchant | Meaning |
| --- | --- |
| `schemaVersion`, `merchantId`, `enabled`, `availability` | Merchant identity, opt-in and saved state |
| `catalogueId` | Selected catalogue; `black-market` displays as Fence |
| `economy` | Settlement, prosperity and economic profile IDs |
| `settings` | Wallet mode, unlimited stock, buying/pricing/stacking/change and checkout settings |
| `builder` | Stock profile and per-catalogue service-default seed markers |
| `identity` | Business name/title, public descriptions and private Merchant Tags |
| `notes`, `relationshipDefaults`, `relationships` | GM context and per-character memory |
| `services`, `serviceStats` | Definition references with NPC overrides; lifetime service counters |
| `initialFloat`, `administration` | One-time cash initialization and module stock/empty timestamps |
| `restock` | Saved preferences, not a running schedule |

Native identity is read through adapters and never copied into another merchant-owned biography/name/race store. Historic compatibility fields may remain present; do not infer that every saved field drives current behaviour.

## Offers and relationships

Embedded Item `flags.devils-table.offer` can hold approved publicDescription, copper unitPrice, generated lineage and visibility. Ordinary native quantity/price remain the stock source. A visibility policy has mode public/hidden/relationship, optional revealed boolean and positive minPurchases threshold (default three). Saved controls are stripped when goods transfer to customers.

Relationships are keyed by character Actor ID. Verified decisions update visits, successful purchases/transactions, spent/received values, discount totals, negotiations and theft outcomes. State/notes remain descriptive GM context. Browse never writes a visit; a descriptive Trusted label does not itself unlock a purchase-count rule. Companion/apparent-identity/faction systems are not implemented extension contracts.

## Receipts and recovery

Transaction Journals contain immutable decision context and staged native before/after data for audit/recovery, plus optional action job states. Actor `flags.devils-table.transactionPending` links unresolved operations to their receipt. Reject duplicate/replayed requests; do not edit receipt internals or clear pending flags to force a trade.

The retention setting selects last 100/500/1000 or unlimited, with default 500. Unresolved recovery and uncertain service jobs remain protected. Lifetime customer/service counters are not reconstructed from the truncated receipt list. Private leases survive receipt retention and merchant reset.

## Related documents

[Architecture](ARCHITECTURE.md), [Merchant Services](MERCHANT_SERVICES.md), [Integrations](INTEGRATIONS.md), [Testing](TESTING.md).
