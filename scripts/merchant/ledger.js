import { formatCopper } from "./currency.js";
import { MODULE_ID } from "../constants.js";
import { stable } from "./trade-model.js";
import { RETENTION } from "./model.js";
const COLLECTION = "world.devils-table-transactions";
let opening;
export async function transactionPack() {
  if (!game.user.isGM) throw Error("Only a GM can access transaction history.");
  if (opening) return opening;
  opening = (async () => {
    let pack = game.packs.get(COLLECTION);
    if (!pack) pack = await foundry.documents.collections.CompendiumCollection.createCompendium({
      name: "devils-table-transactions", label: "Devil's Table — Private Transactions", type: "JournalEntry", package: "world"
    });
    if (pack.documentName !== "JournalEntry" || pack.metadata.packageType !== "world") throw Error("Invalid transaction ledger pack.");
    await pack.configure({ locked: false, ownership: { PLAYER: "NONE", TRUSTED: "NONE", ASSISTANT: "OWNER", GAMEMASTER: "OWNER" } });
    for (const user of game.users) {
      if (!user.isGM && pack.testUserPermission(user, "LIMITED")) throw Error("Transaction ledger is visible to players; fix pack ownership before trading.");
    }
    return pack;
  })();
  try { return await opening; } finally { opening = null; }
}
const escape = text => String(text).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
function page(record) {
  const lines = record.quote?.basket ?? [];
  return `<h2>${escape(record.status)}</h2><p>${escape(record.date)} · ${escape(record.characterName)} · ${escape(record.merchantName)}</p>`
    + `<ul>${lines.map(row => `<li>${escape(row.direction)}: ${row.quantity} × ${escape(row.name)} — ${escape(formatCopper(row.copper))} each</li>`).join("")}</ul>`
    + `<p>${record.quote?.total < 0 ? "Character receives" : "Character pays"}: ${escape(formatCopper(Math.abs(record.quote?.total ?? 0)))}</p>`
    + `<p>${escape(record.error ?? record.status)}</p>`;
}
const serializable = value => value === undefined ? null : JSON.parse(JSON.stringify(value));
function mismatch(expected, actual, path = "transaction") {
  if (stable(expected) === stable(actual)) return null;
  if (!expected || !actual || typeof expected !== "object" || typeof actual !== "object") return path;
  for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
    if (!(key in expected) || !(key in actual)) return `${path}.${key}`;
    const difference = mismatch(expected[key], actual[key], `${path}.${key}`);
    if (difference) return difference;
  }
  return path;
}
function verifyReceipt(doc, record) {
  const difference = mismatch(serializable(record), serializable(doc?.getFlag(MODULE_ID, "transaction")));
  if (difference) {
    const error = Error(`Receipt read-back failed at ${difference} (stage ${record.status}, step ${record.attempted ?? "none"}).`);
    // A saved document must remain reachable even when verification fails before returning it.
    if (doc) error.receipt = doc;
    throw error;
  }
}
async function receiptId(requestId) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(requestId));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
export async function findReceipt(requestId) {
  const pack = await transactionPack();
  const id = await receiptId(requestId);
  await pack.getIndex();
  if (!pack.index.has(id)) return null;
  const doc = await pack.getDocument(id);
  if (doc?.getFlag(MODULE_ID, "transaction")?.id !== requestId) throw Error("Receipt identity mismatch; GM reconciliation required.");
  return doc;
}
export async function createReceipt(record) {
  const pack = await transactionPack();
  const id = await receiptId(record.id);
  await pack.getIndex();
  if (pack.index.has(id)) {
    const existing = await pack.getDocument(id);
    const old = existing.getFlag(MODULE_ID, "transaction");
    if (old?.id !== record.id || old.status !== "rolled-back") throw Error("This checkout already has a receipt. Close it and submit a new checkout, or recover the interrupted trade.");
    record.previousOutcome = { status: old.status, error: old.error ?? null, date: old.date };
    record.error = null;
    await saveReceipt(existing, record);
    return existing;
  }
  const doc = await CONFIG.JournalEntry.documentClass.create({ _id: id, name: `${record.date} — ${record.merchantName} — ${record.characterName} — ${record.status}`,
    ownership: { default: 0 }, flags: { [MODULE_ID]: { transaction: serializable(record) } },
    pages: [{ name: "Trade receipt", type: "text", text: { content: page(record), format: 1 } }]
  }, { pack: pack.collection, keepId: true });
  verifyReceipt(doc, record);
  return doc;
}
export async function saveReceipt(doc, record) {
  await doc.update({ [`flags.${MODULE_ID}.transaction`]: serializable(record),
    name: `${record.date} — ${record.merchantName} — ${record.characterName} — ${record.status}` });
  verifyReceipt(doc, record);
  if (record.status === "committing") return;
  const first = doc.pages.contents?.[0] ?? [...doc.pages][0];
  if (first) await doc.updateEmbeddedDocuments("JournalEntryPage", [{ _id: first.id, "text.content": page(record) }]);
}
export async function trimReceipts(merchant) {
  const policy = merchant.getFlag(MODULE_ID, "merchant")?.historyRetention ?? game.settings.get(MODULE_ID, "merchantHistoryRetention");
  const limit = RETENTION[policy] ?? 500;
  if (limit === Infinity) return;
  const pack = await transactionPack();
  const index = await pack.getIndex({ fields: [`flags.${MODULE_ID}.transaction.merchantId`, `flags.${MODULE_ID}.transaction.status`, `flags.${MODULE_ID}.transaction.date`] });
  const rows = [...index].filter(row => {
    const record = row.flags?.[MODULE_ID]?.transaction;
    return record?.merchantId === merchant.id && ["completed", "rejected", "rolled-back", "closed"].includes(record.status);
  }).sort((a, b) => b.flags[MODULE_ID].transaction.date.localeCompare(a.flags[MODULE_ID].transaction.date));
  if (rows.length > limit) await CONFIG.JournalEntry.documentClass.deleteDocuments(rows.slice(limit).map(row => row._id), { pack: pack.collection });
}

/** Dismissing a review is not a second transaction and must not replay or erase its receipt. */
export async function finishReceiptReview(record, actors) {
  const doc = await findReceipt(record.id);
  if (!doc) { await createReceipt(record); return record.status === "closed" ? "close" : "rejected"; }
  const old = serializable(doc.getFlag(MODULE_ID, "transaction"));
  if (old.merchantId !== record.merchantId || old.characterId !== record.characterId) throw Error("Receipt Actor mismatch.");
  if (old.status === "completed") return "approved";
  if (["rejected", "closed"].includes(old.status)) return old.status === "closed" ? "close" : "rejected";
  const safeToCancel = old.status === "rolled-back" || (old.status === "committing" && old.attempted === -1);
  if (safeToCancel) {
    await saveReceipt(doc, { ...old, status: record.status, reviewDecision: record.status, reviewDate: record.date });
    for (const actor of actors) {
      if (actor.getFlag(MODULE_ID, "transactionPending") === doc.uuid) await actor.unsetFlag(MODULE_ID, "transactionPending");
    }
    return record.status === "closed" ? "close" : "rejected";
  }
  // Retain the original recovery plan and block both Actors, including legacy orphan receipts.
  for (const actor of actors) {
    const pending = actor.getFlag(MODULE_ID, "transactionPending");
    if (pending && pending !== doc.uuid) throw Error("Actor has a different pending recovery; reconcile the receipts first.");
  }
  for (const actor of actors) await actor.setFlag(MODULE_ID, "transactionPending", doc.uuid);
  await saveReceipt(doc, { ...old, reviewDecision: record.status, reviewDate: record.date });
  ui.notifications.info("Review closed. This trade still needs recovery in Merchant Setup; its receipt and Actor blocks were preserved.");
  return "close";
}
