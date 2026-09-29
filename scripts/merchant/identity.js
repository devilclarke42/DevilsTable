import { MODULE_ID } from "../constants.js";
import { withAdministration } from "./operation-guard.js";
import { stable } from "./trade-model.js";

export const IDENTITY_VERSION = 1;
const fallbackPortrait = "icons/svg/mystery-man.svg";
const plain = (value, limit = 1600) => typeof value === "string" ? value.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,limit) : "";
const label = (value, config) => {
  const entry = config?.[value], key = typeof entry === "string" ? entry : entry?.label;
  return plain(key ? globalThis.game?.i18n?.localize?.(key) ?? key : value);
};
const slug = value => plain(value,100).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"");

/** D&D5e 5.3.3 adapter. Reads prepared native fields; never infers class from CR or NPC name.
 * details.race is a LocalDocumentField (an Item or a fallback string), not a cached merchant field.
 */
export function actorIdentity(actor, { scenes = globalThis.game?.scenes ?? [] } = {}) {
  const details = actor?.system?.details ?? {}, traits = actor?.system?.traits ?? {};
  const items = [...(actor?.items ?? [])];
  const race = details.race;
  const species = plain(typeof race === "string" ? actor?.items?.get?.(race)?.name ?? race : race?.name)
    || items.filter(item=>item.type === "race").map(item=>plain(item.name)).join(", ");
  const type = details.type;
  const creature = typeof type === "string" ? label(type,globalThis.CONFIG?.DND5E?.creatureTypes)
    : type?.value === "custom" ? plain(type.custom) : label(type?.value,globalThis.CONFIG?.DND5E?.creatureTypes);
  const classes = items.filter(item=>item.type === "class").map(item=>({name:plain(item.name),levels:item.system?.levels}));
  const size = label(traits.size,globalThis.CONFIG?.DND5E?.actorSizes);
  const alignment = plain(details.alignment);
  const tags = [species && {kind:"species",value:species},creature && {kind:"creature",value:typeof type==="string"?type:type?.value==="custom"?type.custom:type?.value,label:creature},
    size && {kind:"size",value:traits.size,label:size},alignment && {kind:"alignment",value:alignment},
    ...classes.map(row=>({kind:"class",value:row.name}))].filter(Boolean)
    .map(row=>({id:`system:${row.kind}:${slug(row.value)}`,label:`${row.kind}: ${row.label??row.value}`}));
  const tokens = [];
  for(const scene of scenes)for(const token of scene.tokens??[])if(actor?.id&&token.actorId === actor.id) {
    tokens.push(`${plain(scene.name)||scene.id}: ${plain(token.name)||"Unnamed token"}${token.actorLink===false?" (unlinked)":""}`);
  }
  const prototype = actor?.prototypeToken;
  return {name:plain(actor?.name,160),portrait:plain(actor?.img,1000)||fallbackPortrait,species,creature,
    classes:classes.map(row=>`${row.name}${Number.isFinite(row.levels)?` ${row.levels}`:""}`).join(", "),size,alignment,
    biography:plain(details.biography?.value,1200),
    prototypeToken:plain(prototype?.name,160),tokenImage:plain(prototype?.texture?.src,1000),
    tokens:tokens.join("; "),systemTags:tags};
}

export function readMerchantIdentity(actor) {
  const own = actor?.getFlag?.(MODULE_ID,"merchant.identity") ?? {};
  return {schemaVersion:IDENTITY_VERSION,businessName:plain(own.businessName,160),merchantTitle:plain(own.merchantTitle,160),
    merchantTags:Array.isArray(own.merchantTags)?own.merchantTags.filter(t=>typeof t==="string"):[],
    publicDescription:typeof own.publicDescription==="string"?own.publicDescription:"",
    shopDescription:typeof own.shopDescription==="string"?own.shopDescription:""};
}
export function validateMerchantIdentity(input) {
  const keys=["schemaVersion","businessName","merchantTitle","merchantTags","publicDescription","shopDescription"];
  if(!input||typeof input!=="object"||Object.keys(input).some(k=>!keys.includes(k))||input.schemaVersion!==IDENTITY_VERSION)throw Error("Invalid merchant identity fields. Actor information is read-only.");
  for(const [key,max] of [["businessName",160],["merchantTitle",160],["publicDescription",2000],["shopDescription",2000]]) {
    if(typeof input[key]!=="string"||input[key].length>max||/<[^>]*>/.test(input[key]))throw Error(`${key} must be plain text, at most ${max} characters.`);
  }
  if(!Array.isArray(input.merchantTags)||input.merchantTags.length>50||input.merchantTags.some(t=>typeof t!=="string"||t.length>60||!t.trim()||t.includes(":")))throw Error("Use up to 50 Merchant Tags, each at most 60 characters. System tag namespaces are read-only.");
  const tags=[...new Set(input.merchantTags.map(slug))];
  if(tags.some(t=>!t))throw Error("Merchant tags need letters or numbers.");
  return {...input,businessName:input.businessName.trim(),merchantTitle:input.merchantTitle.trim(),
    publicDescription:input.publicDescription.trim(),shopDescription:input.shopDescription.trim(),merchantTags:tags};
}
export const identitySnapshot = actor => stable(actor?.getFlag?.(MODULE_ID,"merchant.identity")??null);
export async function saveMerchantIdentity(actor,input,expected) {
  const value=validateMerchantIdentity(input);
  return withAdministration(actor,async()=>{
    if(identitySnapshot(actor)!==expected)throw Error("Merchant identity changed in another window. Reload before saving.");
    await actor.setFlag(MODULE_ID,"merchant.identity",value);
    if(stable(actor.getFlag(MODULE_ID,"merchant.identity"))!==stable(value))throw Error("Identity read-back failed. Reload and inspect the merchant.");
    return value;
  });
}
/** Explicit player-visible business fields only. Never spread system tags, biography or private flags. */
export function publicMerchantIdentity(actor) {
  const {businessName,merchantTitle,publicDescription,shopDescription}=readMerchantIdentity(actor);
  return {businessName,merchantTitle,publicDescription,shopDescription};
}

/** Caller paints only read-only nodes so native changes do not discard unsaved Builder input. */
export function subscribeActorIdentity(actorId,refresh) {
  if(!globalThis.Hooks?.on)return ()=>{};
  const registrations=[];
  const on=(event,fn)=>registrations.push([event,Hooks.on(event,fn)]);
  on("updateActor",doc=>{if(doc.id===actorId())refresh();});
  for(const type of ["Item","ActiveEffect"])for(const event of ["create","update","delete"])on(`${event}${type}`,doc=>{
    const parent=doc.parent?.documentName==="Item"?doc.parent.parent:doc.parent;
    if(parent?.id===actorId())refresh();
  });
  for(const event of ["createToken","updateToken","deleteToken"])on(event,doc=>{if(doc.actorId===actorId())refresh();});
  for(const event of ["updateScene","deleteScene"])on(event,()=>refresh());
  return ()=>{for(const [event,id] of registrations)Hooks.off(event,id);};
}
