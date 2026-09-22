import { MODULE_ID } from "../constants.js";
import { rebuildCompendiums } from "../builders/compendium-builder.js";
import { logger } from "../core/logger.js";
import { loadCatalogue } from "../data/catalogue-loader.js";
import { validateCatalogue } from "../validation/catalogue-validator.js";
import { shopView } from "../data/shop-catalogue.js";
import { escapeHtml } from "../builders/item-factory.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** GM-only ApplicationV2. Preview is read-only; Build explicitly confirms owned-field updates. */
export class CompendiumBuilderApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #busy = false;
  #report = "Preview the catalogue to validate all JSON and see the proposed changes.";
  #catalogue = null;
  #scope = { shopId: "general-store", categoryId: null };

  static DEFAULT_OPTIONS = {
    id: "devils-table-builder",
    classes: ["devils-table"],
    tag: "section",
    position: { width: 760, height: "auto" },
    window: { title: "Devil's Table — Compendium Builder", icon: "fa-solid fa-hammer", resizable: true },
    actions: {
      preview: CompendiumBuilderApplication.#onPreview,
      build: CompendiumBuilderApplication.#onBuild,
      selectShop: CompendiumBuilderApplication.#onSelectShop,
      selectCategory: CompendiumBuilderApplication.#onSelectCategory
    }
  };

  static PARTS = { body: { template: "modules/devils-table/templates/compendium-builder.hbs", scrollable: [".dt-report"] } };

  async _prepareContext(options) {
    let view = {};
    let catalogueError = "";
    try {
      if (!this.#catalogue) {
        const data = await loadCatalogue();
        const validation = validateCatalogue(data);
        if (!validation.valid) throw new Error(validation.errors.map(error => `${error.path}: ${error.message}`).join("\n"));
        this.#catalogue = data;
      }
      view = shopView(this.#catalogue, this.#scope);
    } catch (error) { catalogueError = error.message; }
    return {
      ...await super._prepareContext(options),
      ...view,
      catalogueError,
      blocked: this.#busy || Boolean(catalogueError),
      busy: this.#busy,
      report: this.#report,
      lastBuild: game.settings.get(MODULE_ID, "lastBuildSummary") || "No builds recorded."
    };
  }

  static async #onPreview() { await this.#run(true); }

  static async #onSelectShop(_event, target) {
    if (this.#busy) return;
    this.#scope = { shopId: target.dataset.shop || null, categoryId: null };
    this.#report = "Selection changed. Preview to see the proposed changes for this selection.";
    await this.render();
  }

  static async #onSelectCategory(_event, target) {
    if (this.#busy) return;
    this.#scope = { ...this.#scope, categoryId: target.dataset.category || null };
    this.#report = "Selection changed. Preview to see the proposed changes for this selection.";
    await this.render();
  }

  static async #onBuild() {
    if (this.#busy || !this.#catalogue) return;
    const scope = { ...this.#scope };
    const label = escapeHtml(shopView(this.#catalogue, scope).scopeLabel);
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Build Devil's Table compendium?" },
      content: `<p>Selection: <strong>${label}</strong>.</p><p>This updates builder-owned fields from source JSON in <strong>world.devils-table-items</strong>. Manual edits to generated fields will be overwritten. No documents will be deleted. Actor and world inventory copies are unaffected.</p><p>Use only one builder tab. Back up your world before updating content.</p>`
    });
    if (confirmed) await this.#run(false, scope);
  }

  async #run(dryRun, scope = { ...this.#scope }) {
    if (this.#busy || !game.user.isGM) return;
    this.#busy = true;
    this.#report = "Starting…";
    this.#scope = scope;
    this.#catalogue = null; // Refresh displayed source counts and notes for each operation.
    try {
      await this.render();
      const result = await rebuildCompendiums({ dryRun, ...scope, onProgress: message => {
        this.#report = message;
        const node = this.element?.querySelector(".dt-report");
        if (node) node.textContent = message;
      } });
      this.#report = [
        `${dryRun ? "Preview" : "Build"} complete — ${result.count} selected source items.`,
        `Selection: ${scope.shopId ?? "all shops"} / ${scope.categoryId ?? "all categories"}.`,
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
