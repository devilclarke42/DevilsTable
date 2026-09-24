import { MODULE_ID, TABLE_PACK_COLLECTION } from "../constants.js";
import { loadStockCatalogue } from "../data/stock-loader.js";
import { shopView } from "../data/shop-catalogue.js";
import { stockScopes } from "../data/stock-catalogue.js";
import { requireValidStock, rebuildStockTables } from "../builders/roll-table-builder.js";
import { rollStockList } from "../stock/stock-roller.js";
import { cleanupLegacyStockTables } from "../builders/legacy-table-cleanup.js";
import { escapeHtml } from "../builders/item-factory.js";
import { logger } from "../core/logger.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Separate settings menu and window; the Item builder never implicitly writes RollTables. */
export class RollTableBuilderApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #busy = false;
  #scope = { shopId: "general-store", categoryId: null };
  #report = "Build the Item compendium first. Preview the stock tables before building.";
  #data = null;

  static DEFAULT_OPTIONS = {
    id: "devils-table-stock-builder", classes: ["devils-table"], tag: "section",
    position: { width: 760, height: "auto" },
    window: { title: "Devil's Table — Stock RollTable Builder", icon: "fa-solid fa-dice", resizable: true },
    actions: { selectShop: RollTableBuilderApplication.#selectShop, selectCategory: RollTableBuilderApplication.#selectCategory,
      preview: RollTableBuilderApplication.#preview, build: RollTableBuilderApplication.#build, rollStock: RollTableBuilderApplication.#rollStock,
      cleanup: RollTableBuilderApplication.#cleanup }
  };
  static PARTS = { body: { template: "modules/devils-table/templates/roll-table-builder.hbs", scrollable: [".dt-report"] } };

  async _prepareContext(options) {
    let view = {};
    let catalogueError = "";
    try {
      if (!this.#data) { this.#data = await loadStockCatalogue(); requireValidStock(this.#data); }
      view = shopView(this.#data, this.#scope);
      const scopes = stockScopes(this.#data, this.#scope);
      view.tableCount = scopes.length * 4;
      view.setCount = scopes.length;
      view.oftenChance = this.#data.stock.oftenChance;
      view.rarelyChance = this.#data.stock.rarelyChance;
      view.noneChance = 100 - view.oftenChance - view.rarelyChance;
      view.profiles = this.#data.stock.profiles.filter(profile => !this.#scope.shopId || profile.shop === this.#scope.shopId).map(profile => ({
        name: this.#data.shopDefinitions.find(shop => shop.id === profile.shop).name,
        draws: this.#scope.categoryId ? profile.categoryDraws : profile.draws, partial: profile.coverage === "partial"
      }));
    } catch (error) { this.#data = null; catalogueError = error.message; }
    return { ...await super._prepareContext(options), ...view, catalogueError, busy: this.#busy,
      blocked: this.#busy || Boolean(catalogueError), rollBlocked: this.#busy || Boolean(catalogueError) || !this.#scope.shopId,
      report: this.#report, lastBuild: game.settings.get(MODULE_ID, "lastTableBuildSummary") || "No table builds recorded.",
      lastCleanup: game.settings.get(MODULE_ID, "lastTableCleanupSummary") || "No legacy cleanup recorded." };
  }

  static async #selectShop(_event, target) {
    if (this.#busy) return;
    this.#scope = { shopId: target.dataset.shop || null, categoryId: null };
    this.#report = "Selection changed. Preview the selected stock tables.";
    await this.render();
  }
  static async #selectCategory(_event, target) {
    if (this.#busy) return;
    this.#scope.categoryId = target.dataset.category || null;
    this.#report = "Selection changed. Preview the selected stock tables.";
    await this.render();
  }
  static async #preview() { await this.#run("preview"); }
  static async #build() { await this.#run("build"); }
  static async #rollStock() { await this.#run("stock"); }
  static async #cleanup() { await this.#run("cleanup"); }

  async #run(mode) {
    if (this.#busy || !game.user.isGM) return;
    this.#busy = true;
    const scope = { ...this.#scope };
    try {
      await this.render();
      if (mode === "build") {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
          window: { title: "Build stock RollTables?" },
          content: `<p>Selection: ${escapeHtml(scope.shopId ?? "all shops")} / ${escapeHtml(scope.categoryId ?? "all categories")}.</p><p>This writes generated tables to <strong>${TABLE_PACK_COLLECTION}</strong> and refreshes their owned result rows, including removing obsolete generated rows. Existing Items, unrelated tables and actor inventories are unaffected. Keep custom table results in separate tables.</p>`
        });
        if (!confirmed) return;
      }
      if (mode === "cleanup") {
        const preview = await cleanupLegacyStockTables(scope);
        this.#report = [`Legacy cleanup preview — ${preview.removable.length} removable; ${preview.preserved.length} protected.`,
          ...preview.removable.map(table => `REMOVE: ${table.name}`),
          ...preview.preserved.map(table => `KEEP: ${table.name} — ${table.reason}`), ...preview.warnings].join("\n");
        await this.render();
        if (!preview.removable.length) return;
        const confirmed = await foundry.applications.api.DialogV2.confirm({
          window: { title: "Remove superseded category tables?" },
          content: `<p>Remove the ${preview.removable.length} legacy category tables listed in the builder report? The current shop tables and Items are kept. This cannot be undone by a normal rebuild.</p><p>Check saved journal, macro and other-compendium links before continuing. Keep a world backup.</p>`
        });
        if (!confirmed) return;
        const result = await cleanupLegacyStockTables({ ...scope, dryRun: false, approvedIds: preview.removable.map(table => table.id) });
        this.#report = `Legacy cleanup complete — ${result.deleted} removed; ${result.preserved.length} protected.\n${result.warnings.join("\n")}`;
      } else if (mode === "stock") {
        const stock = await rollStockList(scope);
        this.#report = [
          `Stock list — ${stock.items.length} distinct goods; ${stock.outcomes.length} rotating attempts.`,
          "Quantities count complete sale units. These are stock suggestions; no inventory or chat was changed.",
          ...stock.items.map(item => `${item.tier.toUpperCase()}: ${item.quantity} × ${item.name} — ${item.price.value} ${item.price.denomination} each (${item.saleUnit})`)
        ].join("\n");
      } else {
        const result = await rebuildStockTables({ ...scope, dryRun: mode === "preview", onProgress: message => {
          this.#report = message;
          const node = this.element?.querySelector(".dt-report");
          if (node) node.textContent = message;
        } });
        this.#report = [
          `${mode === "preview" ? "Preview" : "Build"} complete — ${result.count} RollTables.`,
          `Create: ${result.create}; update: ${result.update}; unchanged: ${result.unchanged}; preserved: ${result.preserved}.`,
          `Target: ${result.pack}`, ...result.warnings
        ].join("\n");
      }
      logger.info(this.#report);
    } catch (error) {
      this.#report = [error.message, ...(error.details ?? []).map(entry => `${entry.path}: ${entry.message}`)].join("\n");
      logger.error("Stock table operation failed", error);
      ui.notifications.error("Devil's Table: see the stock table builder report.");
    } finally { this.#busy = false; this.#data = null; await this.render(); }
  }
}
