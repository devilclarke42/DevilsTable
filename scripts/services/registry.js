import { validateActions } from "./actions.js";
import { coinValue } from "../merchant/model.js";
import { percent } from "../merchant/pricing.js";
const slug = value => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const text = (value, max=1600) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const list = value => Array.isArray(value) && value.every(slug) && new Set(value).size === value.length;
/** Plain JSON only. No Items, inline scripts, predicates or world mutations. */
export function validateService(row, categories) {
  if (!row || Object.keys(row).some(k=>!["id","name","description","icon","category","catalogues","price","modifier","availability","requirements","execution","tags","maxQuantity","recommendedRange","saleUnit","duration","actions","accommodation"].includes(k)) || !/^DT_SERVICE_[A-Z0-9_]+$/.test(row.id) || !text(row.name,160) || !text(row.description) ||
      !/^(icons|modules|systems)\/[\w./-]+\.(webp|svg|png|jpg)$/.test(row.icon??"") || row.icon.includes("..") ||
      !categories.some(c=>c.id===row.category) || !list(row.catalogues) || !row.catalogues.length ||
      coinValue(row.price)===null || !list(row.tags) || !Number.isSafeInteger(row.maxQuantity) || row.maxQuantity<1 || row.maxQuantity>100) throw Error(`Invalid service definition: ${row?.id??"missing ID"}.`);
  for (const key of ["saleUnit","duration"]) if(row[key]!==undefined&&!text(row[key],300))throw Error(`Invalid service ${key}: ${row.id}.`);
  if(row.recommendedRange!==undefined){
    const range=row.recommendedRange,min=coinValue(range?.min),max=coinValue(range?.max),base=coinValue(row.price);
    if(!range||Object.keys(range).some(k=>!["min","max"].includes(k))||min===null||max===null||min>max||base<min||base>max)throw Error(`Invalid recommended price range: ${row.id}.`);
  }
  if(row.accommodation!==undefined&&typeof row.accommodation!=="boolean")throw Error("Invalid accommodation capability.");
  validateActions(row.actions);
  percent(row.modifier??0);
  const a=row.availability??{};
  if (Object.keys(a).some(k=>!["settlements","prosperities","profiles"].includes(k)) || Object.values(a).some(v=>!list(v))) throw Error(`Invalid availability: ${row.id}.`);
  const r=row.requirements??{};
  if(Object.keys(r).some(k=>!["minLevel","actorTypes","note"].includes(k)) ||
    (r.minLevel!==undefined&&(!Number.isSafeInteger(r.minLevel)||r.minLevel<0||r.minLevel>20)) ||
    (r.actorTypes!==undefined&&!list(r.actorTypes)) || (r.note!==undefined&&!text(r.note))) throw Error(`Invalid requirements: ${row.id}.`);
  const e=row.execution??{};
  if(Object.keys(e).some(k=>!["macro","journal","rollTable","activeEffect"].includes(k)) ||
    Object.values(e).some(v=>!text(v,300)||!/^\w[\w.-]+$/.test(v))) throw Error(`Execution references must be document UUIDs: ${row.id}.`);
  return structuredClone(row);
}
export class ServiceRegistry {
  #categories=[]; #services=[];
  register(bundle) {
    if(!bundle || typeof bundle!=="object" || Array.isArray(bundle) || Object.keys(bundle).some(k=>!["categories","services"].includes(k)) || !Array.isArray(bundle.categories) || !Array.isArray(bundle.services)) throw Error("Service bundles require categories and services arrays.");
    const {categories,services}=bundle;
    const cats=[...this.#categories,...structuredClone(categories)];
    if(cats.some(c=>!c || Object.keys(c).some(k=>!["id","name","catalogues"].includes(k)) || !slug(c.id)||!text(c.name,100)||!list(c.catalogues)||!c.catalogues.length)||new Set(cats.map(c=>c.id)).size!==cats.length) throw Error("Invalid or duplicate service category.");
    const rows=[...this.#services,...services.map(row=>validateService(row,cats))];
    if(new Set(rows.map(r=>r.id)).size!==rows.length) throw Error("Duplicate permanent service ID.");
    if(rows.some(r=>r.catalogues.some(id=>!cats.find(c=>c.id===r.category).catalogues.includes(id)))) throw Error("Service catalogue is not assigned to its category.");
    this.#categories=cats;this.#services=rows;
  }
  categories(){return structuredClone(this.#categories);}
  list(){return structuredClone(this.#services);}
  get(id){return structuredClone(this.#services.find(r=>r.id===id)??null);}
}
export const serviceRegistry=new ServiceRegistry();
const providers=[];
let ready=false;
export function registerServiceProvider(bundle){if(ready)throw Error("Register services during setup, before ready.");providers.push(structuredClone(bundle));}
export async function initialiseServices(readJson){
  const bundle=await readJson("data/services.json");
  for(const source of [bundle,...providers]) serviceRegistry.register(source);
  ready=true;
}
