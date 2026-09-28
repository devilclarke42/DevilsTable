import { COMPENDIUM_NAMES } from "../../core/compendium-names.js";
import { stable } from "../trade-model.js";
import { MODULE_ID } from "../../constants.js";
import { readModuleJson } from "../../data/catalogue-loader.js";
import { validateConfiguration } from "./model.js";

export async function builtInTemplates({ readJson = readModuleJson } = {}) {
  const rows = await readJson("data/merchant-templates.json");
  if (!Array.isArray(rows) || new Set(rows.map(r => r.id)).size !== rows.length) throw Error("Invalid built-in merchant templates.");
  return rows;
}
export function validateTemplate(row, context) {
  if (row?.schemaVersion !== 1 || typeof row.id !== "string" || !/^[a-z0-9-]{1,100}$/.test(row.id) ||
    typeof row.name !== "string" || !row.name.trim() || row.name.length > 100 ||
    Object.keys(row).some(k => !["schemaVersion","id","name","settings"].includes(k))) throw Error("Invalid merchant template.");
  return { schemaVersion: 1, id: row.id, name: row.name.trim(), settings: validateConfiguration(row.settings, context) };
}
const COLLECTION = "world.devils-table-merchant-templates";
async function templatePack(create = false) {
  if (!game.user.isGM) throw Error("Merchant templates are GM-only.");
  let pack = game.packs.get(COLLECTION);
  if (!pack && create) {
    pack = await foundry.documents.collections.CompendiumCollection.createCompendium({name:"devils-table-merchant-templates",label:COMPENDIUM_NAMES[COLLECTION].label,type:"JournalEntry",package:"world"});
    await pack.configure({locked:false,ownership:{PLAYER:"NONE",TRUSTED:"NONE",ASSISTANT:"OWNER",GAMEMASTER:"OWNER"}});
  }
  if (!pack) return null;
  if (pack.documentName !== "JournalEntry" || pack.metadata.packageType !== "world") throw Error("Invalid merchant template compendium.");
  for (const user of game.users) if (!user.isGM && pack.testUserPermission(user,"LIMITED")) throw Error("Merchant templates must be GM-only. Fix pack ownership before continuing.");
  if (create && pack.locked) await pack.configure({locked:false});
  return pack;
}
export async function customTemplates() {
  const pack = await templatePack();
  if (!pack) return [];
  const index = await pack.getIndex({fields:[`flags.${MODULE_ID}.merchantTemplate`]});
  return [...index.values()].map(row=>structuredClone(row.flags?.[MODULE_ID]?.merchantTemplate)).filter(Boolean);
}
let saving = false;
export async function saveTemplate(name, draft, context) {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) throw Error("Only the active GM may save shared templates.");
  if (saving) throw Error("A template is already being saved.");
  const row = validateTemplate({ schemaVersion: 1, id: crypto.randomUUID(), name, settings: draft }, context);
  saving = true;
  try {
    const rows = await customTemplates();
    if (rows.length >= context.policy.limits.maxTemplates) throw Error("The world template limit has been reached.");
    if (rows.some(r => r.name.toLowerCase() === row.name.toLowerCase())) throw Error("A custom template already uses that name. Choose a distinct name.");
    const pack = await templatePack(true);
    const [doc] = await CONFIG.JournalEntry.documentClass.createDocuments([{name:row.name,
      ownership:{default:0},pages:[],flags:{[MODULE_ID]:{merchantTemplate:row}}}],{pack:pack.collection});
    if (stable(doc?.getFlag(MODULE_ID,"merchantTemplate")) !== stable(row)) throw Error("Template read-back failed. Inspect the template pack before retrying.");
    return row;
  } finally { saving = false; }
}
