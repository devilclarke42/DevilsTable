import { MODULE_ID } from "../constants.js";
import { INTERACTIONS, confidence, interactionSuggestion, interactionQuote } from "./interactions.js";
import { executeTrade } from "./transaction.js";
import { finishReceiptReview, trimReceipts } from "./ledger.js";
import { merchantConfig } from "./model.js";
import { logger } from "../core/logger.js";

/** GM-only controller. Private DCs/results never enter player request or response packets. */
export async function interactionReview({ actor, character, user, request, verify, owns, release, notify }) {
  let result = null, rolling = false;
  const assertAuthority = (trading = true) => {
    if (!game.user.isGM || game.users.activeGM?.id !== game.user.id || !owns()) throw Error("This interaction is no longer controlled by this GM.");
    if (!trading) return;
    if (!character.testUserPermission(user, "OWNER")) throw Error("Character ownership changed.");
    if ((merchantConfig(actor)?.availability ?? "closed") !== "open") throw Error("Merchant is no longer open.");
  };
  const { MerchantReviewApplication } = await import("./review-app.js");
  return new MerchantReviewApplication({ actor, character, user, request,
    interaction: { kind: request.kind, label: INTERACTIONS[request.kind].label, skill: INTERACTIONS[request.kind].skill,
      dc: Math.max(0, Math.min(50, 15 + (request.kind === "negotiation" ? confidence(actor) : 0))), confidence: confidence(actor) },
    onRoll: async ({ skill, dc }) => {
      assertAuthority();
      if (rolling || result) throw Error("This attempt already has a roll. Finish it before requesting another.");
      if (!CONFIG.DND5E.skills[skill] || (request.kind === "theft" && skill !== "slt") || !Number.isInteger(dc) || dc < 0 || dc > 50) throw Error("Invalid skill or hidden DC.");
      rolling = true;
      try {
        await verify();
        // Never include dc, confidence, perception or any merchant data in this payload.
        const payload = { id: request.id, characterId: character.id, skill, kind: request.kind };
        const roll = user.id === game.user.id ? await CONFIG.queries[`${MODULE_ID}.interactionRoll`](payload)
          : await user.query(`${MODULE_ID}.interactionRoll`, payload, { timeout: 60000 });
        assertAuthority();
        if (!roll || !Number.isFinite(roll.total) || Math.abs(roll.total) > 10000) throw Error("No valid roll returned. Decline or close this attempt.");
        result = { ...interactionSuggestion(request.kind, roll.total, dc), skill };
        logger.debug("Interaction roll received", { request: request.id, kind: request.kind });
        return result;
      } finally { rolling = false; }
    },
    onFinish: async (decision, edits) => {
      try {
        assertAuthority(decision === "approved");
        if (decision === "approved") {
          if (!result) throw Error("Allow the attempt and receive a roll first.");
          await verify();
          const quote = interactionQuote(actor, character, request, { ...result, outcome: edits.outcome, modifier: edits.modifier });
          await executeTrade({ merchant: actor, character, request, quote });
          notify({ status: "interaction-complete", outcome: edits.outcome, kind: request.kind });
        } else {
          const status = await finishReceiptReview({ schemaVersion: 1, id: request.id, date: new Date().toISOString(), merchantId: actor.id,
            characterId: character.id, merchantName: actor.name, characterName: character.name, userId: user.id,
            gmId: game.user.id, request, quote: { basket: [], total: 0, interaction: { kind: request.kind, ...result, outcome: "declined" } },
            status: decision === "close" ? "closed" : "rejected" }, [actor, character]);
          notify({ status: "interaction-complete", kind: request.kind, outcome: status === "approved" ? "completed" : "declined" });
        }
        release();
        try { await trimReceipts(actor); } catch (error) { logger.warn("Interaction retention deferred", error); }
        return true;
      } catch (error) {
        logger.error("Merchant interaction failed", error);
        ui.notifications.error(`${error.message} The review remains open.`); return false;
      }
    }
  });
}
