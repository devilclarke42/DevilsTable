import { registerServiceProvider, initialiseServices } from "./services/registry.js";
import { registerInitialStockHooks } from "./merchant/initial-stock-hooks.js";
import { applyCompendiumNames } from "./core/compendium-names.js";
import { registerCatalogueProvider, initialiseCatalogues } from "./catalogues/extensions.js";
import { catalogueRegistry } from "./catalogues/registry.js";
import { MODULE_ID } from "./constants.js";
import { registerSettings } from "./core/settings.js";
import { logger } from "./core/logger.js";
import { loadCatalogue, readModuleJson } from "./data/catalogue-loader.js";
import { validateCatalogue } from "./validation/catalogue-validator.js";
import { rebuildCompendiums } from "./builders/compendium-builder.js";
import { CompendiumBuilderApplication } from "./apps/compendium-builder-app.js";
import { RollTableBuilderApplication } from "./apps/roll-table-builder-app.js";
import { rebuildStockTables } from "./builders/roll-table-builder.js";
import { rollStockList } from "./stock/stock-roller.js";
import { cleanupLegacyStockTables } from "./builders/legacy-table-cleanup.js";
import { MerchantBuilderApplication } from "./merchant/builder/app.js";
import { enableMerchant, initialiseMerchantService, registerCheckoutProof } from "./merchant/service.js";
import { openMerchantShop, registerMerchantTokenEntry } from "./merchant/token-entry.js";

Hooks.once("init", () => {
  registerSettings();
  registerCheckoutProof();
  registerInitialStockHooks();
  game.modules.get(MODULE_ID).api = Object.freeze({
    registerCatalogueProvider,
    registerServiceProvider,
    catalogues: () => catalogueRegistry.list(),
    loadCatalogue,
    validateCatalogue,
    rebuildCompendiums,
    rebuildStockTables,
    cleanupLegacyStockTables,
    enableMerchant,
    openMerchantShop,
    openMerchantManager: () => {
      if (!game.user.isGM) throw new Error("Only a GM can set up merchants.");
      return new MerchantBuilderApplication().render({ force: true });
    },
    openMerchantBuilder: (options = {}) => {
      if (!game.user.isGM) throw new Error("Only a GM can open the Merchant Builder.");
      return new MerchantBuilderApplication(options).render({ force: true });
    },
    rollStock: rollStockList,
    openStockBuilder: () => {
      if (!game.user.isGM) throw new Error("Only a GM can open the stock table builder.");
      return new RollTableBuilderApplication().render({ force: true });
    },
    openBuilder: () => {
      if (!game.user.isGM) throw new Error("Only a GM can open the builder.");
      return new CompendiumBuilderApplication().render({ force: true });
    }
  });
  logger.info("Framework initialised.");
});

Hooks.once("ready", async () => {
  try {
    await initialiseCatalogues(readModuleJson);
    await initialiseServices(readModuleJson);
  } catch (error) {
    logger.error("Catalogue startup failed", error);
    ui.notifications.error("Devil’s Table catalogue validation failed. Check the GM console; merchant browsing is unavailable.");
    return;
  }
  applyCompendiumNames();
  Hooks.on("createCompendium", applyCompendiumNames);
  initialiseMerchantService();
  registerMerchantTokenEntry();
  if (game.user.isGM) logger.debug("GM builder API is ready.");
});
