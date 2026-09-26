import { MODULE_ID } from "../constants.js";
import { logger } from "../core/logger.js";
import { appendHistory, isMerchantToken, merchantConfig, publicOffers, sanitizeBasket, ServiceSlots, SOCKET_CHANNEL } from "./model.js";

const requests = new Map();
const locks = new ServiceSlots();
const subscribers = new Map();
let listening = false;

function coordinator() {
  return [...game.users].filter(user => user.active && user.isGM).sort((a, b) => a.id.localeCompare(b.id))[0];
}

function send(message) { game.socket.emit(SOCKET_CHANNEL, message); }
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
  if (msg.type === "stock" || msg.type === "result") {
    if (msg.to !== game.user.id) return;
    const entry = requests.get(msg.id);
    if (entry) {
      if (msg.status !== "pending") requests.delete(msg.id);
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
      availability: merchantConfig(actor).availability ?? "open", items: publicOffers(actor) });
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
  let proposal;
  try { proposal = sanitizeBasket(msg.lines, publicOffers(actor)); }
  catch (error) { return notify(msg.userId, { id: msg.id, error: error.message }); }
  if (!locks.acquire(actor.id, msg.id)) return notify(msg.userId, { id: msg.id, error: "Merchant occupied." });
  logger.debug("Merchant lock acquired", { merchant: actor.id, request: msg.id });
  notify(msg.userId, { id: msg.id, status: "pending" });
  const { MerchantReviewApplication } = await import("./review-app.js");
  const app = new MerchantReviewApplication({ actor, character, user, request: msg, proposal,
    onFinish: result => finish(actor, msg, proposal, result) });
  subscribers.set(msg.id, app);
  try { await app.render({ force: true }); }
  catch (error) {
    logger.error("Merchant review failed", error);
    locks.release(actor.id, msg.id); subscribers.delete(msg.id);
    notify(msg.userId, { id: msg.id, error: "The GM could not open the review window." });
  }
}

async function finish(actor, request, proposal, decision) {
  if (!locks.owns(actor.id, request.id)) return;
  if (decision !== "close") {
    const policy = game.settings.get(MODULE_ID, "merchantHistoryRetention");
    const old = merchantConfig(actor);
    const entry = { id: request.id, date: new Date().toISOString(), merchantId: actor.id,
      characterId: request.characterId, claimedUserId: request.userId,
      items: proposal.basket, copper: proposal.total, status: decision,
      outcome: "Sprint 5 request demonstration; no Items or currency transferred" };
    try {
      await actor.setFlag(MODULE_ID, "merchant", { ...old,
        history: appendHistory(old.history, entry, old.historyRetention ?? policy) });
    } catch (error) {
      logger.error("Merchant history failed", error);
      ui.notifications.error("Merchant history could not be saved; resolve this before processing another request.");
      return false;
    }
  }
  locks.release(actor.id, request.id); subscribers.delete(request.id);
  logger.debug(decision === "approved" ? "Approval granted" : decision === "rejected" ? "Approval rejected" : "Merchant review closed",
    { merchant: actor.id, request: request.id });
  logger.debug("Merchant lock released", { merchant: actor.id });
  notify(request.userId, { id: request.id, status: decision });
  return true;
}

/** Client requests never contain authority to change the NPC; all offers are recalculated on the GM. */
export function merchantRequest(type, details, callback) {
  const id = crypto.randomUUID();
  if (typeof callback === "function") {
    const timer = type === "browse" ? setTimeout(() => {
      if (!requests.delete(id)) return;
      void callback({ id, error: "The GM did not respond. Keep the GM connected, reload both clients after an update, then Refresh stock." });
    }, 12000) : null;
    timer?.unref?.();
    requests.set(id, result => { if (timer) clearTimeout(timer); return callback(result); });
  }
  const packet = { type, ...details, id, userId: game.user.id };
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
  game.socket.on(SOCKET_CHANNEL, message => { void receive(message).catch(error => logger.error("Merchant socket error", error)); });
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
