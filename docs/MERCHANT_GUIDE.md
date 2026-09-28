# Merchant Builder guide

The Merchant Builder is a GM tabbed workflow: **Setup → Stock → Cash → Manage**.
Use Back/Next or jump directly to any tab. Tab switching preserves draft fields and performs no writes. Open it from **Merchant Builder** in
module settings or the GM Shop UI. Advanced Trade Settings / Recovery opens the existing trade
administration controls; no Actor sheet is needed for the normal builder workflow.

## Create a merchant

1. Select a standard NPC Actor. Apply a preset or edit the configuration directly.
2. In Setup, choose catalogue, settlement, prosperity, availability, funds mode and pricing. Save / Convert.
3. In Stock, select Generate Stock. Review goods, quantities, value and cash plan before confirming.
   Override proposed quantities, then Update Stock Preview; zero omits a new good. Existing goods cannot be edited through a generation preview.
4. Apply the preview. Existing catalogue goods are skipped, including sold-out entries.

Conversion adds module flags and marks existing linked scene tokens as shop entry points. It
preserves biography, portrait, token appearance/name, ownership, inventory and currency. Unlinked
tokens are not silently linked or converted; use a linked token for the existing Shop entry system.
Stock generation requires the shared Item Catalogue and Stock RollTables to have been built using
the module's existing builders. Missing or outdated tables produce an actionable error.

## Configuration and live estimates

Catalogues and categories come from the existing registry. Stock profiles are filtered by catalogue;
Automatic chooses a matching settlement/economic profile where data provides one, otherwise the
catalogue's primary profile. No merchant-type switch is embedded in the UI.

Settlements are Hamlet, Village, Town, City and Large City. Prosperity is Poor, Average, Prosperous,
Wealthy or Luxury. An additional economic profile retains the existing modest/standard/specialist/
luxury policy. Their editable factors live in `data/economy.json`.

Changing configuration updates the informational estimate without writing world data. It shows
expected missing goods, sale units, base value, category distribution, float range and rare-item
probability. Current merchant statistics remain separate from the proposed configuration. Save
before generating or applying stock and cash. A stale panel requires Reload NPC if merchant data
changed elsewhere; it must not overwrite another GM's edits or newly recorded transactions.

Expected counts use the probability of selecting each tier, capped by available pool size, then
uniform selection within that tier. Quantities use the existing weighted distributions with
settlement/prosperity scaling and a configured cap. Rare quantities retain their existing 95%
one-unit / 5% two-unit distribution. Rare probability describes the entire rolled assortment,
not a guarantee of a new rare addition: an already-owned good may be selected and skipped.
Existing source IDs are excluded from estimated additions. Base value excludes shop discounts.

The initial float range describes an eligible new merchant, not an automatic grant to every NPC.
Partial catalogues are explicitly labelled. In this candidate Tavern still uses its existing
active shared goods; deferred Tavern content has not been activated or rewritten.

## Regenerate Selected

- **Stock:** rerolls assortment and quantities. An existing float preview is retained.
- **Float:** rerolls cash independently and updates the stock preview's associated cash plan.
- **Notes:** restores editable notes from the selected template or authored catalogue merchant
  notes. Existing draft notes require confirmation before replacement. Save the notes afterward;
  a notes-only save preserves stock and float previews.
- **Greetings:** reserved for future work; no greeting generator is implemented.

These actions only create local previews. Changing generation-related configuration invalidates
old previews. Applying a template also discards previews. Switching NPCs or reloading prompts
before discarding unsaved settings/previews.

## Float and wallet preservation

The builder reuses the native cash planner. Existing nonzero wallets, established merchants and
infinite-funds merchants receive no automatic cash replacement. Initialization markers prevent
repeat grants after spending or Empty Stock. Previewing never transfers coins.

In the Cash tab, **Generate / Reroll Cash Preview** always rolls a proposed replacement wallet for
a finite-funds merchant, including an existing merchant. This manual action no longer silently
preserves the old wallet instead of rolling. The confirmation explicitly identifies the replacement.
Infinite Funds must be disabled and saved before generating native cash. Automatic initial-stock
float generation still preserves existing wallets. Set a final amount and
native denomination, select **Update Float Preview**, then confirm. Whole-copper precision is
required; there is no parallel wallet or coin Item system.

Apply Float Only changes cash without changing inventory. Applying stock also applies its float
when new goods were added. If every proposed good was skipped, apply eligible cash separately.
A wallet or economy change invalidates stale cash plans. Foundry stock creation and Actor cash
updates are not one atomic operation: if one fails, inspect the reported partial state before
retrying. Existing stock is never silently deleted to make a preview fit.

## Funds, stock, relationships and notes

Infinite Funds uses the existing settlement implementation. Infinite Stock keeps the merchant's
physical Item as a reusable offer instead of consuming it on a purchase. Each checkout is bounded
by the displayed offer quantity (at least one); native containers remain individual Items. Buying
still requires funds, approval and the existing delivery/rollback pipeline. Character sales still
consume the character's Item normally. Finite stock behaviour is unchanged.

The shop modifier is the existing percentage pricing modifier. Relationship defaults provide a
starting descriptive state and pricing modifier for new customer records; existing customer
records are not rewritten. Notes are GM-only text and templates contain no random campaign lore.

Restock profiles are saved schedule preferences only. Daily and Weekly do not start a scheduler.
Automatic replenishment, greetings, services and new trading mechanics remain outside Sprint 9.

## Templates

Built-in presets are Village General Store, Roadside Tavern, Travelling Merchant, Town Blacksmith
and Temple Quartermaster. The quartermaster uses the General Store catalogue rather than inventing
another catalogue. Applying a preset fills an editable draft; Save / Convert commits it.

Save as Template stores the current portable configuration under a distinct name. Custom presets
appear alongside built-ins and remain editable after applying. They contain no Actor UUID, inventory,
cash balance, customers, transaction history or ownership. The schema-versioned JSON settings are
suitable for future export/sharing; no import/export interface is implemented in this sprint.

Custom templates live in **Devil's Table — Merchant Templates (GM Only)**,
`world.devils-table-merchant-templates`, a JournalEntry compendium created on first save. This is
not another Item catalogue. Private notes are not stored in world settings visible to players.
The builder refuses a template pack exposed to players; correct its permissions before continuing.
Only the active GM writes shared templates, with duplicate-name and configured count protection.
Unavailable provider/catalogue presets are labelled unavailable rather than silently substituted.

## Maintenance and acceptance

Empty Stock retains its confirmation and removes physical goods while preserving cash, NPC
features, spells, merchant settings, notes, relationships and history. Checkout, recovery and
administration share existing write guards; browsing remains available.

Automated checks cover conversion preservation, stale configuration, locks, templates/privacy,
generation factors, estimates, float precision, native settlement, rollback and panel actions.
They are simulations, not a live Foundry or Forge acceptance result. Before adopting the build:

1. Convert an existing NPC with biography, portrait, permissions, token, items and cash; verify all
   those values remain intact after saving configuration.
2. Try each built-in preset and a custom saved preset. Change settings repeatedly in the panel;
   verify estimates update and nothing is written before Save/Apply.
3. Generate stock, reroll only the float, edit its amount, and confirm. Verify native inventory/cash
   match the preview. Regenerate Notes, save only notes, and confirm the other previews persist.
4. Cancel Empty Stock, then confirm on a test merchant. Check records/cash are preserved.
5. Compare player and GM views. Players must not access the builder or template compendium.
6. Buy finite and infinite offers, reject a checkout, and test simultaneous requests with two,
   three and five clients. Confirm normal funds checks and merchant locking still hold.
7. Check the panel at your usual window size, including scrolling and partial-catalogue notices.

### Container display and closing the Builder (alpha.5)

Identical empty containers appear as one Shop offer with a combined quantity. They remain separate
native D&D5e Items, and checkout still identifies each concrete container for safe transfer. Goods
with different mechanical data, prices, or contents are not combined. This needs no inventory rebuild.
The Builder can be closed while work is pending; closing does not cancel an already-approved write,
and completion does not reopen the window. Reopen it to inspect the current merchant state.

## Reset Merchant (alpha.6)

Manage → **Reset Merchant and Clear History** returns the selected Actor to an ordinary NPC.
The confirmation shows the counts of relationships and retained receipts that will be removed.
It permanently deletes this merchant's ledger receipts (including rejections), relationships,
merchant notes, settings, initialization marker and Item offer overrides. It removes shop entry
flags from its scene tokens and prototype token. Canonical Item IDs and source metadata remain.
Biography, portrait, token appearance, ownership, all physical inventory and native cash remain.
Use Empty Stock separately if you also want inventory removed. Shared templates and other
merchants' receipts are unaffected.

An active checkout, Actor recovery flag, unresolved receipt, or another Actor referencing a receipt
blocks reset. Complete recovery first; reset never deletes the evidence needed for recovery.
The operation disables the shop before deleting data. If a deletion fails, it reports partial
completion and keeps the shop disabled; rerun Reset to finish. Already-deleted history cannot be
restored. Existing pack lock state is restored afterward. No new history pack is created by reset.

Live acceptance: test cancellation, a confirmed reset on a disposable merchant, preservation of
another merchant's receipts and refusal while checkout/recovery is active. Check tab switching
preserves unsaved inputs, then reroll cash for an existing merchant and verify the confirmed amount
matches its native wallet. Automated tests simulate these paths; live Foundry/Forge validation
is still required.
