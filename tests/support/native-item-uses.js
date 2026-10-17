/**
 * Verbatim native helper from foundryvtt/dnd5e release-5.3.3, commit
 * 965ad2d0cf5d063dac675ba078b5bd3c3c0dd449, consumption-targets-field.mjs.
 * Only the static method declaration becomes an export for isolated verification.
 * Copyright 2021 Andrew Clayton. MIT; full notice in docs/SOURCE_NOTICES.md.
 * System DataModel preparation and cost-roll resolution are separate dependencies.
 */
export async function consumeItemUses(config, updates) {
    const item = this.target ? this.actor.items.get(this.target) : this.item;
    if ( !item ) throw new ConsumptionError(game.i18n.format("DND5E.CONSUMPTION.Warning.MissingItem", {
      activity: this.activity.name, item: this.item.name
    }));

    const result = await this._usesConsumption(config, {
      uses: item.system.uses,
      type: game.i18n.format("DND5E.CONSUMPTION.Type.ItemUses.Warning", { name: this.item.name }),
      rolls: updates.rolls,
      delta: { item: item.id, keyPath: "system.uses.spent" }
    });
    if ( !result ) return;

    const itemUpdate = {};
    if ( item.system.uses.autoDestroy && (result.spent === item.system.uses.max) ) {
      const newQuantity = item.system.quantity - 1;
      if ( newQuantity === 0 ) {
        updates.delete.push(item.id);
        return;
      } else {
        itemUpdate["system.uses.spent"] = 0;
        itemUpdate["system.quantity"] = newQuantity;
      }
    } else {
      itemUpdate["system.uses.spent"] = result.spent;
    }

    const itemIndex = updates.item.findIndex(i => i._id === item.id);
    if ( itemIndex === -1 ) updates.item.push({ _id: item.id, ...itemUpdate });
    else foundry.utils.mergeObject(updates.item[itemIndex], itemUpdate);
  }
