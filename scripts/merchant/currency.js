/** Display copper accounting values as gp/sp/cp; never changes native Actor coins. */
export function formatCopper(value) {
  if (!Number.isSafeInteger(value) || value < 0) return "Unavailable";
  if (value === 0) return "0 cp";
  const gold = Math.floor(value / 100);
  const silver = Math.floor((value % 100) / 10);
  const copper = value % 10;
  return [[gold, "gp"], [silver, "sp"], [copper, "cp"]]
    .filter(([amount]) => amount > 0).map(([amount, denomination]) => `${amount} ${denomination}`).join(" ");
}
