// D&D5e 5.3.3 accepts cubicFoot/liter, not pint/quart/gallon, in system.capacity.volume.
// US liquid measures: 1 gallon = 231 cubic inches; 1 cubic foot = 1728 cubic inches.
const CUBIC_FEET = Object.freeze({ cubicFoot: 1, pint: 231 / (8 * 1728), quart: 231 / (4 * 1728), gallon: 231 / 1728 });

/** Native mundane container fields. Capacity is contents-only; Item weight is empty mass. */
export function containerSystemFields(capacity) {
  const factor = CUBIC_FEET[capacity.volume.units];
  if (!factor) throw new Error(`Unsupported capacity unit: ${capacity.volume.units}.`);
  return {
    capacity: {
      count: 0,
      weight: { value: capacity.weight.value, units: "lb" },
      volume: { value: capacity.volume.value * factor, units: "cubicFoot" }
    },
    properties: [] // No weightlessContents: contained items contribute to encumbrance.
  };
}
