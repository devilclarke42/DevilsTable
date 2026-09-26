import { MODULE_ID } from "../constants.js";

export const COINS = Object.freeze({ pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 });
export function walletValue(wallet) {
  let total = 0;
  for (const [key, count] of Object.entries(wallet ?? {})) {
    if (!Number.isSafeInteger(count) || count < 0 || (!COINS[key] && count)) throw Error("Unsupported currency balance.");
    total += count * (COINS[key] ?? 0);
  }
  if (!Number.isSafeInteger(total)) throw Error("Currency balance is too large.");
  return total;
}
export function tradeSettings(actor) {
  const settings = actor.getFlag(MODULE_ID, "merchant")?.settings ?? {};
  return { walletMode: settings.walletMode ?? "finite", exactChange: settings.exactChange === true,
    buyModifier: settings.buyModifier ?? 1, sellModifier: settings.sellModifier ?? 1 };
}
export function adjustedPrice(value, factor) {
  if (!Number.isFinite(factor) || factor < 0 || factor > 100) throw Error("Price modifier must be between 0 and 100.");
  const result = Math.round(value * factor);
  if (!Number.isSafeInteger(result)) throw Error("Invalid adjusted price.");
  return result;
}

/** Bounded denomination solver. A positive delta moves existing coins payer -> receiver. */
export function exactPayment(payer, receiver, amount, budget = 100000) {
  const entries = Object.entries(COINS);
  let visited = 0;
  function solve(index, remaining) {
    if (++visited > budget) throw Error("Denomination search limit reached; GM settlement required.");
    const [key, value] = entries[index];
    if (index === entries.length - 1) {
      return remaining >= -(receiver[key] ?? 0) && remaining <= (payer[key] ?? 0) ? { [key]: remaining } : null;
    }
    const tail = entries.slice(index + 1);
    const minTail = -tail.reduce((sum, [k, v]) => sum + (receiver[k] ?? 0) * v, 0);
    const maxTail = tail.reduce((sum, [k, v]) => sum + (payer[k] ?? 0) * v, 0);
    const low = Math.max(-(receiver[key] ?? 0), Math.ceil((remaining - maxTail) / value));
    const high = Math.min(payer[key] ?? 0, Math.floor((remaining - minTail) / value));
    for (let count = high; count >= low; count--) {
      const rest = solve(index + 1, remaining - count * value);
      if (rest) return { [key]: count, ...rest };
    }
    return null;
  }
  const result = solve(0, amount);
  if (!result) throw Error("Available denominations cannot settle this trade. Edit the price or arrange payment with the GM.");
  return result;
}

/** Use D&D5e's pure currency planner; actual writes belong to the recoverable transaction. */
export function planPayment(character, merchant, net, settings = tradeSettings(merchant)) {
  const definitions = globalThis.CONFIG?.DND5E?.currencies;
  if (definitions && Object.entries(COINS).some(([key, value]) => definitions.cp?.conversion / definitions[key]?.conversion !== value)) {
    throw Error("This trade requires the supported D&D5e currency conversion rates.");
  }
  if (!Number.isSafeInteger(net)) throw Error("Invalid transaction total.");
  const pc = { ...character.system.currency }, npc = { ...merchant.system.currency };
  const pcValue = walletValue(pc), npcValue = walletValue(npc);
  if (net > pcValue) throw Error("The character does not have enough money.");
  if (net < 0 && settings.walletMode !== "infinite" && -net > npcValue) throw Error("The merchant does not have enough money.");
  if (!net) return { character: pc, merchant: npc };
  const payerActor = net > 0 ? character : merchant;
  const payer = net > 0 ? pc : npc, receiver = net > 0 ? npc : pc;
  const amount = Math.abs(net);
  if (settings.exactChange && settings.walletMode !== "infinite") {
    const coins = exactPayment(payer, receiver, amount);
    for (const [key, count] of Object.entries(coins)) { payer[key] = (payer[key] ?? 0) - count; receiver[key] = (receiver[key] ?? 0) + count; }
  } else {
    if (!(net < 0 && settings.walletMode === "infinite")) {
      const manager = globalThis.dnd5e?.applications?.CurrencyManager;
      if (!manager?.getActorCurrencyUpdates) throw Error("D&D5e CurrencyManager is unavailable; no money moved.");
      const update = manager.getActorCurrencyUpdates(payerActor, amount, "cp", { recursive: false, makeChange: true });
      if (update.remainder) throw Error("Insufficient native Actor currency.");
      Object.assign(payer, update.system.currency);
    }
    // Infinite funds is an explicit source/sink: merchant's native balance stays unchanged.
    if (!(net > 0 && settings.walletMode === "infinite")) receiver.cp = (receiver.cp ?? 0) + amount;
  }
  if (walletValue(pc) !== pcValue - net || (settings.walletMode !== "infinite" && walletValue(npc) !== npcValue + net)) {
    throw Error("Native currency calculation did not balance.");
  }
  return { character: pc, merchant: npc };
}
