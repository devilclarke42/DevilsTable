# Merchant Standard

**Audience:** merchant-content authors and framework maintainers. **Purpose:** define how businesses reuse the shared framework.

## Identity and storage

A merchant is a standard NPC; a catalogue is a business type; a stock profile chooses goods; an economic profile affects funds; a template is editable starting configuration. Keep these identities separate. Native Actor/Token fields own personal identity. Store only business metadata under module flags.

Use one product across plausible catalogue memberships. Retain `shops`, `black-market`, collection IDs and permanent origin prefixes as compatibility identifiers; display text may use clearer names such as Fence. Descriptive aliases must not create separate inventories or merchant-specific checkout code.

## Stock and profiles

Every built-in catalogue has a validated base stock profile, optionally with named variants. Include every product category; reference active product IDs. Overrides set local Always/Often/Rarely tiers. Exclusions affect variant assortment, not product identity. Always goods are guaranteed; empty/exhausted rotating tiers add nothing and never promote another tier.

Profile `tierChances`, `quantityLimit` and ordered tag `offerRules` are generic capabilities. Restrict valuables through offers rather than hiding campaign secrets in module JSON. Settlement/prosperity scaling affects Merchant Builder previews. Catalogue coverage describes authored content, not a guarantee every merchant carries the full list.

Merchant Notes and suggested greetings/DCs remain editable private context. They do not create quests, scheduled restocks or automatic relationship-state transitions.

## Services and relationships

Use separate service definitions and shared offerings; never manufacture service Items. State inclusions, duration, target selection, base fee and manual fulfilment honestly. Room mappings belong to an NPC offering, not reusable catalogue content. Hidden services still obey enablement/economy/customer requirements.

Keep customer memory per character. Visibility currently supports public, GM-revealed and completed-purchase access; full reputation/faction/disguise systems remain future scope. Profiles can influence pricing, stock, eligibility and notes through data, without new transaction engines.

## Review criteria

A new merchant should be explainable using existing catalogues, profiles, presets and services. Check believable stock, units, funds, prices, service suitability, restricted offers and repeat generation. Preserve existing inventory/cash/history when editing a business. Validate source and relevant live workflows before release.

## Related documents

[Project Philosophy](PROJECT_PHILOSOPHY.md), [Content Standard](CONTENT_STANDARD.md), [Stock Tables](STOCK_TABLES.md), [Merchant Services](MERCHANT_SERVICES.md), [Builder Guide](BUILDER_GUIDE.md).
