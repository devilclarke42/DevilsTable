import { MODULE_ID } from "../constants.js";
import { CompendiumBuilderApplication } from "../apps/compendium-builder-app.js";
import { RollTableBuilderApplication } from "../apps/roll-table-builder-app.js";

export function registerSettings() {
  game.settings.register(MODULE_ID, "debugLogging", {
    name: "Enable debug logging",
    hint: "Write detailed Devil's Table diagnostics to the browser console.",
    scope: "client",
    config: true,
    type: new foundry.data.fields.BooleanField(),
    default: false
  });

  game.settings.register(MODULE_ID, "lastBuildSummary", {
    name: "Last build summary",
    scope: "world",
    config: false,
    type: new foundry.data.fields.StringField(),
    default: ""
  });

  game.settings.registerMenu(MODULE_ID, "compendiumBuilder", {
    name: "Build/Rebuild Compendiums",
    label: "Open Builder",
    hint: "Validate the canonical JSON catalogue and rebuild generated world compendiums.",
    icon: "fa-solid fa-hammer",
    type: CompendiumBuilderApplication,
    restricted: true
  });

  game.settings.register(MODULE_ID, "lastTableBuildSummary", {
    name: "Last stock table build summary", scope: "world", config: false,
    type: new foundry.data.fields.StringField(), default: ""
  });
  game.settings.registerMenu(MODULE_ID, "stockTableBuilder", {
    name: "Build/Rebuild Stock RollTables", label: "Open RollTable Builder",
    hint: "Generate four tables per shop; roll stock and weighted quantities with optional category filters.",
    icon: "fa-solid fa-dice", type: RollTableBuilderApplication, restricted: true
  });
  game.settings.register(MODULE_ID, "lastTableCleanupSummary", {
    name: "Last legacy table cleanup", scope: "world", config: false,
    type: new foundry.data.fields.StringField(), default: ""
  });
}
