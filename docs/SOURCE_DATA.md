# Source Data

**Audience:** content developers and maintainers. **Purpose:** describe canonical JSON and conversion constraints; [Content Standard](CONTENT_STANDARD.md) owns editorial policy.

## Source ownership

`data/catalogue.json` indexes active product files; `data/catalogues.json` defines merchant types. Product arrays live under `data/items/` by authoring origin. All current merchant catalogues are active. `schemas/` and semantic validators define the accepted shape; unknown properties fail closed.

Generated Items use a deterministic 16-character document ID derived from the permanent source ID, plus source/version/category/membership metadata. Builders own their generated fields; world and Actor copies remain independent. `tests/fixtures/` contains synthetic and historical regression inputs, not publishable catalogue content.

## Product fields

| Field | Contract |
| --- | --- |
| `id` | Reserved unique `DT_ITEM_` identity; never renamed/reused |
| `name`, `description`, `saleUnit` | Nonblank original text; name maximum 200, description 20,000, unit 200 characters |
| `price` | Positive integer cp/sp/gp amount; cp/sp limited to 1–9 |
| `weight` | Nonnegative finite value, `units: lb`, nonblank rationale |
| `icon` | Permitted local core/module path with safe image extension |
| `category`, `tags`, `shops` | Registered category, unique descriptive slugs, unique catalogue memberships |
| `availability` | `core`, `variable` or `special-order`; local overrides may choose another tier |
| `source` | Nonblank title, reference and license/provenance |
| `mechanics` | Explicit supported mapping below |

Use the schema files for exact required/optional keys. A structural allowance does not excuse inaccurate editorial claims.

## Native mappings

| Mapping | Authored behaviour |
| --- | --- |
| Loot | Supported native gear/art/gem/material/resource/trade/treasure/junk subtype; no invented active mechanics |
| Container | Positive empty weight and positive weight/volume capacities; no weightless contents |
| Consumable | Food/trinket/potion with explicit use, or ammunition with native fields |
| Weapon | Native type, damage and attack activity |
| Equipment | Native armour/shield type and AC fields; native trinket/focus equipment without armour AC |
| Tool | Native category/base-item identity and supported check activity |

`mechanics.native` holds reviewed system fields for weapons, equipment, tools and ammunition. Other top-level system overrides are not supported. Optional native defaults must serialize consistently on D&D5e 5.3.3; do not weaken read-back checks to hide mismatches.

Consumable `use` declares name, condition, mode (`consume` or `reusable`) and supported activation. Potions consume one dose using an action. `healing` defines supported healing dice/bonus (up to 20 dice and +100); other utility effects remain manual unless actually implemented. Foods consume one complete serving without unlisted healing/rest effects.

Consumed supplies use native owning-Item use targets and auto-destruction. Optional `mechanics.use.maxUses` authors 1–1000 native charges for consuming non-ammunition trinkets; omitted means one. Food, potion and light uses remain one complete-unit charge. A charge is not an additional purchased Item. Reusable activities have no consumption targets. Partial supplies, empty packaging and transferred fuel need manual bookkeeping. Light metadata records bright reach, total dim reach, shape, fuel and duration; it does not change token light or start timers.

## Containers and measures

Container weight describes the empty shell/fittings. Contents contribute their own normal weight once. Source capacities use pounds and cubicFoot/pint/quart/gallon; liquid measures are US measures. Conversion uses 231 cubic inches per gallon and 1,728 per cubic foot. Volume/fit/liquid handling remain GM decisions.

## Registries and retirement

Each category is identified within its catalogue. Legacy `shop` aliases catalogue on category definitions, and product `shops` is the compatibility membership list. Catalogue metadata is public descriptive data and can seed default service categories; it is not private campaign state.

ID ledgers include inactive reservations to protect identity history. The two unused Blacksmith bar IDs remain reserved while the active shared bars use General Store IDs. Normal rebuilding preserves inactive/unmanaged documents and rejects managed type/ID conflicts. Services, economic policy, stock profiles and merchant templates are separate JSON registries.

## Related documents

[Stock Tables](STOCK_TABLES.md), [Merchant Services](MERCHANT_SERVICES.md), [Public API](API_REFERENCE.md), [Price Guide](PRICE_GUIDE.md), [Weight Guide](WEIGHT_GUIDE.md).
