# Content Standard

**Audience:** product/service authors and reviewers. **Purpose:** define editorial quality and permanent identity conventions. Structural detail is in [Source Data](SOURCE_DATA.md).

## One identity and purchase unit

Reserve `DT_ITEM_<ORIGIN>_<PRODUCT>` IDs in the append-only ledger. Existing origins include GS, TAV, BSM, ALC and BMK. Origins record where a product began; shared goods keep the same ID. Do not encode price, availability, version or a merchant name in identity. Never recycle a retired reservation or quietly change the meaning of a sale unit.

Each record has one explicit `saleUnit`. Price, weight, stock quantity and consumption all refer to that complete unit: a coil, bundle, set, serving or individual projectile. A kit does not generate its component Items. Ammunition is sold per projectile; mundane containers are sold empty unless the specific product says otherwise.

## Names and descriptions

Use familiar title-case names, globally unique after Unicode/whitespace normalization. Describe the object, ordinary use, what is included and meaningful limits in original plain text. Use `\n\n` for paragraphs. Do not embed HTML/scripts, assume campaign facts, narrate character feelings or imply unsupported benefits.

Distinguish 2014 rules, project prices/weights and GM-adjudicated effects. A supplied cosmetic, rope or raw herb must not promise automatic success/healing. Preserve mechanics independently from economy adjustments.

## Required data

Products require id, name, description, saleUnit, price, weight/rationale, icon, category, tags, shops, availability, source and supported mechanics. Categories/catalogues must be registered; files must appear in `data/catalogue.json`. Use one canonical category and meaningful lowercase kebab-case tags. Additional catalogue memberships never require duplicate Items.

Prices use positive whole cp/sp/gp values (cp/sp 1–9); weights use adjusted pounds with a rationale. Service prices have their own broader currency contract. See [Price Guide](PRICE_GUIDE.md) and [Weight Guide](WEIGHT_GUIDE.md).

## Supported mechanics

Use explicit supported loot, container, consumable, weapon, equipment or tool mappings. Weapons/armour/tools/ammunition require reviewed native fields; potions use the 2014 action and single-dose consumption. Supported healing activities must match their authored dice. Limited-use mundane trinkets may declare `mechanics.use.maxUses`; each activation spends one charge of the whole purchased unit, rather than purchasing or deleting an entire kit per charge. Utility consumables do not automatically apply described benefits.

Do not label a mechanical weapon/tool/potion as loot merely to evade validation. Ordinary props or incomplete repair supplies may be mundane loot when their manual limitations are stated. Required-item services select compatible native customer Items and allow one target per checkout line.

## Provenance and artwork

State the actual source and applicable rights. Write original explanations; preserve required third-party notices. `source.license` records provenance and does not select the project's distribution license. Reuse appropriate verified core/module icons before creating assets. New artwork must meet [Icon Standard](ICON_STANDARD.md); see [Source Notices](SOURCE_NOTICES.md).

Historical source audits remain available under [archive](archive/README.md). They establish provenance, not current prices or scope.

## Review gate

1. Check duplicates and reserve identity.
2. Review text, sale unit, economy, weight/capacity, source and artwork together.
3. Register files/categories/memberships and update relevant stock policies.
4. Run `npm run check`; reject unknown fields rather than ignoring them.
5. Build twice in a disposable supported world; inspect native behaviour and test relevant transactions.
6. Record meaningful changes and actual acceptance evidence before release.

Services use `DT_SERVICE_` identities and the separate [Merchant Services](MERCHANT_SERVICES.md) contract. Never create fake zero-weight service inventory.
