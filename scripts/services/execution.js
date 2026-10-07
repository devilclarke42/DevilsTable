import { logger } from "../core/logger.js";
import { integrationManager } from "../integrations/manager.js";
import { validateActions } from "./actions.js";
const types={macro:"Macro",journal:"JournalEntry",rollTable:"RollTable",activeEffect:"ActiveEffect",grantItem:"Item"};
/** Preserve legacy preflight checks. New optional jobs resolve documents only after payment. */
export async function prepareServiceExecution(quote){
  const jobs=[];
  for(const row of quote.basket.filter(r=>r.kind==="service")) {
    const base={serviceId:row.serviceId,name:row.name,quantity:row.quantity,...(row.targetItemId?{targetItemId:row.targetItemId,targetItemName:row.targetItemName}:{}),...(row.accommodation?{checkoutTime:row.checkoutTime}: {})};
    for(const [kind,uuid] of Object.entries(row.execution??{})){
      const doc=await fromUuid(uuid);
      if(!doc||doc.documentName!==types[kind])throw Error(`${row.name}: missing or incorrect ${kind} document.`);
      if(kind==="macro"&&!doc.canExecute)throw Error(`${row.name}: GM cannot execute this macro.`);
      jobs.push({...base,kind,uuid});
    }
    for(const action of validateActions(row.actions,{max:22}))jobs.push({...base,...action});
  }
  return jobs;
}
async function executeNative(job,character,merchant){
  const target=await fromUuid(job.uuid);
  if(!target||target.documentName!==types[job.kind])throw Error("Execution document is missing or has the wrong type.");
  if(job.kind==="macro"){if(!target.canExecute)throw Error("GM cannot execute this macro.");await target.execute({actor:character,merchant,service:structuredClone(job)});}
  if(job.kind==="journal")await target.sheet.render({force:true});
  if(job.kind==="rollTable"){const result=await target.draw({displayChat:false});return (result.results??[]).map(r=>r.description??r.text??r.name??"Result").join("; ").slice(0,4000);}
  if(job.kind==="activeEffect"||job.kind==="grantItem"){
    const data=target.toObject();delete data._id;delete data._stats;delete data.folder;delete data.ownership;
    if(job.kind==="activeEffect")data.origin=job.uuid;
    else {if(!Number.isFinite(data.system?.quantity))throw Error("Grant Item requires a physical Item with quantity.");data.system.quantity=job.quantity;data.system.container=null;}
    const created=await character.createEmbeddedDocuments(types[job.kind],[data]);if(created?.length!==1)throw Error("Native service action did not create its document.");return created.map(doc=>doc.uuid);
  }
}
/** Receipt attempt markers precede side effects. Failed or interrupted jobs are never replayed automatically.
 * Stop applies to remaining optional jobs, not settled money, delivered goods or transaction history.
 */
export async function executeServiceJobs(record,doc,character,merchant,save){
  if(!game.user?.isGM||(game.users?.activeGM&&game.users.activeGM.id!==game.user.id))throw Error("Only the active GM may fulfil paid services.");
  for(const job of record.serviceExecution??[]){
    if(job.status!=="pending")continue;
    job.status="attempted";
    try{
      await save(doc,record);
      if(job.kind==="integration"){
        const result=await integrationManager.execute(job.integration,job.action,{job,record,receipt:doc,character,merchant});
        if(result.status==="needs-attention")throw Error(result.error);
        job.status=result.status;job.result=result.result??result.reason;
        if(result.status==="skipped")globalThis.ui?.notifications?.warn?.(`${job.name}: ${job.integration} skipped — ${result.reason}. The service is still paid and recorded.`);
      }else{job.result=await executeNative(job,character,merchant);job.status="completed";}
    }catch(error){job.status="needs-attention";job.error=error.message;logger.error("Paid service execution needs GM attention",{service:job.serviceId,error:error.message});
      globalThis.ui?.notifications?.warn?.(`${job.name} was paid, but its ${job.kind} needs GM attention. Inspect the receipt; do not buy again to retry.`);
    }
    if(job.status==="needs-attention"&&job.onFailure==="stop")for(const remaining of record.serviceExecution)if(remaining.status==="pending"){remaining.status="blocked";remaining.error="An earlier optional action requested stop on failure.";}
    try{await save(doc,record);}catch(error){logger.error("Service execution audit save failed",error);break;}
  }
}
