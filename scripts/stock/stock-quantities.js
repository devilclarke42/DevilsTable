import { priceBand } from "../validation/item-rules.js";

/** One bounded percentile roll per selected item; quantity counts its complete sale units. */
export async function rollStockQuantity(policy, item, tier, rollDie) {
  const band = priceBand(item.price);
  const rule = policy.rules.find(rule => rule.tier === tier && rule.priceBand === band);
  const profile = policy.profiles.find(profile => profile.id === rule?.profile);
  if (!profile) throw new Error(`Missing quantity profile for ${tier}/${band}.`);
  const roll = await rollDie(100);
  if (!Number.isSafeInteger(roll) || roll < 1 || roll > 100) throw new Error(`Invalid quantity d100 result: ${roll}.`);
  let upper = 0;
  for (const result of profile.results) {
    upper += result.weight;
    if (roll <= upper) return { quantity: result.quantity, quantityProfile: profile.id, quantityRoll: roll };
  }
  throw new Error(`Quantity profile ${profile.id} does not cover d100.`);
}
