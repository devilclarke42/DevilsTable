import { MODULE_ID } from "../constants.js";
import { comparableItem, stable, transferable } from "./trade-model.js";
import { createReceipt, saveReceipt, trimReceipts } from "./ledger.js";
import { logger } from "../core/logger.js";
const active = new Set();
const clone = value => structuredClone(value);
const inventoryData = item => item?.toObject() ?? null;
function itemState(data) {
  if (!data) return null;
  const copy = clone(data); delete copy._stats; delete copy.sort;
  return copy;
}
function snapshot(actor, step) {
  if (step.kind === "currency") return { ...actor.system.currency };
  if (step.kind === "relationship") return clone(actor.getFlag(MODULE_ID, `merchant.relationships.${step.customer}`) ?? null);
  return itemState(inventoryData(actor.items.get(step.itemId)));
}
function equal(a, b) { return stable(a) === stable(b); }
/** Predict only the native gear property change, on a detached Item with no world writes. */
function createdItemState(actor, data) {
  if (!data) return data;
  const copy = clone(data);
  const item = new CONFIG.Item.documentClass(copy, { parent: actor });
  if (typeof item.system.preCreateGear === "function") {
    item.system.preCreateGear(copy, {}, game.user);
    copy.system.properties = item.toObject().system.properties;
  }
  return copy;
}
function difference(expected, actual, path = "value") {
  if (equal(expected, actual)) return null;
  if (!expected || !actual || typeof expected !== "object" || typeof actual !== "object") {
    return `${path}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`;
  }
  for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
    if (!(key in expected) || !(key in actual)) return `${path}.${key}: field ${key in actual ? "added" : "missing"}`;
    const result = difference(expected[key], actual[key], `${path}.${key}`);
    if (result) return result;
  }
  return path;
}
function verifyStep(actor, step, expected, phase) {
  const actual = snapshot(actor, step);
  if (equal(actual, expected)) return;
  const detail = difference(expected, actual);
  logger.error("Transfer verification mismatch", { actorId: actor.id, kind: step.kind, itemId: step.itemId, phase, detail });
  throw Error(`${phase}: ${step.kind} on ${actor.name}${step.itemId ? ` (Item ${step.itemId})` : ""}; ${detail}`);
}
async function write(actor, step, target) {
  if (step.kind === "currency") return actor.update({ "system.currency": target });
  if (step.kind === "relationship") {
    if (target === null) return actor.unsetFlag(MODULE_ID, `merchant.relationships.${step.customer}`);
    return actor.setFlag(MODULE_ID, `merchant.relationships.${step.customer}`, target);
  }
  const existing = actor.items.get(step.itemId);
  if (!target) { if (existing) await actor.deleteEmbeddedDocuments("Item", [step.itemId]); return; }
  if (!existing) return actor.createEmbeddedDocuments("Item", [clone(target)], { keepId: true });
  return actor.updateEmbeddedDocuments("Item", [{ _id: step.itemId, "system.quantity": target.system.quantity }]);
}
export function makeSteps(merchant, character, quote, now = new Date().toISOString()) {
  const steps = [];
  const virtual = new Map([merchant, character].map(a => [a.id, new Map([...a.items].map(i => [i.id, itemState(i.toObject())]))]));
  for (const actor of [character, merchant]) {
    const after = quote.payment[actor.id === merchant.id ? "merchant" : "character"];
    const before = { ...actor.system.currency };
    if (!equal(before, after)) steps.push({ kind: "currency", actorId: actor.id, before, after });
  }
  for (const row of quote.basket) {
    const source = row.direction === "buy" ? merchant : character;
    const target = source === merchant ? character : merchant;
    const original = source.items.get(row.id);
    if (!original) throw Error("An Item disappeared before approval.");
    transferable(original, source);
    const sourceData = virtual.get(source.id).get(row.id);
    if (!Number.isSafeInteger(sourceData.system.quantity) || sourceData.system.quantity < row.quantity) throw Error("Stock changed before approval.");
    let remaining = clone(sourceData); remaining.system.quantity -= row.quantity;
    // D&D5e containers always have quantity 1; an exhausted container must be deleted.
    // Other merchant goods retain zero-stock offers for future restock.
    if ((source === character || sourceData.type === "container") && remaining.system.quantity === 0) remaining = null;
    steps.push({ kind: "item", actorId: source.id, itemId: row.id, before: clone(sourceData), after: remaining });
    if (remaining) virtual.get(source.id).set(row.id, remaining); else virtual.get(source.id).delete(row.id);
    const data = clone(sourceData);
    for (const key of ["_id", "_stats", "folder", "ownership", "sort"]) delete data[key];
    // A merchant's offer controls must not travel to a customer or change another shop's price.
    if (data.flags?.[MODULE_ID]) delete data.flags[MODULE_ID].offer;
    data.system.quantity = row.quantity;
    // Native NPC gear is removed on characters and added on NPCs during creation.
    Object.assign(data, createdItemState(target, data));
    const canStack = !data.effects?.length && !data.system.uses?.max && data.type !== "container";
    const match = canStack && [...virtual.get(target.id).values()].find(i => equal(comparableItem(i), comparableItem(data)));
    const created = { ...data, _id: foundry.utils.randomID() };
    const after = match ? clone(match) : itemState(new CONFIG.Item.documentClass(created, { parent: target }).toObject());
    if (match) after.system.quantity += row.quantity;
    if (!Number.isSafeInteger(after.system.quantity)) throw Error("Stack quantity is too large.");
    steps.push({ kind: "item", actorId: target.id, itemId: after._id, before: match ? clone(match) : null, after });
    virtual.get(target.id).set(after._id, after);
  }
  const before = clone(merchant.getFlag(MODULE_ID, `merchant.relationships.${character.id}`) ?? null);
  const old = before ?? {};
  const after = { ...old, customerActorId: character.id, state: old.state ?? "Unknown",
    firstMeetingAt: old.firstMeetingAt ?? now, lastVisitAt: now,
    visits: (old.visits ?? 0) + 1, transactionCount: (old.transactionCount ?? 0) + 1,
    successfulPurchases: (old.successfulPurchases ?? 0) + (quote.basket.some(row => row.direction === "buy") ? 1 : 0),
    spentMinor: (old.spentMinor ?? 0) + quote.bought, receivedMinor: (old.receivedMinor ?? 0) + quote.sold };
  for (const key of ["visits", "transactionCount", "successfulPurchases", "spentMinor", "receivedMinor"]) {
    if (!Number.isSafeInteger(after[key])) throw Error("Relationship totals are invalid.");
  }
  steps.push({ kind: "relationship", actorId: merchant.id, customer: character.id, before, after });
  return steps;
}

/** No cross-Actor transaction exists. Persist the plan, verify writes, compensate in reverse. */
export async function executeTrade({ merchant, character, quote, request, receiptAdapter = { create: createReceipt, save: saveReceipt } }) {
  if (!game.user.isGM || (game.users.activeGM && game.users.activeGM.id !== game.user.id)) throw Error("Only the active GM can settle a trade.");
  const actors = [merchant, character];
  if (actors.some(a => active.has(a.id) || a.getFlag(MODULE_ID, "transactionPending"))) throw Error("An Actor has an active trade or needs recovery.");
  actors.forEach(a => active.add(a.id));
  let doc, record;
  try {
    record = { schemaVersion: 1, id: request.id, date: new Date().toISOString(), merchantId: merchant.id,
      characterId: character.id, merchantName: merchant.name, characterName: character.name, userId: request.userId,
      gmId: game.user.id, status: "committing", request: clone(request), quote: clone(quote), steps: makeSteps(merchant, character, quote), attempted: -1 };
    doc = await receiptAdapter.create(record);
    for (const actor of actors) await actor.setFlag(MODULE_ID, "transactionPending", doc.uuid);
    for (let i = 0; i < record.steps.length; i++) {
      const step = record.steps[i], actor = actors.find(a => a.id === step.actorId);
      if (!equal(snapshot(actor, step), step.before)) throw Error("An Actor changed during settlement; trade cancelled.");
      record.attempted = i;
      await receiptAdapter.save(doc, record);
      await write(actor, step, step.after);
      verifyStep(actor, step, step.after, "Transfer read-back failed");
    }
    const finalSteps = new Map(record.steps.map(step => [`${step.actorId}:${step.kind}:${step.itemId ?? step.customer ?? ""}`, step]));
    for (const step of finalSteps.values()) {
      const actor = actors.find(a => a.id === step.actorId);
      verifyStep(actor, step, step.after, "Final transfer verification failed");
    }
    record.status = "completed";
    await receiptAdapter.save(doc, record);
  } catch (error) {
    doc ??= error.receipt;
    if (doc && record) {
      record.error = error.message;
      try {
        await restoreSteps(record, actors);
        record.status = "rolled-back";
        await receiptAdapter.save(doc, record);
      } catch (recoveryError) {
        record.status = "needs-recovery"; record.error += ` Recovery: ${recoveryError.message}`;
        for (const actor of actors) {
          try {
            if (!actor.getFlag(MODULE_ID, "transactionPending")) await actor.setFlag(MODULE_ID, "transactionPending", doc.uuid);
          } catch (markerError) { logger.error("Could not persist recovery block", markerError); }
        }
        try { await receiptAdapter.save(doc, record); } catch (saveError) { logger.error("Recovery receipt unavailable", saveError); }
        throw Error(`Trade needs GM recovery. Actors remain blocked. ${record.error}`);
      }
    }
    throw error;
  } finally {
    if (record && ["completed", "rolled-back"].includes(record.status)) {
      for (const actor of actors) {
        try { await actor.unsetFlag(MODULE_ID, "transactionPending"); }
        catch (error) { logger.error("Transaction marker cleanup failed; use recovery", error); }
      }
    }
    actors.forEach(a => active.delete(a.id));
  }
  try { await trimReceipts(merchant); } catch (error) { logger.warn("History retention deferred", error); }
  return record;
}
async function restoreSteps(record, actors) {
  for (let i = record.attempted; i >= 0; i--) {
    const step = record.steps[i], actor = actors.find(a => a.id === step.actorId);
    const current = snapshot(actor, step);
    // Old receipts predate gear prediction. Accept only that native creation change;
    // quantities, other properties and all other saved data must still match exactly.
    const before = step.kind === "item" && step.after === null ? createdItemState(actor, step.before) : step.before;
    const after = step.kind === "item" && step.before === null ? createdItemState(actor, step.after) : step.after;
    if (equal(current, step.before) || equal(current, before)) continue;
    if (!equal(current, step.after) && !equal(current, after)) throw Error(`Conflicting edit on ${actor.name}; manual reconciliation required. ${difference(after, current)}`);
    await write(actor, step, step.before);
    verifyStep(actor, step, before, "Rollback read-back failed");
  }
}
export async function recoverTrade(actor) {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) throw Error("Only the active GM can recover a trade.");
  const uuid = actor.getFlag(MODULE_ID, "transactionPending");
  if (!uuid) return "No pending recovery.";
  const doc = await fromUuid(uuid);
  const record = clone(doc?.getFlag(MODULE_ID, "transaction"));
  if (!record) throw Error("Recovery receipt is missing; manual reconciliation required.");
  const actors = [game.actors.get(record.merchantId), game.actors.get(record.characterId)];
  if (actors.some(a => !a || active.has(a.id))) throw Error("Actor missing or transaction still running.");
  actors.forEach(a => active.add(a.id));
  try {
    if (!["completed", "rolled-back"].includes(record.status)) {
      await restoreSteps(record, actors); record.status = "rolled-back"; await saveReceipt(doc, record);
    }
    for (const a of actors) await a.unsetFlag(MODULE_ID, "transactionPending");
    return `Recovery checked: ${record.status}.`;
  } finally { actors.forEach(a => active.delete(a.id)); }
}
