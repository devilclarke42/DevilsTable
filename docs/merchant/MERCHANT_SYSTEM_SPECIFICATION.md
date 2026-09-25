# Merchant System Specification — Sprint 4 proposal

**Status:** proposed for review, 2026-09-25. **Implementation:** none in Sprint 4.  
**Target:** Foundry VTT V14, D&D5e 5.3.3, 2014 rules and The Forge.  
**Existing baseline:** the 144-item catalogue, 32 stock tables and read-only stock roller remain as documented in [the architecture guide](../ARCHITECTURE.md).

## Experience and boundaries

An individual merchant is a persistent, world-level D&D5e `npc` Actor. Its linked scene tokens
refer to the same Actor, stock, wallet, notes and customer history. A merchant is not an extra Item
compendium or a player-controlled character. The GM creates or designates an NPC, chooses an
existing shop profile and can seed its starting inventory from existing stock tables. Thereafter
the NPC's embedded Items and D&D5e currency are its live state. Subsequent catalogue/table builds
do not overwrite that state or an actor's manual edits.

The baseline merchant features are inventory, a coin wallet, a selected shop profile, optional
restock targets, editable notes, customer relationships, greeting suggestions and a searchable
transaction ledger. Templates provide editable defaults for Innkeeper, General Store, Blacksmith
and Alchemist. They are authoring presets, not new Actor types, generated campaign histories or
extra item identities. The GM may change a merchant's name, prices, stock, notes and greeting text.

Players open a **Browse Merchant** action by right-clicking a visible merchant token when controlling
an eligible PC token in range. The default distance is 5 feet, configurable by the GM. Opening,
searching, reading descriptions and editing a local basket are read-only operations. Checkout and
optional negotiation produce a request to the active GM; players cannot write NPC stock, funds,
private notes or relationships. If the GM is unavailable, browsing can be unavailable until the
merchant's public view is supplied; checkout never proceeds unattended. The UI displays a clear
unavailable state rather than assuming stale stock is current.

An item in a basket is **not held**. At checkout, the module assigns one merchant service slot
and shows one GM decision window for that request. Other players can still browse, but a second
checkout for that merchant reports that it is occupied. The GM can reject, change lines and
quantities, set prices or discounts, settle coins, or approve. Immediately before committing,
the authority reloads the merchant and customer Actors, checks proximity, permissions, stock,
coin balances, sold-item ownership and the GM's final choices. If anything changed, it stops and
shows the difference. The first approved **and successfully committed** trade receives the last
limited unit. An approval alone does not reserve stock ahead of validation and writes.

## Features in scope

| Feature | Proposed behaviour |
| --- | --- |
| Merchant and shop profiles | One world NPC with an editable `shopProfileId`, optional existing stock-profile prefix, merchant template ID and public display name. Shop selection guides seeding and future restock suggestions; it does not duplicate catalogue Items. |
| Inventory | Native embedded D&D5e Items with quantities. Supports authored and compatible non-Devil's Table Items, manual additions/deletions, merchant price overrides, finite/unlimited offers and explicit restock targets. |
| Wallet | Native `system.currency` coin counts. Finite or infinite merchant funds; actual player funds are always finite. Abstract, Physical Coins and GM Controlled settlement policies are defined in [the data model](DATA_MODEL.md). |
| Notes | Public flavour sent in the browsing view; editable GM notes and per-PC relationship notes remain GM-only. Source Merchant Notes can seed editable text but never overwrite it during rebuilds. |
| Customers | One record per **PC Actor**, with optional last-seen User ID as context. A player's two characters have separate relationships; multiple users of one PC share its relationship. |
| Greetings | Editable neutral suggestions associated with relationship states. The GM controls tone and can disable a suggestion. Greetings grant no discount or attitude effect. |
| Transactions | One proposal can include purchases, sales and a net coin transfer. The GM sees a full diff and a single final decision. A rejected request never transfers Items or coins. GM-authorized rejection may be logged as a rejected decision. |
| Negotiation | A request, optional GM-chosen skill/DC, player roll, advisory discount and GM acceptance/edit/rejection. No automatic NPC social checks or involuntary pricing. |
| History | GM-only, searchable approved/rejected/interrupted records in a dedicated world ledger; browsing and basket edits never create entries. |

### Proposed advisory policy

Use **Persuasion** as the initial suggested skill, selectable from the installed system's skill
list; the GM may choose another or request no check. Suggest DC 15 for Unknown/Recognises, 12
for Regular, 10 for Trusted/Friend, 18 for Suspicious, 20 for Dislikes and 25 for Hostile;
Banned customers require an express GM override before negotiation. The GM may replace or ignore
every suggested DC. A success by 0–4 suggests 5% off the **purchase** subtotal, by 5–9 suggests
10%, and by 10 or more suggests 15%; a failure suggests zero. Round the suggested discount down
to a whole copper; never automatically discount the value of Items sold by the PC. These values
are starting GM-facing defaults, not 2014 rulebook mechanics. They require play review. The GM
may instead set a fixed copper amount, a different percentage or no discount.

Editable neutral greeting examples: Unknown, “Welcome. Let me know if anything catches your eye.”;
Regular, “Back again? Good to see you.”; Trusted, “I've set aside a few things you might like.”;
Suspicious, “What are you looking for today?”; Banned, “I won't trade with you.” Other states
fall back to the Unknown greeting until the GM writes their own. The greeting is public flavour,
not proof that the merchant is holding an Item or an automatic relationship reveal.

### Merchant access

Use the controlled PC token and linked PC Actor as the customer. The token and merchant must be on
the same visible scene. Distance uses the scene's native grid measurement with creature footprints
and elevations considered; at a five-foot setting, adjacent occupied spaces count. Gridless scenes
use measured geometry. The GM can override distance for an individual decision, with the override
recorded in the receipt. Validate again at checkout and immediately before commit. A PC moving
away can keep looking at an already opened window but cannot submit or complete checkout until
in range. Hide the action for hidden merchants or users without a valid controlled PC; the GM may
open the management panel from the Actor sheet regardless of scene distance.

The desired right-click action must be tested on **non-owned** merchant tokens in V14. Core's
Token HUD behaviour is tied to token control, so the implementation may need a token-scoped
context action in the right-click flow, rather than an extra button on the default owner HUD.
Do not replace Foundry's Token HUD class or hijack normal token interaction merely to meet the
shortcut. The exact integration point is a Sprint 5 proof gate; the promised player outcome is a
right-click entry for a visible, nearby merchant with normal token use preserved.

### Persistent state and stock

The Actor holds only merchant configuration and short, current relationship records. Its Items
are the single source of truth for live stock; `system.currency` is the single source of truth
for physical balances. A purchase reduces one embedded Item's quantity; an unlimited offer does
not decrement. A GM manual removal is explicit and is not silently recreated. Ordinary restock
tops up only missing units for opted-in offers, using a configurable target and schedule; it
leaves manual stock, prices, uses, attachments and unrelated Items intact. Changes made directly
on an Item sheet that the module cannot distinguish from a purchase are flagged for GM review.
There is no periodic world-wide actor rewrite. See [DATA_MODEL.md](DATA_MODEL.md).

### Permissions and confidentiality

Merchant Actors and the transaction ledger are GM-only documents. Players do not need Observer
or Owner permission on either. A GM authority returns **only** a short public stock projection:
name, icon, customer-safe description, price, sale unit, availability count or “available,” and
public note/greeting. It omits merchant wallet, purchase cost, GM notes, other customers,
relationship state and transaction history. A greeting can be shown without exposing the
relationship record that suggested it. Never rely on hiding an HTML control to conceal an Actor
flag from a user permitted to read that Actor.

Approved catalogue descriptions can be published from their public Item source. For an arbitrary
third-party Item, the GM reviews its text or writes a separate public description before that
description is shown. Until then, the player sees its name and “Ask the merchant for details”;
do not relay raw Actor Item flags, secret blocks or GM annotations as description text.
The standard public projection includes only stock the GM has marked publishable to **all**
players. A location check determines who may open the window and checkout; it does not make a
broadcast socket packet secret from other connected clients. Restricted stock stays GM-only until
recipient-restricted delivery is proven on the target runtime.

Player requests are proposals, not authoritative data. The GM resolves Actor and Item IDs itself,
checks that the PC belongs to the requester, ignores client-supplied prices/ownership/discounts,
limits payload sizes and request rate, and rechecks all values when committing. Server-side
identity guarantees of V14's module socket transport need explicit verification in Sprint 5;
the design does not claim that a client-declared User ID proves identity. A GM must explicitly
approve every change to stocks and wallets. Cross-module/direct GM edits remain possible and
are detected or sent to recovery rather than silently merged.

## What a completed decision means

- **Approved and committed:** both inventories and wallets reflect the approved settlement; the
  transaction has a durable receipt; relationships and counts update exactly once.
- **Rejected:** stock and money stay unchanged. If the GM confirms rejection, its status may be
  recorded without treating the request as a completed purchase.
- **Stale or interrupted:** no success notice. A durable stage record permits a GM to compare
  actual documents and resume or correct manually. Foundry's multi-document updates are not a
  database transaction, so a successful click is not sufficient proof of a completed trade.

## Review gate

The proposed decisions in [TECHNICAL_JUSTIFICATION.md](TECHNICAL_JUSTIFICATION.md) require owner
review before Sprint 5. In particular, review the GM-only Actor/public projection, PC-specific
relationships, the three money modes, GM-authorized rejection logging, and the requirement that
the right-click action work for non-owned tokens. [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
defines the evidence needed before any automation is released.
