# Merchant identity and data ownership

Sprint 11A (`0.3.0-alpha.9`) adopts this rule: **if Foundry VTT or D&D5e already stores a value, reference it rather than duplicating it.** The merchant remains a standard NPC Actor. Native inventory and currency remain authoritative. This refinement adds no new trading, reputation or disguise mechanics.

## Actor data and System Tags

The Builder's Identity tab reads native documents through `scripts/merchant/identity.js`. It does not write or cache those values in module flags.

| Information | Native source | Behaviour |
| --- | --- | --- |
| Name | `Actor.name` | Read only in Builder; Shop heading uses the exact scene token name |
| Portrait | `Actor.img` | Automatic portrait, with the standard mystery-person silhouette when absent |
| Species / race | `system.details.race`, falling back to embedded race Items | Supports the D&D5e LocalDocumentField, Item ID and textual fallback |
| Creature type | `system.details.type` | Uses native type/custom value and configured labels |
| Class | Embedded class Items and their levels | Does not infer classes from challenge rating, profession or name |
| Size | `system.traits.size` | Uses the system's configured label |
| Alignment | `system.details.alignment` | Absent values display “Not specified” |
| Biography summary | `system.details.biography.value` | Plain-text, truncated GM-only summary; never automatically published |
| Token | `Actor.prototypeToken` and scene TokenDocuments | Shows prototype name/image and scene token names; identifies unlinked tokens |

System Tags are transient descriptors derived from species, creature type, class, size and alignment. Their IDs use `system:<kind>:<value>`. They are read-only and regenerated on access. Name, portrait, biography and token information are displayed as native fields rather than turned into unsuitable tags. A missing field produces no invented tag. Localized labels are presentation values; native size/type keys identify those tags. Textual race, class and alignment tags naturally change when their native names change.

Actor, embedded Item/ActiveEffect and token changes repaint the read-only fields while preserving unsaved business text. Listeners are removed when the Builder closes. The Builder reads the world NPC; unlinked token ActorDelta identities are not treated as separate merchants. The existing merchant entry system continues to require linked tokens.

The supported native schema is D&D5e 5.3.3, using its [details fields](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/actor/templates/details.mjs), [NPC model](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/actor/npc.mjs) and [traits fields](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/actor/templates/traits.mjs). Native changes use [Foundry document hooks](https://foundryvtt.com/api/modules/hookEvents.html).

## Merchant data

Only business-specific identity is saved in `flags.devils-table.merchant.identity`:

| Field | Purpose | Visibility |
| --- | --- | --- |
| `schemaVersion` | Identity payload version, currently 1 | Internal |
| `businessName` | Establishment name, distinct from the NPC/token name | Public |
| `merchantTitle` | Trading role or business title | Public |
| `merchantTags` | Editable descriptive business metadata | GM only |
| `publicDescription` | Merchant-facing flavour written for customers | Public |
| `shopDescription` | Description of premises or trading operation | Public |

Business names and titles allow 160 characters; descriptions allow 2,000 plain-text characters. The UI escapes text. Empty fields remain empty rather than copying native names or biographies. Merchant Tags allow up to 50 entries, each up to 60 characters, normalized to lowercase hyphenated labels and deduplicated. `Local Produce` becomes `local-produce`. Namespaces containing a colon are rejected, so a GM cannot impersonate a System Tag through this field.

Save Merchant Identity is explicit and GM-only. It uses the existing administration guard and refuses active checkout/recovery or stale configuration. Reload NPC discards local drafts after confirmation. Identity edits never modify native documents, stock, wallets or relationships.

The Shop retains its exact token-name heading. Business name/title appear underneath; public descriptions appear below the header. The coordinating GM projects only those four public text fields, portrait and availability. Merchant Tags, System Tags, biography, alignment and private notes are not sent to players. Players require no ownership of the merchant Actor.

## Stored-field audit

This audit covers the existing persistence families; it does not introduce another storage system.

| Existing state | Owner and decision |
| --- | --- |
| Actor name, image, biography, race/type/class/size/alignment, token configuration, ownership | Native Foundry/D&D5e; reference directly |
| Actor Item collection, quantities, Item descriptions/weight/base prices and native wallet | Native Foundry/D&D5e; no parallel merchant inventory or wallet |
| Merchant `schemaVersion`, `enabled`, `merchantId` | Module lifecycle/compatibility identity; retain existing stable merchant identifier |
| `catalogueId`, `economy` settlement/prosperity/profile | Module business configuration; retain |
| `availability`, `settings` prices/funds/stock/interaction controls | Module trading policy; not a copy of physical coins or Items |
| `notes`, `identity` | GM business notes and deliberate public business metadata; retain separately from biography |
| `relationships`, `relationshipDefaults`, `confidence` | Character-specific trading memory and GM suggestions; retain |
| `restock`, `builder`, service-default markers | Generation preferences and once-only default-seeding state; retain |
| `initialFloat`, `administration` timestamps | Idempotency/audit markers, not the current wallet or inventory; retain |
| `services`, `serviceStats` | Definition references, enabled/availability/price overrides and accumulated usage; not fake Items |
| Legacy `history`, private transaction receipts | Historical records; receipt names, prices and line descriptions describe the past and must not track renaming |
| Root `transactionPending`, recovery before/after images | Recovery links and compensating-write evidence; native snapshots are intentional and necessary for safe rollback |
| Item source/category/tag/shop/weight-policy/sale-unit flags | Catalogue provenance and module semantics; not Actor identity |
| Item `offer` flags | Explicit price/public-description overrides, stock origin and restock preferences; retain intentional trading overrides |
| Token `merchantEntry` flag | Public interaction routing for a GM-only Actor; not duplicated token identity |
| Template pack and service-definition setting | Reusable configuration/definitions; not live Actor copies |
| In-memory baskets, quotes, service locks, read-only projections and Builder drafts | Temporary UI/coordination data; never an alternative persistent source of truth |

No duplicated native identity fields were found in the shipped merchant schema. Consequently no destructive migration is needed. Existing merchants gain empty optional business fields on read; saving creates only the new versioned identity namespace. Historical receipts, compendium UUIDs, templates and source IDs remain unchanged. Unknown third-party flags are not removed speculatively.

The optional service-offer `available` boolean defaults to true when absent. Existing worlds therefore keep their previous behaviour without a bulk migration. Disabling an offering hides it; setting availability false keeps it visible as temporarily unavailable and prevents checkout authoritatively.

## Future boundaries

Identity derivation is a small native-schema adapter; business metadata is a separate validated payload. A future disguise/recognition layer may resolve which character a merchant recognises without rewriting native Actor information. Relationships remain keyed to character identity today. Factions, reputation, regional generation and plugins may consume descriptors later; this sprint stores no guessed faction, disguise, alternate identity or automatic tag-driven stock rules. Derived System Tags are descriptive, not permanent identities for matching transactions.

## Acceptance in Foundry

Automated tests cover native reads, missing values, validation, protected writes, listener disposal, public projection and service checkout enforcement. No live Foundry/Forge session was available for this candidate.

1. Upgrade a backed-up alpha.8 world. Existing stock, coins, Tavern offerings, service overrides and history must remain intact.
2. Open Builder Identity for a linked NPC. Change native name, portrait, biography, race/type, size and an embedded class on its Actor. Confirm the read-only panel updates without losing unsaved business text.
3. Save a business name/title, descriptions and comma-separated Merchant Tags. Reopen Builder; verify normalization and that native fields are unchanged.
4. As a player without NPC ownership, open the Shop. Verify the exact token name, portrait and public business text. Confirm native biography and private tags are absent. Change the public business text as GM and verify the open player Shop updates.
5. In Services, search and filter by category/status. Edit a price, switch tabs and return; preserve the draft until Save. Temporarily mark a service unavailable, save and refresh the player Shop. It must remain visible but cannot be purchased. Disabled services must be hidden.
6. Open two Builder windows. Save identity or services in one; the other's stale save must fail until Reload. Start checkout and confirm administration refuses writes until the checkout closes.
7. Close Builder during normal use and after failed validation; it must close normally. Complete an ordinary mixed goods/service transaction and verify native balances, inventory and usage statistics.
