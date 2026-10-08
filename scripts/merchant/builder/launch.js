import { MerchantBuilderApplication } from "./app.js";

/** One launch path for sheets, directories, shop controls and the public API. */
export function launchMerchantBuilder(options = {}) {
  if (!game.user?.isGM) throw Error("Only a GM can open the Merchant Builder.");
  return new MerchantBuilderApplication(options).render({ force: true });
}
