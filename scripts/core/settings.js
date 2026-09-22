import { MODULE_ID } from "../constants.js";
import { CompendiumBuilderApplication } from "../apps/compendium-builder-app.js";

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
}
