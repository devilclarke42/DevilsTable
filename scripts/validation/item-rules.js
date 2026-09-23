/** Price bands describe project economics, not rarity or automatic stock selection. */
export function priceBand({ value, denomination }) {
  if (denomination === "cp") return "Everyday";
  if (denomination === "sp") return "Common";
  return value < 25 ? "Equipment" : "Specialist";
}

/** Called only after structural validation. Conditional mechanics stay explicit here. */
export function validateItemRules(item, location) {
  const errors = [];
  const add = (field, message) => errors.push({ path: `${location}.${field}`, message });
  if (["cp", "sp"].includes(item.price.denomination) && item.price.value > 9) {
    add("price", "Use 1–9 cp, 1–9 sp, or whole gp; choose a sensible larger denomination.");
  }
  const mechanics = item.mechanics;
  if (mechanics.type === "loot") {
    if (!["art", "gear", "gem", "junk", "material", "resource", "trade", "treasure"].includes(mechanics.subtype)) add("mechanics.subtype", "Loot requires a supported loot subtype.");
  } else if (mechanics.type === "container") {
    if (mechanics.subtype) add("mechanics.subtype", "D&D5e containers do not have a loot subtype.");
    if (!mechanics.capacity) add("mechanics.capacity", "Containers require weight and volume capacities.");
    else {
      for (const unit of ["weight", "volume"]) {
        if (mechanics.capacity[unit].value <= 0) add(`mechanics.capacity.${unit}.value`, "Capacity must be greater than zero.");
      }
    }
    if (item.weight.value <= 0) add("weight.value", "A mundane container must have a positive empty weight.");
  } else if (mechanics.type === "consumable") {
    if (!["food", "trinket"].includes(mechanics.subtype)) add("mechanics.subtype", "Supported mundane consumables use food or trinket.");
    if (!mechanics.use) add("mechanics.use", "Consumables require an explicit use action and consumption mode.");
    if (mechanics.subtype === "food" && mechanics.use?.mode !== "consume") add("mechanics.use.mode", "Food must consume one sale unit.");
  }
  if (mechanics.type !== "container" && mechanics.capacity) add("mechanics.capacity", "Only containers may define capacity.");
  if (mechanics.type !== "consumable" && mechanics.use) add("mechanics.use", "Use activities require a supported consumable mapping.");
  if (mechanics.light) {
    const light = mechanics.light;
    if (mechanics.type !== "consumable" || mechanics.subtype !== "trinket") add("mechanics.light", "Lights require the mundane trinket mapping.");
    if (light.dimFeet < light.brightFeet) add("mechanics.light.dimFeet", "Dim distance is the total reach and cannot be less than bright distance.");
    if (light.durationHours <= 0) add("mechanics.light.durationHours", "Burn duration must be positive.");
    const mode = light.fuel === "self" ? "consume" : "reusable";
    if (mechanics.use?.mode !== mode) add("mechanics.use.mode", "Self-burning lights are consumed; externally fuelled lights remain reusable.");
  }
  if (item.category === "containers" && mechanics.type !== "container") {
    add("mechanics.type", "The Containers category requires native container mechanics.");
  }
  return errors;
}
