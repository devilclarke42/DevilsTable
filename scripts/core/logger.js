import { MODULE_ID, MODULE_TITLE } from "../constants.js";

function debugEnabled() {
  try {
    return game.settings.get(MODULE_ID, "debugLogging");
  } catch (_error) {
    return false;
  }
}

function write(method, ...args) {
  console[method](`${MODULE_TITLE} |`, ...args);
}

export const logger = Object.freeze({
  debug: (...args) => debugEnabled() && write("debug", ...args),
  info: (...args) => write("info", ...args),
  warn: (...args) => write("warn", ...args),
  error: (...args) => write("error", ...args)
});
