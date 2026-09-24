import { BATCH_SIZE, FLAG_SCOPE, MODULE_ID, MODULE_TITLE, TABLE_PACK_NAME, TABLE_PACK_COLLECTION } from "../constants.js";
import { createFoundryAdapter } from "./foundry-adapter.js";
import { assertManagedResults } from "./roll-table-plan.js";
import { matchesGenerated } from "./generated-fields.js";
import { itemUuid } from "./roll-table-factory.js";

/** Only this adapter touches Foundry RollTables and their owned embedded result rows. */
export function createRollTableAdapter() {
  const items = createFoundryAdapter();
  const TableClass = CONFIG.RollTable.documentClass;
  const ResultClass = CONFIG.TableResult.documentClass;
  const assertCanBuild = () => items.assertCanBuild();
  return {
    assertCanBuild,
    async validateDocuments(documents) {
      const pack = await items.getPack();
      const sources = new Map((pack ? await items.readPack(pack) : []).map(item => [itemUuid(item.flags?.[FLAG_SCOPE]?.sourceId ?? "UNKNOWN"), item]));
      const tableReferences = new Set(documents.map(table => `Compendium.${TABLE_PACK_COLLECTION}.RollTable.${table._id}`));
      for (const data of documents) {
        const temporary = new TableClass(structuredClone(data), { strict: true });
        temporary.validate({ strict: true, fields: true, joint: true });
        if (temporary.results.size !== data.results.length) throw new Error(`Invalid embedded results were dropped from ${data.name}. No tables were written.`);
        for (const row of data.results) {
          new ResultClass(structuredClone(row), { parent: temporary, strict: true }).validate({ strict: true, fields: true, joint: true });
          if (row.type !== "document") continue;
          const sourceId = row.flags[FLAG_SCOPE].itemId;
          if (sourceId) {
            const item = sources.get(row.documentUuid);
            if (!item || item.flags?.[FLAG_SCOPE]?.generatedBy !== MODULE_ID || item.flags[FLAG_SCOPE].sourceId !== sourceId
                || row.documentUuid !== `Compendium.${pack.collection}.Item.${item._id}`) {
              throw new Error(`Missing or conflicting compendium item ${sourceId}. Build/Rebuild Items for this selection first; no tables were written.`);
            }
          } else if (!tableReferences.has(row.documentUuid)) throw new Error(`Unresolved nested table: ${row.documentUuid}.`);
        }
      }
    },
    async getPack() {
      const pack = game.packs.get(TABLE_PACK_COLLECTION);
      if (pack && (pack.documentName !== "RollTable" || pack.metadata.packageType !== "world")) throw new Error(`${TABLE_PACK_COLLECTION} is not a world RollTable pack.`);
      return pack;
    },
    createPack: () => foundry.documents.collections.CompendiumCollection.createCompendium({
      name: TABLE_PACK_NAME, label: `${MODULE_TITLE} — Stock RollTables`, type: "RollTable", package: "world"
    }),
    async readPack(pack) {
      const tables = await pack.getDocuments();
      if (pack.invalidDocumentIds.size) throw new Error("The target pack contains invalid RollTables; resolve them before rebuilding.");
      return tables.map(table => table.toObject());
    },
    configure: (pack, locked) => pack.configure({ locked }),
    create: (pack, data) => TableClass.createDocuments(structuredClone(data), { pack: pack.collection, keepId: true, keepEmbeddedIds: true }),
    async update(pack, documents) {
      const headers = documents.map(({ results: _results, ...header }) => structuredClone(header));
      const updated = await TableClass.updateDocuments(headers, { pack: pack.collection });
      if (updated.length !== headers.length) throw new Error("A Foundry hook prevented one or more table updates.");
      for (const expected of documents) {
        assertCanBuild();
        const table = await pack.getDocument(expected._id);
        const saved = table.toObject();
        assertManagedResults(saved);
        const byId = new Map(saved.results.map(row => [row._id, row]));
        const desired = new Set(expected.results.map(row => row._id));
        const create = expected.results.filter(row => !byId.has(row._id));
        const update = expected.results.filter(row => byId.has(row._id) && !matchesGenerated(byId.get(row._id), row));
        const remove = saved.results.filter(row => !desired.has(row._id)).map(row => row._id);
        // Create/update before removing obsolete owned rows. A failed operation is retryable.
        for (const [action, rows] of [["create", create], ["update", update], ["delete", remove]]) {
          for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
            assertCanBuild();
            const batch = rows.slice(offset, offset + BATCH_SIZE);
            const result = await table[`${action}EmbeddedDocuments`]("TableResult", structuredClone(batch), { keepId: true });
            if (result.length !== batch.length) throw new Error(`A Foundry hook prevented ${action} of table results.`);
          }
        }
      }
      return updated;
    },
    deleteLegacy: (pack, ids) => TableClass.deleteDocuments(ids, { pack: pack.collection }),
    readWorldTables: async () => {
      if (game.tables.invalidDocumentIds.size) throw new Error("Invalid world RollTables prevent checking legacy references.");
      return game.tables.contents.map(table => table.toObject());
    },
    saveCleanupSummary: summary => game.settings.set(MODULE_ID, "lastTableCleanupSummary", JSON.stringify(summary)),
    saveSummary: summary => game.settings.set(MODULE_ID, "lastTableBuildSummary", JSON.stringify(summary))
  };
}
