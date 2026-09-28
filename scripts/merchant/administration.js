import { MODULE_ID, BATCH_SIZE } from "../constants.js";
import { catalogueRegistry } from "../catalogues/registry.js";
import { coinValue, merchantConfig } from "./model.js";
import { stockItems } from "./inventory.js";
import { withAdministration, assertAdministrator } from "./operation-guard.js";
import { economyPolicy, resolveEconomy } from "./economy.js";
import { walletValue, tradeSettings } from "./settlement.js";
import { formatCopper } from "./currency.js";
import { stable } from "./trade-model.js";
import { logger } from "../core/logger.js";

export async function emptyMerchantStock(actor, { confirm = (count) => foundry.applications.api.DialogV2.confirm({
  window: { title: "Empty Stock?" }, modal: true, rejectClose: false,
  content: `<p>Remove all ${count} physical inventory entries, including manual, hidden, equipped and nested goods? NPC features and spells, cash, settings, notes, relationships and transaction history remain.</p>`
}) } = {}) {
  return withAdministration(actor, async () => {
    const items = stockItems(actor);
    const snapshot = stable(items.map(item => item.toObject()));
    if (!items.length || await confirm(items.length) !== true) return { removed: 0 };
    assertAdministrator(actor);
    if (stable(stockItems(actor).map(item => item.toObject())) !== snapshot) throw Error("Inventory changed during confirmation. Review it and try again.");
    if (!actor.getFlag(MODULE_ID, "merchant.initialFloat")) {
      await actor.setFlag(MODULE_ID, "merchant.initialFloat", { status: "preserved-after-reset", at: new Date().toISOString() });
      if (!actor.getFlag(MODULE_ID, "merchant.initialFloat")) throw Error("Cannot preserve the float marker; inventory was not emptied.");
    }
    const ids = items.map(item => item.id);
    for (let offset = 0; offset < ids.length; offset += BATCH_SIZE) {
      assertAdministrator(actor);
      await actor.deleteEmbeddedDocuments("Item", ids.slice(offset, offset + BATCH_SIZE));
      if (ids.slice(offset, offset + BATCH_SIZE).some(id => actor.items.get(id))) {
        throw Error("Empty Stock was only partially applied. Remaining inventory was preserved; refresh and review before retrying.");
      }
    }
    await actor.setFlag(MODULE_ID, "merchant.administration.lastEmptiedAt", new Date().toISOString());
    logger.debug("Merchant inventory emptied", { merchant: actor.id, removed: ids.length });
    return { removed: ids.length };
  });
}

/** Read the index, never complete recovery receipts; retained history is not a lifetime counter. */
export async function retainedRejections(actor) {
  if (!game.user?.isGM) throw Error("Merchant statistics are GM-only.");
  const pack = game.packs?.get("world.devils-table-transactions");
  if (!pack) return 0;
  if (pack.documentName !== "JournalEntry" || pack.metadata?.packageType !== "world") throw Error("Invalid transaction history pack.");
  const root = `flags.${MODULE_ID}.transaction`;
  const index = await pack.getIndex({ fields: [`${root}.merchantId`, `${root}.status`, `${root}.request.type`] });
  return [...index.values()].filter(row => {
    const record = row.flags?.[MODULE_ID]?.transaction;
    return record?.merchantId === actor.id && record.status === "rejected" && record.request?.type !== "interaction";
  }).length;
}
export async function merchantSummary(actor, { policy, rejected = retainedRejections } = {}) {
  if (!game.user?.isGM) throw Error("Merchant statistics are GM-only.");
  if (!merchantConfig(actor)) throw Error("This NPC is not an enabled merchant.");
  policy ??= await economyPolicy();
  const config = merchantConfig(actor), inputs = resolveEconomy(policy, config.economy);
  const physical = stockItems(actor);
  let units = 0, value = 0, unpriced = 0;
  for (const item of physical) {
    const quantity = item.system?.quantity;
    if (!Number.isSafeInteger(quantity) || quantity < 0) { unpriced++; continue; }
    units += quantity;
    const override = item.getFlag(MODULE_ID, "offer")?.unitPrice;
    const price = Number.isSafeInteger(override) && override >= 0 ? override : coinValue(item.system.price);
    if (price === null) { if (quantity) unpriced++; } else value += price * quantity;
  }
  const relationships = Object.values(config.relationships ?? {});
  const sum = key => relationships.reduce((n, row) => n + (Number.isSafeInteger(row[key]) && row[key] >= 0 ? row[key] : 0), 0);
  const cash = walletValue(actor.system.currency);
  const money = n => Number.isSafeInteger(n) ? formatCopper(n) : "Value exceeds supported precision";
  let rejections;
  try { rejections = await rejected(actor); } catch (error) { logger.warn("Merchant history count unavailable", error); rejections = "Unavailable"; }
  const last = config.administration?.lastStockedAt;
  const ago = last ? Math.max(0, Math.floor((Date.now() - Date.parse(last)) / 86400000)) : null;
  const rows = [
    { label: "Settlement", value: policy.settlements.find(r => r.id === inputs.settlement).name },
    { label: "Prosperity", value: policy.prosperities.find(r => r.id === inputs.prosperity).name },
    { label: "Merchant profile", value: policy.profiles.find(r => r.id === inputs.profile).name },
    { label: "Stock items", value: `${units} units / ${physical.length} entries` },
    { label: "Inventory value", value: money(value) },
    { label: "Current cash", value: `${money(cash)}${tradeSettings(actor).walletMode === "infinite" ? " (infinite funds enabled)" : ""}` },
    { label: "Merchant wealth (inventory + cash)", value: money(value + cash) },
    { label: "Lifetime purchases (merchant paid)", value: money(sum("receivedMinor")) },
    { label: "Lifetime sales (merchant earned)", value: money(sum("spentMinor")) },
    { label: "Successful transactions", value: sum("transactionCount") },
    { label: "Rejected transactions (retained history)", value: rejections },
    { label: "Availability", value: config.availability ?? "open" },
    { label: "Relationships", value: relationships.length },
    { label: "Last restock / inventory addition", value: ago === null || !Number.isFinite(ago) ? "Not recorded" : ago ? `${ago} days ago (${last})` : `Today (${last})` }
  ];
  return { rows, catalogue: catalogueRegistry.resolve(actor)?.name ?? "Catalogue unavailable", unpriced,
    floatStatus: config.initialFloat?.status ?? "Not initialized" };
}
export async function saveMerchantEconomy(actor, values) {
  return withAdministration(actor, async () => {
    const inputs = resolveEconomy(await economyPolicy(), values);
    await actor.setFlag(MODULE_ID, "merchant.economy", inputs);
    if (stable(actor.getFlag(MODULE_ID, "merchant.economy")) !== stable(inputs)) throw Error("Economy settings were not saved.");
  });
}
