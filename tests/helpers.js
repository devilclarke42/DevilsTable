import { readFile } from "node:fs/promises";
import { loadCatalogue } from "../scripts/data/catalogue-loader.js";
export const root = new URL("../", import.meta.url);
export const readJson = async path => JSON.parse(await readFile(new URL(path, root), "utf8"));
export const fixture = await readJson("tests/fixtures/item.json");

export async function catalogue(items = [fixture]) {
  const data = await loadCatalogue({ readJson });
  data.entries = items.map((item, i) => ({ item: structuredClone(item), location: `fixture[${i}]` }));
  data.ledger.ids = [...new Set(items.filter(Boolean).map(item => item.id).filter(Boolean))];
  return data;
}

function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] ??= {};
      merge(target[key], value);
    } else target[key] = structuredClone(value);
  }
  return target;
}

/** In-memory persistence double, not a substitute for a real Foundry smoke test. */
export function fakeAdapter({ existing = [], hasPack = true, locked = true } = {}) {
  const state = { pack: hasPack ? { locked } : null, docs: structuredClone(existing), writes: [], configurations: [], summaries: [], permissions: true, hooks: {} };
  const adapter = {
    assertCanBuild() { if (!state.permissions) throw new Error("Permission denied"); },
    async validateDocuments(docs) { if (state.hooks.preflight) await state.hooks.preflight(docs); },
    async getPack() { return state.pack; },
    async createPack() { state.pack = { locked: false }; return state.pack; },
    async readPack() { return structuredClone(state.docs); },
    async configure(pack, next) { state.configurations.push(next); if (state.hooks.configure) await state.hooks.configure(next); pack.locked = next; },
    async create(_pack, docs) {
      if (state.hooks.create) await state.hooks.create(docs);
      for (const doc of docs) {
        if (state.docs.some(other => other._id === doc._id)) throw new Error("Duplicate document");
        state.docs.push(structuredClone(doc));
      }
      state.writes.push({ action: "create", count: docs.length });
      return structuredClone(docs);
    },
    async update(_pack, docs) {
      if (state.hooks.update) await state.hooks.update(docs);
      for (const doc of docs) merge(state.docs.find(other => other._id === doc._id), doc);
      state.writes.push({ action: "update", count: docs.length });
      return structuredClone(docs);
    },
    async saveSummary(summary) { state.summaries.push(structuredClone(summary)); }
  };
  return { adapter, state };
}
