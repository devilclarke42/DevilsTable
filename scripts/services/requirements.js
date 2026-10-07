/** Read-only predicates over native Actor Items. No duplicated inventory or item consumption. */
export function matchesServiceItem(item, requirement) {
  if (!item || !requirement || !(Number(item.system?.quantity) >= 1)) return false;
  if (!requirement.types.includes(item.type)) return false;
  if (requirement.subtypes?.length && !requirement.subtypes.includes(item.system?.type?.value)) return false;
  if (requirement.baseItems?.length && !requirement.baseItems.includes(item.system?.type?.baseItem)) return false;
  return true;
}
export function serviceItemChoices(character, requirement) {
  return [...(character?.items ?? [])].filter(item => matchesServiceItem(item, requirement))
    .map(item => ({id:item.id, name:item.name})).sort((a,b)=>a.name.localeCompare(b.name));
}
export function resolveServiceItem(character, requirement, id, sales = []) {
  if (!requirement) return {};
  if (typeof id !== "string" || !id) throw Error("Select an inventory item for this service.");
  const item = [...(character?.items ?? [])].find(row=>row.id===id);
  if (!matchesServiceItem(item, requirement)) throw Error("The selected service item is missing or no longer eligible.");
  if (sales.some(row=>row.id===id)) throw Error("An item receiving a service cannot also be sold in the same checkout.");
  return {targetItemId:item.id, targetItemName:item.name};
}
