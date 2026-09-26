import { MODULE_ID } from "./constants.js";
import { registerSettings } from "./core/settings.js";
import { logger } from "./core/logger.js";
import { loadCatalogue } from "./data/catalogue-loader.js";
import { validateCatalogue } from "./validation/catalogue-validator.js";
import { rebuildCompendiums } from "./builders/compendium-builder.js";
import { CompendiumBuilderApplication } from "./apps/compendium-builder-app.js";
import { RollTableBuilderApplication } from "./apps/roll-table-builder-app.js";
import { rebuildStockTables } from "./builders/roll-table-builder.js";
import { rollStockList } from "./stock/stock-roller.js";
import { cleanupLegacyStockTables } from "./builders/legacy-table-cleanup.js";
import { MerchantManagerApplication } from "./merchant/manager-app.js";
import { enableMerchant, initialiseMerchantService } from "./merchant/service.js";
import { openMerchantShop, registerMerchantTokenEntry } from "./merchant/token-entry.js";

Hooks.once("init", () => {
  registerSettings();
  game.modules.get(MODULE_ID).api = Object.freeze({
    loadCatalogue,
    validateCatalogue,
    rebuildCompendiums,
    rebuildStockTables,
    cleanupLegacyStockTables,
    enableMerchant,
    openMerchantShop,
    openMerchantManager: () => {
      if (!game.user.isGM) throw new Error("Only a GM can set up merchants.");
      return new MerchantManagerApplication().render({ force: true });
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

Hooks.once("ready", () => {
  initialiseMerchantService();
  registerMerchantTokenEntry();
  if (game.user.isGM) logger.debug("GM builder API is ready.");
});
