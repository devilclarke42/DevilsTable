import { BATCH_SIZE, PACK_COLLECTION } from "../constants.js";
import { loadCatalogue } from "../data/catalogue-loader.js";
import { validateCatalogue } from "../validation/catalogue-validator.js";
import { catalogueEntryToItem } from "./item-factory.js";
import { planBuild } from "./build-plan.js";
import { createFoundryAdapter } from "./foundry-adapter.js";

/** One service instance is shared by the UI and public API, preventing local overlap. */
export function createBuilder({ load = loadCatalogue, adapter = null, now = () => new Date().toISOString() } = {}) {
  let busy = false;
  return async function rebuild({ dryRun = true, onProgress = () => {} } = {}) {
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
      io = adapter ?? createFoundryAdapter();
      io.assertCanBuild();
      progress("Loading and validating source JSON…");
      const catalogue = await load();
      const validation = validateCatalogue(catalogue);
      if (!validation.valid) {
        const error = new Error(`Validation failed (${validation.errors.length} errors). No changes were made.`);
        error.details = validation.errors;
        throw error;
      }
      const documents = catalogue.entries.map(({ item }) => catalogueEntryToItem(item));
      progress(`Preflighting ${documents.length} D&D5e documents…`);
      await io.validateDocuments(documents);
      pack = await io.getPack();
      const existing = pack ? await io.readPack(pack) : [];
      const plan = planBuild(documents, existing);
      summary = {
        status: dryRun ? "preview" : "complete", at: now(), pack: PACK_COLLECTION,
        count: documents.length, create: plan.create.length, update: plan.update.length,
        unchanged: plan.unchanged, preserved: plan.preserved, written: 0, warnings: validation.warnings
      };
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
      const verification = planBuild(documents, actual);
      if (verification.create.length || verification.update.length) throw new Error("Read-back verification failed; some generated fields do not match the source.");
      progress("Build verified.");
      return summary;
    } catch (error) {
      failure = error;
      if (summary && !dryRun) {
        error.message += " The build may be partial; no items were deleted. Correct the error and rerun to converge.";
        summary.status = "failed";
        summary.error = error.message;
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
        throw new AggregateError(causes, causes.map(error => error.message).join("\n"));
      }
    }
  };
}

export const rebuildCompendiums = createBuilder();
