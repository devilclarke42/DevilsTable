# Merchant services

Sprint 10A introduces services in `0.3.0-alpha.7`. That framework release contained no production services. Alpha.8 adds the [Tavern Services catalogue](TAVERN_SERVICES.md).

## Boundaries and storage

A catalogue can offer **products and services as peers**. Product categories organise Items; service categories organise actions. Services are not children of products, fake Items, stock quantities, or entries in the Master Item Catalogue.

| Data | Storage | Authority |
| --- | --- | --- |
| Packaged definitions | `data/services.json` | Source JSON |
| Extension definitions | `registerServiceProvider` during setup | Provider JSON |
| World definitions | `serviceDefinitions` world setting | Active GM |
| Offers and price overrides | `flags.devils-table.merchant.services` | Merchant Actor |
| Lifetime service counters | `flags.devils-table.merchant.serviceStats` | Verified transaction writes |
| Purchase and execution audit | Existing private transaction receipts | Active GM |

Definitions are shared; merchant flags store only references and overrides. Existing merchants need no migration and offer no services until configured. Inventory, Item IDs and shared compendium UUIDs are unchanged. Definition data is not a secret store: do not place GM notes, hidden DCs or credentials in it. Public Shop projections omit execution references and all statistics.

## GM workflow

1. Open Merchant Builder, select the NPC, and save its catalogue, settlement, prosperity and economic profile.
2. In **Manage**, open **Service Categories / Offerings**.
3. Expand **Shared world service definitions (JSON)** to author categories and services, or install a provider. Validate and Save checks the whole bundle before writing. Editing definitions affects all merchants and is blocked during checkout or recovery.
4. Select categories and choose **Preview / Generate Offers**. Confirmation states the resulting offer count. Generation deterministically adds eligible definitions matching the catalogue and economic profile; it preserves existing enabled/disabled settings and price overrides.
5. Use **Offer this service** to add or remove an offering. **Enabled** temporarily hides it without removing the saved offer. Edit unit price and denomination, then Save Service Offerings. Unchecking Offer removes the reference; it does not erase historical statistics.
6. Players refresh their Shop. Services appear on the **Services** tab; Inventory remains separate. Search matches public names, descriptions, tags and category labels across both views. Category filters still apply. The basket remains visible.
7. Players add products and services to one basket and request the existing GM checkout. The GM reviews line type, original and adjusted prices, quantities and configured execution types. Revised prices or quantities require player consent as before.

The service editor uses JSON data rather than JavaScript. It is a framework authoring interface; a visual definition form can be added later without changing the model. Merchants see only definitions assigned to their catalogue in their offering list.

## Complete definition example

The following example is documentation only and is **not bundled content**. Paste it into the world definition editor to test a non-Tavern, record-only purchase against a General Store merchant:

```json
{
  "categories": [
    {"id": "advice", "name": "Advice", "catalogues": ["general-store"]}
  ],
  "services": [
    {
      "id": "DT_SERVICE_LOCAL_EQUIPMENT_CONSULTATION",
      "name": "Equipment Consultation",
      "description": "Discuss your planned journey with the merchant and review the equipment you intend to carry. The conversation grants no automatic mechanical bonus.",
      "icon": "icons/svg/book.svg",
      "category": "advice",
      "catalogues": ["general-store"],
      "price": {"value": 2, "denomination": "sp"},
      "modifier": 0,
      "maxQuantity": 1,
      "availability": {},
      "requirements": {"actorTypes": ["character"]},
      "execution": {},
      "tags": ["advice", "travel"]
    }
  ]
}
```

### Field contract

- `id`: permanent `DT_SERVICE_` identity followed by uppercase letters, digits or underscores. Include your provider prefix to avoid collisions. Never recycle an ID for a different service. Item IDs remain in their existing namespace.
- `name`: nonempty text, at most 160 characters.
- `description`: plain text, at most 1,600 characters. Explain the purchased action and whether it grants any mechanics. Templates escape this text.
- `icon`: an existing safe `icons/`, `modules/` or `systems/` path ending in WebP, SVG, PNG or JPG. Reuse icons. New project artwork follows the Icon Standard.
- `category`: one service-category ID. Categories require `id`, `name` and a nonempty `catalogues` list. Category IDs use lowercase hyphenated words; they have a separate namespace from product categories.
- `catalogues`: nonempty list of catalogue IDs. Every assignment must also be listed on the parent service category. Missing catalogue providers make services unavailable rather than falling back to another merchant type.
- `price`: nonnegative `{value, denomination}` in native `cp`, `sp`, `ep`, `gp` or `pp`, exactly representable in whole copper. Currency conversion is calculation only; payment uses existing D&D5e Actor currency.
- `modifier`: optional percentage, default zero, from −100 to +500 with up to two decimal places. It stacks with shop, character, negotiation, review and line modifiers under the existing additive/compound rule. Prices round to whole copper once per unit.
- `maxQuantity`: integer 1–100 per checkout. Use one for a nonrepeatable session or task. It is a purchase limit, not a reserved capacity or remaining stock counter.
- `tags`: unique lowercase hyphenated search terms; may be empty.
- `availability`: optional `settlements`, `prosperities` and `profiles` arrays matching saved economy IDs. Empty arrays impose no restriction. Every nonempty rule must match. No arbitrary expression evaluation occurs.
- `requirements`: optional `minLevel` (integer 0–20), `actorTypes` (native Actor type IDs), and `note` (public explanatory text). The first two are enforced by the GM at quote time; notes are advisory checks for the GM. Unsupported rules fail validation.
- `execution`: optional UUIDs keyed by `macro`, `journal`, `rollTable` or `activeEffect`. Inline scripts and unknown action types are rejected. All configured documents must resolve to the expected native type before payment.

Plain data can express catalogue/economy eligibility, level/type requirements and existing document integrations. It cannot express arbitrary time scheduling, repair targets, capacity reservations or complex predicates in this sprint. Add future rules explicitly with validation rather than embedding code in JSON.

## Checkout and execution

Service request IDs are transported as `service:<permanent ID>` so they cannot collide with native Item IDs. A request contains identities and quantities only. The active GM reloads current definitions, eligibility, modifiers and funds; player-provided prices or execution data are never trusted.

The existing merchant lock covers mixed and service-only checkouts. Multiple players can browse. Extra checkout requests receive the existing occupied message. Product lines transfer Items; service lines never do. Currency, service counters and relationship memory use the existing persisted plan, verification and reverse compensation.

After the payment transaction is durably completed, each optional integration runs **once per service line**, not once per quantity:

| Integration | Behaviour |
| --- | --- |
| None | Paid service is recorded; the GM narrates fulfillment |
| Macro | Execute as active GM with the customer Actor and merchant/service context; context includes purchased quantity |
| Journal Entry | Open the existing journal sheet for the GM; do not change ownership or broadcast private pages |
| RollTable | Draw using the native API without public chat; result text is stored in the private receipt |
| Active Effect | Copy the referenced native effect onto the customer Actor, with a fresh ID and source UUID as origin |

The GM sees execution types before approval. Use only trusted macros: a macro may make arbitrary world changes beyond this module's transaction plan. Foundry's native APIs are used for each action ([Macro](https://foundryvtt.com/api/classes/foundry.documents.Macro.html), [RollTable](https://foundryvtt.com/api/classes/foundry.documents.RollTable.html), [JournalEntry](https://foundryvtt.com/api/classes/foundry.documents.JournalEntry.html)).

An `attempted` marker is saved before running an integration. On failure it becomes `needs-attention`, with an error and a GM notification. Payment stays completed: arbitrary effects cannot be safely compensated. These actions are never automatically replayed, including during transaction recovery. After a crash, inspect the receipt and the world before manually fulfilling the service. A pending/attempted action may not have run, or may have run before its final audit save. Re-buying is not a retry mechanism.

Receipts with unfinished post-payment actions are excluded from automatic retention trimming. Explicit Reset Merchant remains a confirmed history deletion and removes this merchant's service references/counters along with the rest of its merchant flags. It does not delete world definitions or undo previously fulfilled effects.

## Statistics

Per-service Actor counters record purchased units, gross revenue after modifiers, purchase transactions and last purchase date. Popularity is the percentage of all purchased service units belonging to that service; it is not a rating or trend. Merchant Summary includes total purchased service units, service revenue and the most recent purchase date. Removing an offering preserves its counters. Lifetime service revenue is also included in ordinary merchant earnings; do not add those figures together as independent income.

## Extension registration

During Foundry `setup`, pass a plain JSON bundle to:

```js
game.modules.get("devils-table").api.registerServiceProvider(bundle);
```

Use the same `categories`/`services` shape shown above. Register new merchant catalogues through the existing catalogue provider API. Definitions must be registered before ready; startup validates collisions and references. Services never enter the Item builder or source Item index. No merchant-type branches exist in the Shop or service purchase pipeline.

## Validation and live acceptance

Automated tests cover service-only and mixed transfers, funds/eligibility/quantity checks, modifier reuse, statistics rollback, document preflight, execution failure/non-replay, native flag deletion, category generation, UI filtering, and simulated two/three/five-player contention.

Before treating this candidate as live-validated, use GM and player sessions on Foundry V14 / D&D5e 5.3.3:

1. Define the record-only example, offer it, and verify players see Services without Actor ownership.
2. Buy it alone and alongside a product. Verify native funds, Item counts, counters and receipt line types.
3. Change quantity/price in review and confirm player consent. Reject another request and verify no charge or counters.
4. Have multiple players browse and submit checkout together. Confirm only one active review.
5. Disable or remove an offering and refresh. Check that old baskets fail authoritative checkout.
6. Test each integration using disposable world documents. Verify private journal/table behaviour and the customer effect.
7. Make a test macro fail. Confirm payment remains complete, the receipt needs attention, and recovery does not replay it.

These live checks cannot be replaced by Node mocks; no live Foundry session was available during implementation.

## Optional content metadata and defaults (alpha.8)

Definitions may provide `saleUnit` and `duration` as nonempty text up to 300 characters. Duration
is descriptive and never advances time. `recommendedRange` is `{min: {value, denomination}, max:
{value, denomination}}`; the base price must lie between those nonnegative values. Merchant price
overrides and modifiers may exceed the guidance. Older definitions can omit these fields.
Catalogue `metadata.defaultServiceCategories` names service categories to seed on explicit Builder
Save, subject to normal catalogue/economy eligibility. Processed IDs live in
`merchant.builder.serviceDefaults.<catalogueId>` and prevent unwanted recreation of removed offers.
