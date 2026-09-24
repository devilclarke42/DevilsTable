import { FLAG_SCOPE, MODULE_ID, PACK_COLLECTION, TABLE_PACK_COLLECTION } from "../constants.js";
import { documentIdFor } from "./document-id.js";
import { escapeHtml } from "./item-factory.js";
import { STOCK_KINDS, STOCK_LABELS, stockScopes, stockTableId } from "../data/stock-catalogue.js";

const TABLE_ICON = "icons/svg/d20-grey.svg";
export const itemUuid = id => `Compendium.${PACK_COLLECTION}.Item.${documentIdFor(id)}`;
export const tableUuid = id => `Compendium.${TABLE_PACK_COLLECTION}.RollTable.${documentIdFor(id)}`;

function row(tableId, key, name, range, { uuid = null, icon = TABLE_ICON, itemId = null } = {}) {
  const sourceId = `${tableId}_${key}`;
  return {
    _id: documentIdFor(sourceId), type: uuid ? "document" : "text", name,
    description: uuid ? "" : `<p>${escapeHtml(name)}</p>`,
    documentUuid: uuid, img: icon, weight: range[1] - range[0] + 1, range, drawn: false,
    flags: { [FLAG_SCOPE]: { generatedBy: MODULE_ID, sourceId, ...(itemId ? { itemId } : {}) } }
  };
}

/** V14 result names/description/documentUuid fields; never legacy numeric result types. */
export function stockTableDocuments(catalogue, selection = {}) {
  return stockScopes(catalogue, selection).flatMap(scope => {
    const { profile, categoryId, label, groups } = scope;
    const draws = categoryId ? profile.categoryDraws : profile.draws;
    const ids = Object.fromEntries(STOCK_KINDS.map(kind => [kind, stockTableId(profile, categoryId, kind)]));
    const partial = profile.coverage === "partial" ? " This shop currently contains only authored shared goods, not a complete catalogue." : "";
    return STOCK_KINDS.map(kind => {
      const id = ids[kind];
      let formula;
      let results;
      let instructions;
      if (kind === "rotating") {
        formula = "1d100";
        let next = 1;
        results = [];
        for (const [tier, chance] of [["often", catalogue.stock.oftenChance], ["rarely", catalogue.stock.rarelyChance]]) {
          results.push(row(id, tier.toUpperCase(), groups[tier].length ? STOCK_LABELS[tier] : `No extra stock: no authored ${tier} goods`,
            [next, next + chance - 1], groups[tier].length ? { uuid: tableUuid(ids[tier]) } : {}));
          next += chance;
        }
        if (next <= 100) results.push(row(id, "NONE", "No extra stock", [next, 100]));
        instructions = `Draw the Always Stock table once, then make up to ${draws} rotating draws. Often ${catalogue.stock.oftenChance}%; Rarely ${catalogue.stock.rarelyChance}%; otherwise no extra stock. Empty tiers give no extra stock. Repeated items do not imply extra quantity; stop when the available choices are exhausted. For a duplicate-free list, use Roll Stock in the builder.`;
      } else {
        const items = groups[kind];
        formula = `1d${kind === "always" ? 1 : Math.max(1, items.length)}`;
        results = items.map((item, index) => row(id, item.id, item.name, kind === "always" ? [1, 1] : [index + 1, index + 1],
          { uuid: itemUuid(item.id), icon: item.icon, itemId: item.id }));
        if (!results.length) results.push(row(id, "EMPTY", `No authored ${kind} stock in this selection`, [1, 1]));
        instructions = kind === "always"
          ? "Draw once to return every Always Stock item. The overlapping 1–1 ranges are intentional; do not Normalize this table. Stock quantities remain a GM decision."
          : `This is the ${kind} item pool. Each item has an equal chance within this tier; use Rotating Stock to apply the availability chance. Stock quantities remain a GM decision.`;
      }
      const links = STOCK_KINDS.filter(other => other !== kind).map(other => `@UUID[${tableUuid(ids[other])}]{${STOCK_LABELS[other]}}`).join(" · ");
      return {
        _id: documentIdFor(id), name: `${label} — ${STOCK_LABELS[kind]}`, img: TABLE_ICON,
        description: `<p>${escapeHtml(instructions + partial)}</p><p>${links}</p>`,
        formula, replacement: true, displayRoll: kind !== "always", results,
        flags: { [FLAG_SCOPE]: { generatedBy: MODULE_ID, schemaVersion: 1, sourceId: id,
          kind: "stock-table", shop: profile.shop, category: categoryId ?? "all", tier: kind, draws } }
      };
    });
  });
}
