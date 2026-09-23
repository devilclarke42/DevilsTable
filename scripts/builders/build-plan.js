import { FLAG_SCOPE, MODULE_ID } from "../constants.js";
import { matchesGenerated } from "./generated-fields.js";
export { matchesGenerated } from "./generated-fields.js";

/** Read-only plan. Conflicts abort before any pack unlock or document write. No deletes. */
export function planBuild(documents, existing) {
  const byId = new Map();
  const bySourceId = new Map();
  for (const item of existing) {
    if (byId.has(item._id)) throw new Error(`Duplicate existing document ID: ${item._id}.`);
    byId.set(item._id, item);
    const flags = item.flags?.[FLAG_SCOPE];
    if (flags?.generatedBy !== MODULE_ID) continue;
    if (!flags.sourceId) throw new Error(`Managed item ${item._id} has lost its permanent ID.`);
    if (bySourceId.has(flags.sourceId)) throw new Error(`Duplicate managed permanent ID: ${flags.sourceId}. Resolve it manually before rebuilding.`);
    bySourceId.set(flags.sourceId, item);
  }
  const plan = { create: [], update: [], unchanged: 0, preserved: 0 };
  const wanted = new Set();
  const wantedDocumentIds = new Set();
  for (const item of documents) {
    const sourceId = item.flags[FLAG_SCOPE].sourceId;
    if (wanted.has(sourceId)) throw new Error(`Duplicate input permanent ID: ${sourceId}.`);
    if (wantedDocumentIds.has(item._id)) throw new Error(`Duplicate input document ID: ${item._id}.`);
    wanted.add(sourceId);
    wantedDocumentIds.add(item._id);
    const previous = bySourceId.get(sourceId);
    const occupied = byId.get(item._id);
    if (occupied && occupied !== previous) throw new Error(`Document ID ${item._id} is occupied by another item. Nothing was written.`);
    if (previous) {
      if (previous._id !== item._id) throw new Error(`Permanent document ID drift for ${sourceId}; an explicit migration is required.`);
      if (previous.type !== item.type) throw new Error(`Item type changed for ${sourceId}; an explicit migration is required.`);
      if (matchesGenerated(previous, item)) plan.unchanged++;
      else plan.update.push(item);
    } else plan.create.push(item);
  }
  plan.preserved = existing.filter(item => !wanted.has(item.flags?.[FLAG_SCOPE]?.sourceId) || item.flags?.[FLAG_SCOPE]?.generatedBy !== MODULE_ID).length;
  return plan;
}
