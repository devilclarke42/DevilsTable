import { FLAG_SCOPE, MODULE_ID } from "../constants.js";
import { documentIdFor } from "./document-id.js";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function escapeHtml(text) { return text.replace(/[&<>"']/g, char => ESCAPES[char]); }

/** Pure, deterministic converter. Never reads world settings or mutates source JSON. */
export function catalogueEntryToItem(entry) {
  if (entry.mechanics.type !== "loot") throw new Error(`No converter for ${entry.mechanics.type}.`);
  const text = escapeHtml(entry.description).split(/\n\s*\n/u).map(p => `<p>${p.replaceAll("\n", "<br>")}</p>`).join("");
  return {
    _id: documentIdFor(entry.id),
    name: entry.name,
    type: entry.mechanics.type,
    img: entry.icon,
    system: {
      description: { value: text, chat: "" },
      source: { custom: entry.source.title, book: entry.source.title, page: "", license: entry.source.license, rules: "2014", revision: 1 },
      quantity: 1,
      weight: { value: entry.weight.value, units: "lb" },
      price: { ...entry.price },
      identified: true,
      type: { value: entry.mechanics.subtype, subtype: "" }
    },
    flags: {
      [FLAG_SCOPE]: {
        generatedBy: MODULE_ID,
        schemaVersion: 1,
        sourceId: entry.id,
        category: entry.category,
        tags: [...entry.tags],
        shops: [...entry.shops],
        availability: entry.availability,
        source: { ...entry.source },
        weightPolicy: "adjusted-lb",
        weightNotes: entry.weight.notes
      }
    }
  };
}
