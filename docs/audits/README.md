# Catalogue Audit Snapshots

**Audience:** maintainers, reviewers and content contributors. **Purpose:** retain source-specific evidence and approved planning baselines without turning temporary implementation plans into architecture documentation.

## Milestone 2A — 2026-10-16

The audit targets public alpha 0.3.29 at main commit `d94d7fb68e52a80d0d03e7b4b46d4d5c463484eb`. All results describe that snapshot; future implementation must reconcile it explicitly. Runtime JSON remains the source of truth.

- [Catalogue Audit](CATALOGUE_AUDIT.md): executive findings, totals by merchant/category, SRD scope, quality, pricing, weights, stock, licensing and recommendations.
- [Item Inventory](ITEM_INVENTORY.json): every current canonical Item and its exact source location/memberships.
- [SRD Coverage Matrix](CATALOGUE_COVERAGE.json): 241 source rows, current matches/candidates and source-unit comparisons.
- [Service Inventory](SERVICE_INVENTORY.json): every built-in service and its actual limits.
- [Service Coverage](SERVICE_COVERAGE.md): published commerce benchmarks and original service proposals.
- [Stock Audit](STOCK_AUDIT.json): all profile pools and 225 analytical Builder scenarios.
- [Content Expansion Plan](CONTENT_EXPANSION_PLAN.md): proposed batches and approval decisions before Milestone 2B.
- [Validation Record](VALIDATION_RECORD.md): checks performed, evidence and limitations.

The JSON documents are data snapshots, not runtime registries or new executable tooling. A status of complete is scoped by each file; it does not certify exact official prices, licences of original material or live Foundry behaviour.

## Related documents

[Documentation index](../README.md), [Source Data](../SOURCE_DATA.md), [Source Notices](../SOURCE_NOTICES.md).
