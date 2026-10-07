# Blacksmith Guide

Sprint 13 ships in 0.3.0-alpha.17. It uses the existing shared Item compendium, merchant stock tables, Builder, native Actor currency and GM approval pipeline. Live Foundry V14 / D&D5e 5.3.3 / Forge acceptance remains required.

## Products and mechanics

The Blacksmith has **73 products**: 58 new records and 15 shared General Store records. Shared products retain their original IDs, prices, weights and categories; only catalogue membership changes. The complete project contains 370 products, 25 services and 68 stock tables.

The new equipment includes all 37 mundane 2014 simple/martial weapons, 12 suits of armour, a shield, four ammunition types, Smith's Tools, a lock, manacles and a steel billet. Existing chains, horseshoes, climbing fittings, hand tools, charcoal, iron and copper bars supply the workshop range. Bows and wooden weapons represent bought-in stock and repairs, not an assertion that every smith manufactures them.

Weapons are native D&D5e weapon Items with attack activities, damage, range and properties. Armour and shields are native equipment with AC and applicable Strength/Stealth restrictions. Smith's Tools is a native tool. Ammunition uses native ammo subtypes. No 2024 weapon mastery is added. The 2014 lance and net exceptions are explained in the descriptions; conditional adjudication remains with the GM.

Each ammunition purchase is **one projectile**, not a bundle. Quantity and weight therefore match native shot consumption. Native equipment mappings were reviewed against the official D&D5e release-5.3.3 source. Strict live document validation still runs before compendium writes; automated tests do not substitute for that gate.

## Prices and adjusted weight

Durable combat equipment retains its familiar 2014 price where it serves progression: a longsword costs 15 gp, a shield 10 gp and plate 1,500 gp. Small replacements and routine labour use copper and silver. Sling bullets cost 2 cp each, a project adjustment to avoid fractional copper. Prices remain editable through existing merchant modifiers.

New weapons, armour and Smith's Tools use 80% of their published baseline weight as an explicit Variant Encumbrance policy. This is a gameplay adjustment, not a historical weight claim. A sling weighs 0.1 lb rather than zero. Individual ammunition retains per-projectile mass. Trade metal sold by the pound remains exactly one pound. Existing shared goods keep their established weights.

## Services

| Service | Base price | Suggested duration | Required item |
| --- | --- | --- | --- |
| Repair Weapon | 5 sp | 1–4 hours | Weapon |
| Repair Armour | 2 gp | Half a working day | Light, medium or heavy armour |
| Sharpen Blade | 2 sp | 30 minutes | Supported edged weapon |
| Silver a Weapon | 100 gp | Two working days | Suitable weapon, confirmed by GM |
| Resize Armour | 8 gp | One working day | Armour of the same size class |
| Replace Bowstring | 4 sp | One hour | Bow or crossbow |
| Replace Shield Straps | 3 sp | One hour | Shield |
| Custom Fitting | 15 gp | One working day | Armour |
| Basic Appraisal | 5 sp | 15 minutes | Weapon, equipment or tool |

Each definition includes an editable recommended price range. Ranges and durations are guidance, not automatic pricing or scheduling. Prices cover the limited scope in each description. Extensive damage, magical work and size changes require a separate GM agreement.

Approval pays for and records the commission. It does **not** automatically repair a durability value, add a bonus, identify magic, remove restrictions or silver the selected weapon. The GM decides completion and applies any necessary native Item changes. Silvering covers one suitable weapon, not ten ammunition pieces. Existing optional action hooks remain available, but no durability integration is bundled.

## Required-item workflow

1. Select the purchasing character and open the merchant.
2. Add a service from Services.
3. In the visible basket, select an eligible Item from that character's inventory.
4. Request checkout. The GM sees the service and selected Item together.
5. Approval settles the normal payment and records the selected Item in the private receipt.

Requirements filter native Item type, optional subtype and optional base-item identity. They do not rely on Devil's Table metadata, so compatible third-party equipment works. Missing selections, removed/ineligible Items and attempts to sell a service target in the same checkout are rejected. The GM checks the requirement again on approval and the transaction checks it under the existing Actor write guard.

A service requiring an Item currently allows one target and one purchase per checkout. Separate targets require separate checkouts. There is no reservation, custody transfer or item consumption. Switching purchasing characters clears target selections. The selected name in history is an intentional historical snapshot; inventory remains owned by the Actor.

## Ready-to-use presets

Open an NPC's three-dot menu → **Make Merchant - DT**, apply a preset, save configuration, then preview and apply stock and float.

| Preset | Settlement / prosperity | Pricing | Character |
| --- | --- | --- | --- |
| Village Smith | Village / Average | 0% | Tools, horseshoes and simple arms; fine equipment is rare |
| Town Blacksmith | Town / Prosperous | +5% | Broad weapon/armour selection and specialist services |
| Master Armorer | City / Wealthy | +20% | Armour, shields, fittings and a larger cash reserve |
| Military Quartermaster | Town / Prosperous | 0% | Standard weapons, ammunition and protective equipment |
| Travelling Smith | Hamlet / Poor | +10% | Portable stock, fewer draws and a modest reserve |

Each preset has editable notes and a suggested greeting. Stock generation uses the existing always/often/rarely tiers, exclusions, quantity policy and economy multipliers. Profiles differ in pools and guaranteed stock; repeated random generation can still overlap. The Village profile retains the existing base table identities. Four variants add only sixteen tables. Category filtering reuses those pools.

Basic services are available to all smith presets. Silvering and custom fitting are limited to town, master and military presets; generic specialist/luxury economy profiles also qualify. Existing explicit service overrides remain preserved when presets change. Weekly/manual restock settings are preferences, not new scheduling automation.

## Future integrations

The requirements.item object supports types, optional subtypes and optional baseItems. Item-required services must set maxQuantity to 1. These selectors describe native system fields; no scripts or arbitrary predicates are accepted.

Optional execution jobs receive targetItemId and targetItemName alongside the purchasing character and service context. An integration should resolve that embedded Item on the character again, verify eligibility and permission, and use the Integration Manager. Never assume an old name proves identity. An optional failure after payment requires GM attention; it must not silently replay or charge again.

## Live acceptance checklist

- Rebuild Blacksmith Items and stock tables through their existing builders; confirm the second run has no changes.
- Generate each preset and inspect its service and stock differences.
- Equip a shield and armour; roll a weapon attack, versatile damage and ammunition consumption using native D&D5e controls.
- As a player, buy equipment and a repair together; select an owned target and confirm the GM sees it.
- Try an absent target, wrong type, sale of the target and deletion before approval; verify refusal without payment.
- Approve a valid repair; verify payment, receipt target and unchanged equipment.
- Check five-player browsing and simultaneous checkout still obey the existing single-merchant service lock.
