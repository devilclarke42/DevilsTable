import { documentIdFor } from "./document-id.js";

/**
 * Native D&D5e 5.3.3 utility activity. Blank itemUses target means the owning Item,
 * so actor imports do not contain a stale reference to the compendium document ID.
 * Consuming uses one complete sale unit; reusable gear has no consumption target.
 */
export function consumableSystemFields(entry) {
  const { subtype, use, light } = entry.mechanics;
  const consumes = use.mode === "consume";
  const activityId = documentIdFor(`${entry.id}_USE`);
  return {
    type: { value: subtype, subtype: "" },
    properties: [],
    uses: { spent: 0, max: consumes ? "1" : "", recovery: [], autoDestroy: consumes },
    activities: {
      [activityId]: {
        _id: activityId, type: "utility", name: use.name,
        activation: { type: use.activation, value: use.activation === "action" ? 1 : 0, condition: use.condition, override: false },
        consumption: {
          spellSlot: false, scaling: { allowed: false, max: "" },
          targets: consumes ? [{ type: "itemUses", target: "", value: "1", scaling: { mode: "", formula: "" } }] : []
        },
        duration: {
          value: !consumes && light ? String(light.durationHours) : "",
          units: !consumes && light ? "hour" : "inst", concentration: false, override: false
        },
        target: { prompt: false },
        roll: { formula: "", name: "", prompt: false, visible: false },
        effects: []
      }
    }
  };
}
