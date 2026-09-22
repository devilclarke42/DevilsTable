import { MODULE_ID } from "../constants.js";
import { rebuildCompendiums } from "../builders/compendium-builder.js";
import { logger } from "../core/logger.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** GM-only ApplicationV2. Preview is read-only; Build explicitly confirms owned-field updates. */
export class CompendiumBuilderApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #busy = false;
  #report = "Preview the catalogue to validate all JSON and see the proposed changes.";

  static DEFAULT_OPTIONS = {
    id: "devils-table-builder",
    classes: ["devils-table"],
    tag: "section",
    position: { width: 640, height: "auto" },
    window: { title: "Devil's Table — Compendium Builder", icon: "fa-solid fa-hammer", resizable: true },
    actions: {
      preview: CompendiumBuilderApplication.#onPreview,
      build: CompendiumBuilderApplication.#onBuild
    }
  };

  static PARTS = { body: { template: "modules/devils-table/templates/compendium-builder.hbs", scrollable: [".dt-report"] } };

  async _prepareContext(options) {
    return {
      ...await super._prepareContext(options),
      busy: this.#busy,
      report: this.#report,
      lastBuild: game.settings.get(MODULE_ID, "lastBuildSummary") || "No builds recorded."
    };
  }

  static async #onPreview() { await this.#run(true); }

  static async #onBuild() {
    if (this.#busy) return;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Build Devil's Table compendium?" },
      content: "<p>This updates builder-owned fields from source JSON in <strong>world.devils-table-items</strong>. Manual edits to generated fields will be overwritten. No documents will be deleted. Actor and world inventory copies are unaffected.</p><p>Use only one builder tab. Back up your world before updating content.</p>"
    });
    if (confirmed) await this.#run(false);
  }

  async #run(dryRun) {
    if (this.#busy || !game.user.isGM) return;
    this.#busy = true;
    this.#report = "Starting…";
    try {
      await this.render();
      const result = await rebuildCompendiums({ dryRun, onProgress: message => {
        this.#report = message;
        const node = this.element?.querySelector(".dt-report");
        if (node) node.textContent = message;
      } });
      this.#report = [
        `${dryRun ? "Preview" : "Build"} complete — ${result.count} source items.`,
        `${dryRun ? "Would create" : "Created"}: ${result.create}; ${dryRun ? "would update" : "updated"}: ${result.update}.`,
        `Unchanged: ${result.unchanged}; existing entries preserved: ${result.preserved}.`,
        `Target: ${result.pack}`,
        ...result.warnings
      ].join("\n");
      logger.info(this.#report);
      ui.notifications.info(`Devil's Table: ${dryRun ? "preview" : "build"} complete.`);
    } catch (error) {
      this.#report = [error.message, ...(error.details ?? []).map(e => `${e.path}: ${e.message}`)].join("\n");
      logger.error("Builder failed", error);
      ui.notifications.error("Devil's Table: operation failed. See the builder report.");
    } finally {
      this.#busy = false;
      await this.render();
    }
  }
}
