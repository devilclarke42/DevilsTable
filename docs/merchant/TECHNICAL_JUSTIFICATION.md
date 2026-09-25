# Technical justification and requirement challenges — Sprint 4 approved design

**Status:** approved design choices; live Foundry proofs remain outstanding. The requirements below describe player experience;
implementation details remain provisional until Foundry V14 / D&D5e 5.3.3 integration checks pass.

## Simpler choices and the trade-offs

| Requirement or assumption | Recommended interpretation | Reason and cost |
| --- | --- | --- |
| “Merchant is more than a shop interface” | Use one standard world NPC Actor with embedded Items and native currency; add small merchant flags and GM windows. | The Actor already has identity, portrait, permissions, tokens, sheet, inventory and coin model. There is no parallel merchant database to reconcile. |
| “Every token is a merchant instance” | Linked tokens point to **one** persistent merchant Actor; unlinked ActorDelta tokens are not automatically separate merchants. | Prevents two copies of the same trader from silently holding different stock. GM can deliberately create another world Actor when independence is desired. |
| “Right-click to browse” | Deliver a token-scoped right-click action on a nearby visible merchant; test it for non-owned tokens before writing the full UI. | Foundry's standard HUD is associated with token control. Replacing core HUDs for all tokens would be brittle. The fallback may need owner review if V14 offers no compatible injection point. |
| “Public Notes visible to everyone” | Send a limited public view to authorized browsing players; do not make the whole NPC Actor observable. | Actor permissions can expose flags, including private relationships, wallets and notes. UI hiding is not access control. Public notes remain nonsecret and available in the merchant view. |
| “Player access to merchant” | Use a module Shop UI backed by a GM-only NPC, never expose its Actor sheet to players. | Separates public shopping from the private NPC data model; keeps standard Actor editing for GMs. A live non-owned-token test must prove the entry point. |
| “Basket is temporary” | Keep it in the player's session, never as an Item, Actor flag or stock reservation. | Cheap browsing, no cleanup jobs, and the last copy goes to the first completed approval. Basket may need rebuilding after reconnect; that is preferable to zombie reservations. |
| “GM approves everything” | A request is only a proposal; one GM reviews a full diff and applies all validated changes. | Avoids automatic spending or stock loss. Rejected trade metadata can be written only after an explicit GM action; a strict ban on even that would conflict with a persistent rejection log. |
| “First approved wins” | One GM coordinator serializes module checkouts for a merchant and revalidates the two Actors before commit. | This prevents two module purchases of the last unit in normal multiplayer. Foundry provides no transaction spanning the two Actors and ledger; third-party/GM edits require stale detection and recovery. |
| “Remember every player” | Index relationship by PC Actor, store the account ID as context. A GM may explicitly link a companion to its owner's record. | Multiple PCs of one user should not share friendship or suspicion; a familiar can inherit a known customer's greeting without duplicating its history. Preserve an optional apparent identity for future disguise rules, but implement no recognition checks now. |
| “Merchant availability” | One GM-set state plus a temporary effective Busy state while a service slot is occupied. | Avoids background schedules and avoids overwriting a Closed/Sleeping state when a request is interrupted. Busy permits browsing, never another checkout. |
| “Nine relationship states” | Keep every requested label as a descriptive, GM-selected state. | Avoids an invented reputation score, auto progression, concealed mechanical modifier or quest system. |
| “Merchant notes are prefilled” | Use a few editable, source-controlled templates with neutral trade prompts. | Produces helpful starting material without invented settlements, families, rumors or magic history. The GM owns the Actor's copy. |
| “Transaction history on every merchant” | Store summary/pointer on the NPC; append full receipts in a GM-only JournalEntry compendium. | An unbounded Actor flag would increase sync and make every sale rewrite a giant customer-history blob. Ordinary Foundry documents provide paging, ownership and export. |
| “Restock by roll table” | Use RollTables to seed an initial assortment, then top up opted-in offers to reviewed targets. | Re-rolling full stock would erase actor edits and recreate sold-out or removed offers unpredictably. New stock additions remain a separate GM review. |
| “Any compatible D&D5e Item” | Permit native D&D5e embedded Items, using Devil's Table flags when available; fall back to a GM-reviewed price/unit. | No vendor-specific content fork is needed. For equipped, attuned, nested or highly stateful Items, require a full-item transfer review rather than losing data or silently stack merging. |
| “Merchant currency” | Use D&D5e Actor currency for both sides, with finite/infinite merchant funding, simple buy/sell modifiers and optional exact-change validation. | Avoids a parallel physical-coin model and reuses the character-sheet currency. Default to native value settlement; add denomination-aware checks only as an opt-in policy after system helper behaviour is verified. |
| “Rejected trade audit” | Save a private ledger receipt on each explicit GM rejection. | Gives the GM a searchable decision history while stock and native currency stay unchanged; ledger failure must be visible and reconciled. |
| “Permanent merchant lock” | Hold one service slot during a GM review, then save a durable recovery stage **after** approval if writing begins. | A basket never needs persistence. A stale lock cannot be released silently after a partial commit; GM inspection is required. |
| “Hundreds of merchants” | Fetch a public view for one merchant at a time and index separate receipts; avoid startup scans or timers that touch all merchants. | Cost scales with the current merchant and paged search results instead of the whole world. |

## Authority and honest limits

The module's socket is a relay for arbitrary messages between clients, **not** a transaction
server. Client-supplied identity, cost, stock or success flags have no authority. The GM checks
the actual PC Actor permission and source documents and alone performs approved writes. The
requesting User's identity must come from a verified V14 transport context, not a field in the
request. Confirm whether the available transport exposes such a context before player checkout
is enabled. If it cannot, present the request as unverified to the GM and require a different,
verified request route before claiming secure customer attribution. A forged request can never
auto-buy goods, but a deceptively attributed proposal would still be unacceptable for accurate
relationships and history.

That relay also sends a response packet to **other connected clients**, even if its UI is addressed
to one player. Never include GM notes, customer state, hidden offers or any location-sensitive
secret in such a packet. If a merchant's available offers must be confidential to one nearby
player, a verified recipient-restricted transport is a separate proof gate; the normal stock
projection contains only merchandise the GM has marked publishable to all players. A five-foot
UI check alone does not keep a broadcast packet secret.

Foundry's document operations support native embedded Item create/update/delete and actor
updates, but they are **separate writes**. An approval window must not claim that checking a
balance makes subsequent writes atomic. Single-writer coordination, short validation windows,
receipt stage checkpoints, idempotent transaction IDs, read-back and a GM recovery panel give
bounded failure handling. These mechanisms cannot guarantee isolation from a GM manually editing
the same Actor or another module simultaneously. Explain this to the GM when a conflict occurs.

The dedicated ledger is proposed as a GM-only **world JournalEntry compendium** with one compact
entry per final decision/recovery record. Its locking, page rendering and indexed flag search
must be tested on V14; if compendium write costs are high, review bounded shards within ordinary
GM-only Journals before introducing any new document type. Ledger writes begin only after a GM
decision, so merely browsing, negotiating or submitting a pending proposal leaves no durable
inventory/coin/request record.

## Native source references and inferences

- [Foundry Actors and token linkage](https://foundryvtt.com/article/actors/) describes Actor
  ownership and linked versus independent placed tokens. Keeping merchant Actors GM-only while
  sending a separate public projection is a **design inference** from that permission model.
- [Foundry V14 document operations](https://foundryvtt.com/api/v14/modules/foundry.documents.html)
  supports updates and embedded-document operations. The absence of a documented transaction
  spanning merchant Actor, PC Actor and ledger is why this design requires recovery.
- [Foundry module socket documentation](https://foundryvtt.com/article/module-development/)
  describes arbitrary packet relay. This does **not** establish verified sender identity for our
  message format. Authenticated user attribution is an explicit feasibility gate.
- [Foundry V14 grid measurements](https://foundryvtt.com/api/v14/classes/foundry.grid.BaseGrid.html)
  provide a basis for range checks; footprint/elevation cases still need live testing.
- [D&D5e 5.3.3 NPC model](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/actor/npc.mjs)
  inherits the [common Actor currency template](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/actor/templates/common.mjs).
  The [currency model](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/data/shared/currency.mjs)
  stores counts and calculates optional coin weight; the [5.3.3 currency definitions](https://github.com/foundryvtt/dnd5e/blob/release-5.3.3/module/config.mjs)
  include cp/sp/gp, ep and pp conversion values. Native coin *counts* are a sound primary wallet.

These references support the design direction, not a claim that the merchant feature was tested in
live Foundry. The exact HUD integration, authenticated request provenance, multiple GM election,
system Item transfer semantics and ledger index are blocking Sprint 5 proofs.
