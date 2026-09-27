export function journalPack() {
  const docs = new Map();
  const index = new Map(); index[Symbol.iterator] = function () { return this.values(); };
  const pack = { documentName: "JournalEntry", metadata: { packageType: "world" }, collection: "world.devils-table-transactions", index,
    testUserPermission: () => false, configure: async () => {}, getIndex: async () => index, getDocument: async id => docs.get(id) };
  globalThis.CONFIG.JournalEntry = { documentClass: { async create(data) {
    if (docs.has(data._id)) throw Error("Duplicate receipt ID");
    const doc = { uuid: `Compendium.${pack.collection}.JournalEntry.${data._id}`, data: structuredClone(data),
      pages: [{ id: "page" }], getFlag: (ns, key) => doc.data.flags[ns][key],
      async update(change) { if (change["flags.devils-table.transaction"]) doc.data.flags["devils-table"].transaction = structuredClone(change["flags.devils-table.transaction"]); },
      async updateEmbeddedDocuments() {} };
    docs.set(data._id, doc); index.set(data._id, { _id: data._id, flags: doc.data.flags }); return doc;
  } } };
  return { pack, docs };
}
