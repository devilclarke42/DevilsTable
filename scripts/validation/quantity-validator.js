import { compileSchema } from "./schema-validator.js";

const TIERS = ["always", "often", "rarely"];
const BANDS = ["Everyday", "Common", "Equipment", "Specialist"];

/** Complete bounded distributions; expected stock must fall with price and scarcity. */
export function validateQuantities({ quantities, quantitiesSchema }) {
  const errors = compileSchema(quantitiesSchema)(quantities, "data/stock-quantities.json");
  if (errors.length) return errors;
  const add = message => errors.push({ path: "data/stock-quantities.json", message });
  const profiles = new Map();
  for (const profile of quantities.profiles) {
    if (profiles.has(profile.id)) add(`Duplicate quantity profile: ${profile.id}.`);
    profiles.set(profile.id, profile);
    if (profile.results.reduce((sum, row) => sum + row.weight, 0) !== 100) add(`${profile.id}: weights must total 100.`);
    if (profile.results.some(row => row.quantity > 100 || row.weight > 100)) add(`${profile.id}: quantities and weights must be at most 100.`);
    if (new Set(profile.results.map(row => row.quantity)).size !== profile.results.length) add(`${profile.id}: quantities must be unique.`);
  }
  const rules = new Map();
  for (const rule of quantities.rules) {
    const key = `${rule.tier}/${rule.priceBand}`;
    if (rules.has(key)) add(`Duplicate quantity rule: ${key}.`);
    rules.set(key, profiles.get(rule.profile));
    if (!profiles.has(rule.profile)) add(`${key}: unknown profile ${rule.profile}.`);
  }
  for (const tier of TIERS) for (const band of BANDS) {
    if (!rules.has(`${tier}/${band}`)) add(`Missing quantity rule: ${tier}/${band}.`);
  }
  if (errors.length) return errors;
  const mean = (tier, band) => rules.get(`${tier}/${band}`).results.reduce((sum, row) => sum + row.quantity * row.weight / 100, 0);
  for (const tier of TIERS) for (let i = 1; i < BANDS.length; i++) {
    if (mean(tier, BANDS[i]) > mean(tier, BANDS[i - 1])) add(`${tier}: a more expensive band must not increase expected stock.`);
  }
  for (const band of BANDS) {
    for (let i = 1; i < TIERS.length; i++) {
      if (mean(TIERS[i], band) > mean(TIERS[i - 1], band)) add(`${band}: a scarcer tier must not increase expected stock.`);
    }
    const rare = rules.get(`rarely/${band}`).results;
    if (!rare.some(row => row.quantity === 1 && row.weight >= 90) || rare.some(row => row.quantity > 2)) {
      add(`${band}: Rare stock must be one at least 90% of the time and never exceed two sale units.`);
    }
  }
  return errors;
}
