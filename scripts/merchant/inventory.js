/** Physical inventory includes manually added/hidden stock; NPC features and spells are not stock. */
const TYPES = new Set(["weapon", "equipment", "consumable", "tool", "loot", "container"]);
export const isStockItem = item => TYPES.has(item?.type);
export const stockItems = actor => [...(actor.items ?? [])].filter(isStockItem);
