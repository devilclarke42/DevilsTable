import { MODULE_ID, MODULE_TITLE, PACK_NAME, PACK_COLLECTION } from "../constants.js";

/** Keep all Foundry globals at this boundary; pure builder logic is testable in Node. */
export function createFoundryAdapter() {
  const ItemClass = CONFIG.Item.documentClass;
  return {
    assertCanBuild() {
      if (!game.user?.isGM) throw new Error("Only a GM can build compendiums.");
      if (game.users.activeGM?.id !== game.user.id) throw new Error("Only the active GM may build. Ask the active GM to run the builder.");
      if (Number(game.release.generation) !== 14 || game.system.id !== "dnd5e" || game.system.version !== "5.3.3") {
        throw new Error("This converter targets Foundry V14 with D&D5e 5.3.3. No changes were made.");
      }
    },
    async validateDocuments(documents) {
      for (const data of documents) {
        const temporary = new ItemClass(structuredClone(data), { strict: true });
        temporary.validate({ strict: true, fields: true, joint: true });
        temporary.system.validate({ strict: true, fields: true, joint: true });
      }
    },
    async getPack() {
      const pack = game.packs.get(PACK_COLLECTION);
      if (pack && (pack.documentName !== "Item" || pack.metadata.packageType !== "world" || pack.metadata.system !== "dnd5e")) {
        throw new Error(`${PACK_COLLECTION} exists but is not a D&D5e world Item pack.`);
      }
      return pack;
    },
    async createPack() {
      return foundry.documents.collections.CompendiumCollection.createCompendium({
        name: PACK_NAME, label: `${MODULE_TITLE} — Items`, type: "Item", system: "dnd5e", package: "world"
      });
    },
    async readPack(pack) {
      const items = await pack.getDocuments();
      if (pack.invalidDocumentIds.size) throw new Error("The target pack contains invalid documents; resolve them before building.");
      return items.map(item => item.toObject());
    },
    configure: (pack, locked) => pack.configure({ locked }),
    create: (pack, data) => ItemClass.createDocuments(structuredClone(data), { pack: pack.collection, keepId: true }),
    update: (pack, data) => ItemClass.updateDocuments(structuredClone(data), { pack: pack.collection }),
    saveSummary: summary => game.settings.set(MODULE_ID, "lastBuildSummary", JSON.stringify(summary))
  };
}
