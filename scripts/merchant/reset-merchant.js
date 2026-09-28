import { MODULE_ID, BATCH_SIZE } from "../constants.js";
import { withAdministration, assertAdministrator } from "./operation-guard.js";
import { stable } from "./trade-model.js";
const TERMINAL = new Set(["completed", "rejected", "closed", "rolled-back"]);

async function receiptsFor(actor) {
  const pack = game.packs.get("world.devils-table-transactions");
  if (!pack) return { pack: null, docs: [] };
  if (pack.documentName !== "JournalEntry" || pack.metadata?.packageType !== "world") throw Error("Invalid transaction history pack.");
  const index = await pack.getIndex({ fields: [`flags.${MODULE_ID}.transaction.merchantId`] });
  const docs = [];
  for (const row of index.values()) {
    if (row.flags?.[MODULE_ID]?.transaction?.merchantId !== actor.id) continue;
    const doc = await pack.getDocument(row._id);
    if (doc?.getFlag(MODULE_ID, "transaction")?.merchantId !== actor.id) throw Error("History changed; retry the reset preview.");
    docs.push(doc);
  }
  return { pack, docs };
}
function assertResolved(docs) {
  for (const doc of docs) {
    if (!TERMINAL.has(doc.getFlag(MODULE_ID, "transaction")?.status) ||
        [...game.actors].some(actor => actor.getFlag(MODULE_ID, "transactionPending") === doc.uuid)) {
      throw Error("Resolve interrupted transactions before resetting this merchant. Recovery receipts cannot be deleted.");
    }
  }
}
/** Destructive, explicit GM operation. A partial failure leaves the shop disabled and is retryable. */
export async function resetMerchant(actor, { confirm, readReceipts = receiptsFor,
  deleteReceipts = (pack, ids) => CONFIG.JournalEntry.documentClass.deleteDocuments(ids, { pack: pack.collection }) } = {}) {
  return withAdministration(actor, async () => {
    const { pack, docs } = await readReceipts(actor);
    assertResolved(docs);
    const before = stable(actor.getFlag(MODULE_ID, "merchant"));
    if (!await confirm({ receipts: docs.length, relationships: Object.keys(actor.getFlag(MODULE_ID, "merchant")?.relationships ?? {}).length })) return false;
    assertAdministrator(actor, { allowUnconverted: true });
    if (before !== stable(actor.getFlag(MODULE_ID, "merchant"))) throw Error("Merchant changed during confirmation. Retry reset.");
    const current = await readReceipts(actor);
    assertResolved(current.docs);
    if (stable(current.docs.map(d => d.id).sort()) !== stable(docs.map(d => d.id).sort())) throw Error("Transaction history changed. Retry reset.");
    const locked = pack?.locked;
    try {
      await actor.setFlag(MODULE_ID, "merchant.enabled", false);
      if (actor.getFlag(MODULE_ID, "merchant.enabled") !== false) throw Error("Cannot disable merchant.");
      for (const scene of game.scenes) {
        for (const token of scene.tokens) {
          if (token.actorId !== actor.id || !token.getFlag(MODULE_ID, "merchantEntry")) continue;
          await token.unsetFlag(MODULE_ID, "merchantEntry");
          if (token.getFlag(MODULE_ID, "merchantEntry")) throw Error("Token shop entry could not be removed.");
        }
      }
      if (actor.prototypeToken?.getFlag?.(MODULE_ID, "merchantEntry")) {
        await actor.update({ [`prototypeToken.flags.${MODULE_ID}.-=merchantEntry`]: null });
        if (actor.prototypeToken.getFlag(MODULE_ID, "merchantEntry")) throw Error("Prototype shop entry could not be removed.");
      }
      if (docs.length && locked) await pack.configure({ locked: false });
      for (let offset = 0; offset < docs.length; offset += BATCH_SIZE) {
        assertAdministrator(actor, { allowUnconverted: true });
        const batch = docs.slice(offset, offset + BATCH_SIZE);
        await deleteReceipts(pack, batch.map(d => d.id));
        for (const doc of batch) if (await pack.getDocument(doc.id)) throw Error("Some history receipts were not deleted.");
      }
      for (const item of actor.items) {
        if (item.getFlag(MODULE_ID, "offer") === undefined) continue;
        await item.unsetFlag(MODULE_ID, "offer");
        if (item.getFlag(MODULE_ID, "offer") !== undefined) throw Error("Item offer settings could not be removed.");
      }
      await actor.unsetFlag(MODULE_ID, "merchant");
      if (actor.getFlag(MODULE_ID, "merchant") !== undefined) throw Error("Merchant settings could not be removed.");
      return true;
    } catch (error) {
      const state = actor.getFlag(MODULE_ID, "merchant.enabled") === false ? "The merchant remains disabled; some history may already be deleted. Retry Reset Merchant." : "Merchant disabling failed; no destructive teardown was started.";
      throw Error(`Reset incomplete. ${state} ${error.message}`, { cause: error });
    } finally {
      if (pack && pack.locked !== locked) await pack.configure({ locked });
    }
  }, { allowUnconverted: true });
}
