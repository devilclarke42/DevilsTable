import { quoteTrade, purchaseOffers, stable } from "./trade-model.js";
import { offerTerms, confirmRevisedOffer } from "./revised-offer.js";
import { tradeSettings } from "./settlement.js";
import { executeTrade } from "./transaction.js";
import { finishReceiptReview, trimReceipts } from "./ledger.js";
import { MODULE_ID } from "../constants.js";
import { logger } from "../core/logger.js";
import { isMerchantToken, merchantConfig, ServiceSlots, SOCKET_CHANNEL } from "./model.js";

const requests = new Map();
const locks = new ServiceSlots();
const subscribers = new Map();
let listening = false;
const proofs = new Map();
export function registerCheckoutProof() {
  CONFIG.queries[`${MODULE_ID}.checkoutProof`] = ({ id }) => proofs.get(id) ?? null;
  CONFIG.queries[`${MODULE_ID}.revisedOffer`] = async payload => {
    if (!proofs.has(payload.id)) return false;
    return (await confirmRevisedOffer(payload)) === true && proofs.has(payload.id);
  };
}
async function verifyRequester(msg) {
  const user = game.users.get(msg.userId);
  if (!user?.active) throw Error("The requesting player is offline.");
  const proof = user.id === game.user.id ? proofs.get(msg.id)
    : await user.query(`${MODULE_ID}.checkoutProof`, { id: msg.id }, { timeout: 10000 });
  if (!proof || stable(proof) !== stable(msg)) throw Error("The requesting player could not confirm this checkout. Submit it again.");
}


function coordinator() {
  return game.users.activeGM ?? [...game.users].filter(user => user.active && user.isGM).sort((a, b) => a.id.localeCompare(b.id))[0];
}

function send(message) {
  logger.debug("Merchant socket sent", { type: message.type, id: message.id });
  // Supply the acknowledgement callback used by Foundry's module socket contract.
  game.socket.emit(SOCKET_CHANNEL, message, response => {
    logger.debug("Merchant socket acknowledged", { type: message.type, id: message.id });
    if (response?.error) {
      logger.error("Merchant socket relay rejected packet", response.error);
      const callback = requests.get(message.id);
      if (callback) {
        requests.delete(message.id);
        void callback({ id: message.id, error: "Foundry could not relay the merchant request. Restart the game server after installing the update." });
      }
    }
  });
}
function notify(id, message) {
  const packet = { type: "result", to: id, ...message };
  // Foundry relays module packets to other clients; a GM browsing locally needs local delivery.
  if (id === game.user.id) return receive(packet);
  send(packet);
}
function inspect(msg) {
  if (!msg || typeof msg !== "object" || JSON.stringify(msg).length > 12000) return false;
  return typeof msg.id === "string" && msg.id.length < 100 && typeof msg.userId === "string";
}

function resolveRequest(msg) {
  const scene = game.scenes.get(msg.sceneId);
  const token = scene?.tokens.get(msg.tokenId);
  const actor = game.actors.get(token?.actorId);
  if (!isMerchantToken({ document: token }) || !merchantConfig(actor)) return null;
  return { scene, token, actor };
}

async function receive(msg) {
  if (!msg || typeof msg !== "object") return;
  logger.debug("Merchant socket received", { type: msg.type, id: msg.id, to: msg.to });
  if (msg.type === "stock" || msg.type === "result") {
    if (msg.to !== game.user.id) return;
    const entry = requests.get(msg.id);
    if (entry) {
      if (msg.status !== "pending") { requests.delete(msg.id); proofs.delete(msg.id); }
      entry(msg);
    }
    return;
  }
  if (!game.user.isGM || coordinator()?.id !== game.user.id || !inspect(msg)) return;
  const source = resolveRequest(msg);
  if (!source) return notify(msg.userId, { id: msg.id, error: "This merchant is unavailable." });
  const { actor, scene, token } = source;
  if (msg.type === "browse") {
    logger.debug("Merchant opened", { merchant: actor.id });
    return notify(msg.userId, { id: msg.id, type: "stock", merchant: actor.name,
      availability: merchantConfig(actor).availability ?? "open", items: purchaseOffers(actor), buyModifier: tradeSettings(actor).buyModifier });
  }
  if (msg.type !== "checkout") return;
  logger.debug("Checkout requested", { merchant: actor.id });
  if ((merchantConfig(actor).availability ?? "open") !== "open" || locks.occupied(actor.id)) {
    return notify(msg.userId, { id: msg.id, error: "The merchant is currently occupied. Your basket is saved." });
  }
  const user = game.users.get(msg.userId);
  const character = game.actors.get(msg.characterId);
  const pcToken = scene.tokens.get(msg.characterTokenId);
  if (!user?.active || !character || !character.testUserPermission(user, "OWNER") ||
      pcToken?.actorId !== character.id || token.actorId !== actor.id) {
    return notify(msg.userId, { id: msg.id, error: "Select an owned character beside the merchant." });
  }
  if (actor.getFlag(MODULE_ID, "transactionPending") || character.getFlag(MODULE_ID, "transactionPending")) {
    return notify(msg.userId, { id: msg.id, error: "A previous trade needs GM recovery before checkout." });
  }
  let proposal;
  try { proposal = quoteTrade(actor, character, msg); }
  catch (error) { return notify(msg.userId, { id: msg.id, error: error.message }); }
  if (!locks.acquire(actor.id, msg.id)) return notify(msg.userId, { id: msg.id, error: "Merchant occupied." });
  logger.debug("Merchant lock acquired", { merchant: actor.id, request: msg.id });
  try { await verifyRequester(msg); }
  catch (error) { locks.release(actor.id, msg.id); return notify(msg.userId, { id: msg.id, error: error.message }); }
  notify(msg.userId, { id: msg.id, status: "pending" });
  const { MerchantReviewApplication } = await import("./review-app.js");
  let accepted = offerTerms(proposal);
  const revise = async revised => {
    const terms = offerTerms(revised);
    proposal = revised;
    if (stable(terms) === stable(accepted)) return true;
    await verifyRequester(msg);
    logger.debug("Revised offer awaiting player", { merchant: actor.id, request: msg.id });
    const payload = { id: msg.id, merchant: actor.name, previous: accepted, revised: terms };
    const consent = user.id === game.user.id ? await confirmRevisedOffer(payload)
      : await user.query(`${MODULE_ID}.revisedOffer`, payload, { timeout: 60000 });
    if (consent !== true) {
      logger.debug("Revised offer declined", { merchant: actor.id, request: msg.id });
      return false;
    }
    if (!locks.owns(actor.id, msg.id)) throw Error("This checkout is no longer active.");
    accepted = terms;
    logger.debug("Revised offer accepted", { merchant: actor.id, request: msg.id });
    return true;
  };
  const app = new MerchantReviewApplication({ actor, character, user, request: msg, proposal,
    onRecalculate: revise,
    onFinish: (result, edits) => finish(actor, character, msg, proposal, result, edits, accepted) });
  subscribers.set(msg.id, app);
  try { await app.render({ force: true }); }
  catch (error) {
    logger.error("Merchant review failed", error);
    locks.release(actor.id, msg.id); subscribers.delete(msg.id);
    notify(msg.userId, { id: msg.id, error: "The GM could not open the review window." });
  }
}

async function finish(actor, character, request, proposal, decision, edits, accepted) {
  if (!locks.owns(actor.id, request.id)) return false;
  if (!game.user.isGM || coordinator()?.id !== game.user.id) throw Error("Only the active GM may decide this trade.");
  try {
    if (decision === "approved") {
      await verifyRequester(request);
      if (!character.testUserPermission(game.users.get(request.userId), "OWNER")) throw Error("Character ownership changed.");
      if ((merchantConfig(actor)?.availability ?? "closed") !== "open") throw Error("Merchant is no longer open.");
      const quote = quoteTrade(actor, character, request, edits);
      if (stable(offerTerms(quote)) !== stable(accepted)) throw Error("The player must accept these revised terms. Recalculate the offer first.");
      // A changed quote must be resubmitted, unless the GM explicitly supplied line edits.
      if (!edits && stable(quote.basket) !== stable(proposal.basket)) throw Error("Prices changed. Close and resubmit this trade.");
      await executeTrade({ merchant: actor, character, quote, request });
    } else {
      decision = await finishReceiptReview({ schemaVersion: 1, id: request.id, date: new Date().toISOString(), merchantId: actor.id,
        characterId: character.id, merchantName: actor.name, characterName: character.name,
        userId: request.userId, gmId: game.user.id, request, quote: proposal,
        status: decision === "close" ? "closed" : "rejected" }, [actor, character]);
      try { await trimReceipts(actor); } catch (error) { logger.warn("History retention deferred", error); }
    }
  } catch (error) {
    logger.error("Merchant transaction failed", error);
    ui.notifications.error(`${error.message} The review remains open; retry or close it.`);
    return false;
  }
  locks.release(actor.id, request.id); subscribers.delete(request.id);
  logger.debug("Merchant decision", { merchant: actor.id, request: request.id, decision });
  notify(request.userId, { id: request.id, status: decision });
  return true;
}

/** Client requests never contain authority to change the NPC; all offers are recalculated on the GM. */
export function merchantRequest(type, details, callback) {
  const id = crypto.randomUUID();
  if (typeof callback === "function") {
    const timer = setTimeout(() => {
      if (!requests.delete(id)) return;
      proofs.delete(id);
      void callback({ id, error: "No stock reply arrived from the GM. Restart the game server after updating (a browser refresh alone may not reload the module socket), reconnect GM and player, then Refresh stock. If this persists, enable debug logging and check both consoles." });
    }, 20000);
    timer?.unref?.();
    requests.set(id, result => { if (timer) clearTimeout(timer); return callback(result); });
  }
  const packet = { type, ...details, id, userId: game.user.id };
  if (type === "checkout") proofs.set(id, structuredClone(packet));
  if (game.user.isGM && coordinator()?.id === game.user.id) {
    void receive(packet).catch(error => {
      logger.error("Local merchant request failed", error);
      void notify(game.user.id, { id, error: error.message });
    });
  } else send(packet);
  logger.debug(type === "browse" ? "Merchant opened" : "Checkout requested", { id });
  return id;
}

export function initialiseMerchantService() {
  if (listening) return;
  game.socket.on(SOCKET_CHANNEL, message => { void receive(message).catch(error => {
    logger.error("Merchant socket error", error);
    if (game.user.isGM && coordinator()?.id === game.user.id && inspect(message) &&
        ["browse", "checkout"].includes(message.type)) {
      notify(message.userId, { id: message.id, error: "The GM could not process this request. Check the GM console for the merchant error." });
    }
  }); });
  listening = true;
}

export async function enableMerchant(actor, availability = "open") {
  if (!game.user.isGM || actor?.type !== "npc") throw new Error("Select an NPC as GM.");
  const old = actor.getFlag(MODULE_ID, "merchant") ?? {};
  const collision = game.actors.some(other => other.id !== actor.id &&
    other.getFlag?.(MODULE_ID, "merchant")?.merchantId === old.merchantId && Boolean(old.merchantId));
  await actor.setFlag(MODULE_ID, "merchant", { ...old, schemaVersion: 1,
    merchantId: collision || !old.merchantId ? crypto.randomUUID() : old.merchantId,
    enabled: true, availability, shopProfileId: old.shopProfileId ?? null,
    relationships: old.relationships ?? {}, settings: old.settings ?? { walletMode: "finite" },
    restock: old.restock ?? { enabled: false }, history: old.history ?? [] });
  for (const scene of game.scenes) {
    const tokens = scene.tokens.filter(token => token.actorLink && token.actorId === actor.id);
    if (tokens.length) await scene.updateEmbeddedDocuments("Token", tokens.map(token => ({ _id: token.id,
      [`flags.${MODULE_ID}.merchantEntry`]: true })));
  }
  logger.debug("Merchant enabled", { merchant: actor.id });
}
