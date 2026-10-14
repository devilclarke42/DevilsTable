# Stock Tables

**Audience:** GMs, content authors and developers. **Purpose:** explain assortment, quantities and rebuild/cleanup boundaries.

## Profiles and identities

Stock profiles live in `data/stock.json`. Each catalogue has a base profile; variants inherit its catalogue/policy and can change exclusions, overrides, attempts, tier odds, quantity caps and visibility rules. Four tables per profile are generated: Always, Often, Rarely and Rotating. Current source has 25 profiles / 100 active tables.

Table IDs and result IDs derive from permanent source identities. Categories filter shared pools; there are no new category/quantity table sets. Old reservations remain in `data/table-id-ledger.json` even after reviewed cleanup. Display names never redefine a table UUID.

## Assortment selection

Product availability maps core→Always, variable→Often and special-order→Rarely, overridden per profile. Always selects every eligible core good once. Each rotating d100 attempt selects Often, Rarely or no additional stock; successful tier selection uniformly chooses one remaining eligible product. Empty/exhausted tiers consume attempts without promotion. Builder sampling avoids duplicates.

Default odds are 80% Often / 15% Rarely / 5% no extra stock. Optional profile `tierChances` replaces those defaults and must total at most 100. `draws` is the whole-assortment attempt count; category-filtered rolls use `categoryDraws`. Ordered `offerRules` match the first applicable tag and assign generic visibility to newly generated embedded offers. `quantityLimit` caps copies after scaling.

Fence profiles deliberately guarantee four practical products before rotating stock. Merchant Builder's Cautious Village/Poor preset makes six scaled attempts at 50% Often / 15% Rarely / 35% none, averaging about eight products including its core range. A one/two-copy cap does not mean only one/two products.

## Merchant Builder scaling

Choose a saved stock profile or resolve one from catalogue/settlement/economic profile. Settlement and prosperity percentages multiply base attempts, quantity scale and rare chance, with validated limits. The economic business profile affects cash separately. The estimate and actual roll use the same options; existing Actor source identities are excluded from expected additions.

Rebuild current tables before rolling. Generation previews are read-only; application preserves existing identities and does not refill zero-stock entries. This is not an automatic restock scheduler.

## Quantities

After selection, one weighted d100 quantity roll uses the effective tier and canonical price band. `data/stock-quantities.json` defines the exact outcomes. Typical rule families are:

| Tier | Everyday cp | Common sp | Equipment 1–24 gp | Specialist 25+ gp |
| --- | --- | --- | --- | --- |
| Always | Abundant | Common | Limited | Scarce |
| Often | Common | Limited | Scarce | Scarce |
| Rarely | Rare | Rare | Rare | Rare |

Rare stock defaults to one unit at 95% and two at 5%. Rules require unique positive integral outcomes and 100 total weight; all tier/price pairs must resolve. Rare profiles cannot exceed two. More expensive/scarcer bands must not increase expected quantity. Profile caps and settlement scaling apply afterward within supported limits.

Units are whole sale units: four Pitons bundles means forty pitons. Quantity does not change the canonical per-unit price/weight. Native containers remain individual embedded documents when stocked/traded.

## Native table draws

Native Always tables intentionally use overlapping 1–1 ranges; **do not Normalize** them. Native Rotating uses authored tier odds and nested Item/pool UUIDs. Native draws can repeat goods and do not apply Builder quantity/visibility policies. Use Roll Stock or Merchant Builder for duplicate-free, quantity-aware suggestions. Imported world-table copies do not update during a later compendium rebuild.

## Safe cleanup

Normal builds preserve unmanaged and inactive documents. Legacy category cleanup is a separate preview/confirmed exact-ID deletion. It requires current compact tables and protects edited results/names, assigned folders, foreign flags and known table dependencies. Journal, Macro and other-compendium links are not fully scanned; inspect them and back up before deletion. An interrupted cleanup requires a fresh preview and reports partial removal rather than blindly restoring/redeleting.

## Related documents

[Builder Guide](BUILDER_GUIDE.md), [Merchant Standard](MERCHANT_STANDARD.md), [Public API](API_REFERENCE.md), [Release Process](RELEASE_PROCESS.md).
