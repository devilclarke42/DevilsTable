import { BATCH_SIZE, PACK_COLLECTION } from "../constants.js";
import { loadCatalogue } from "../data/catalogue-loader.js";
import { selectEntries } from "../data/shop-catalogue.js";
import { validateCatalogue } from "../validation/catalogue-validator.js";
import { catalogueEntryToItem } from "./item-factory.js";
import { planBuild } from "./build-plan.js";
import { createFoundryAdapter } from "./foundry-adapter.js";
import { readBackError } from "./generated-fields.js";

/** One service instance is shared by the UI and public API, preventing local overlap. */
export function createBuilder({ load = loadCatalogue, adapter = null, now = () => new Date().toISOString(),
  prepare = null, collection = PACK_COLLECTION, planner = planBuild, verificationError = readBackError,
  adapterFactory = createFoundryAdapter } = {}) {
  let busy = false;
  return async function rebuild({ dryRun = true, onProgress = () => {}, shopId = null, categoryId = null } = {}) {
    if (busy) throw new Error("A Devil's Table build is already running in this client.");
    busy = true;
    // Progress observers must not be able to interrupt persistence or lock restoration.
    const progress = message => { try { onProgress(message); } catch { /* UI may have closed. */ } };
    let pack;
    let originalLock;
    let restoreLock = false;
    let summary;
    let failure;
    let io;
    try {
      io = adapter ?? adapterFactory();
      io.assertCanBuild();
      progress("Loading and validating source JSON…");
      const catalogue = await load();
      const validation = validateCatalogue(catalogue);
      if (!validation.valid) {
        const error = new Error(`Validation failed (${validation.errors.length} errors). No changes were made.`);
        error.details = validation.errors;
        throw error;
      }
      const prepared = prepare ? await prepare(catalogue, { shopId, categoryId }) : null;
      const documents = prepared?.documents ?? selectEntries(catalogue, { shopId, categoryId }).map(({ item }) => catalogueEntryToItem(item));
      progress(`Preflighting ${documents.length} documents…`);
      await io.validateDocuments(documents);
      pack = await io.getPack();
      const existing = pack ? await io.readPack(pack) : [];
      const plan = planner(documents, existing);
      summary = {
        status: dryRun ? "preview" : "complete", at: now(), pack: collection, scope: { shopId, categoryId },
        count: documents.length, create: plan.create.length, update: plan.update.length,
        unchanged: plan.unchanged, preserved: plan.preserved, written: 0, warnings: [...validation.warnings, ...(prepared?.warnings ?? [])]
      };
      if (!documents.length && catalogue.entries.length) summary.warnings = [...summary.warnings, "No authored items match this selection. Planned names and Merchant Notes do not create items."];
      if (dryRun || (!plan.create.length && !plan.update.length)) return summary;

      io.assertCanBuild();
      if (!pack) {
        pack = await io.createPack();
        originalLock = true;
        restoreLock = true;
      } else originalLock = pack.locked;
      // Lock new generated packs; restore the original configuration of existing packs.
      if (pack.locked) {
        restoreLock = true;
        await io.configure(pack, false);
      }
      for (const [action, data] of [["create", plan.create], ["update", plan.update]]) {
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
          io.assertCanBuild();
          const batch = data.slice(i, i + BATCH_SIZE);
          progress(`${action === "create" ? "Creating" : "Updating"} ${i + 1}–${Math.min(i + BATCH_SIZE, data.length)} of ${data.length}…`);
          const written = await io[action](pack, batch);
          if (written.length !== batch.length) throw new Error("A Foundry hook prevented one or more document writes.");
          summary.written += written.length;
        }
      }
      const actual = await io.readPack(pack);
      const verification = planner(documents, actual);
      if (verification.create.length || verification.update.length) {
        throw verificationError([...verification.create, ...verification.update], actual);
      }
      progress("Build verified.");
      return summary;
    } catch (error) {
      failure = error;
      if (summary && !dryRun) {
        error.message += " The build may be partial; no items were deleted. Correct the error and rerun to converge.";
        summary.status = "failed";
        summary.error = error.message;
        if (error.details) summary.details = error.details;
      }
      throw error;
    } finally {
      const cleanupErrors = [];
      try {
        if (pack && restoreLock) {
          try { await io.configure(pack, originalLock); }
          catch (error) {
            cleanupErrors.push(new Error(`Could not restore the pack lock: ${error.message}. Check and restore it manually.`, { cause: error }));
          }
        }
        if (summary && !dryRun) {
          if (cleanupErrors.length) {
            summary.status = "failed";
            summary.error = [failure?.message, ...cleanupErrors.map(error => error.message)].filter(Boolean).join("\n");
          }
          try { await io.saveSummary(summary); }
          catch (error) { cleanupErrors.push(new Error(`Could not save the build record: ${error.message}.`, { cause: error })); }
        }
      } finally { busy = false; }
      if (cleanupErrors.length) {
        const causes = [failure, ...cleanupErrors].filter(Boolean);
        const error = new AggregateError(causes, causes.map(error => error.message).join("\n"));
        if (failure?.details) error.details = failure.details;
        throw error;
      }
    }
  };
}

export const rebuildCompendiums = createBuilder();
