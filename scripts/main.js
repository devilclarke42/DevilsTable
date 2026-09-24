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

Hooks.once("init", () => {
  registerSettings();
  game.modules.get(MODULE_ID).api = Object.freeze({
    loadCatalogue,
    validateCatalogue,
    rebuildCompendiums,
    rebuildStockTables,
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
  if (game.user.isGM) logger.debug("GM builder API is ready.");
});
