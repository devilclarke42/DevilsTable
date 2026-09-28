import { logger } from "../core/logger.js";
/** Validate all optional documents before charging. UUIDs originate only in GM definitions. */
export async function prepareServiceExecution(quote){
  const types={macro:"Macro",journal:"JournalEntry",rollTable:"RollTable",activeEffect:"ActiveEffect"};
  const jobs=[];
  for(const row of quote.basket.filter(r=>r.kind==="service"))for(const [kind,uuid] of Object.entries(row.execution??{})){
    const doc=await fromUuid(uuid);
    if(!doc||doc.documentName!==types[kind])throw Error(`${row.name}: missing or incorrect ${kind} document.`);
    if(kind==="macro"&&!doc.canExecute)throw Error(`${row.name}: GM cannot execute this macro.`);
    jobs.push({serviceId:row.serviceId,name:row.name,quantity:row.quantity,kind,uuid});
  }
  return jobs;
}
/** Commit payment first. Persist an attempted marker BEFORE each external action.
 * Never automatically replay an action after a crash: arbitrary macros are not reversible.
 * Each configured integration runs once per service line; quantity is available to macros.
 */
export async function executeServiceJobs(record,doc,character,merchant,save){
  for(const job of record.serviceExecution??[]){
    if(job.status!=="pending")continue;
    job.status="attempted";
    try{
      await save(doc,record);
      const target=await fromUuid(job.uuid);
      if(!target)throw Error("Execution document was removed after payment.");
      if(job.kind==="macro")await target.execute({actor:character,merchant,service:structuredClone(job)});
      if(job.kind==="journal")await target.sheet.render({force:true}); // GM decides whether to share private journals.
      if(job.kind==="rollTable"){ const result=await target.draw({displayChat:false}); job.result=(result.results??[]).map(r=>r.description??r.text??r.name??"Result").join("; ").slice(0,4000); }
      if(job.kind==="activeEffect"){
        const data=target.toObject();delete data._id;delete data._stats;
        data.origin=job.uuid;
        await character.createEmbeddedDocuments("ActiveEffect",[data]);
      }
      job.status="completed";
    }catch(error){job.status="needs-attention";job.error=error.message;logger.error("Paid service execution needs GM attention",{service:job.serviceId,error:error.message});
      globalThis.ui?.notifications?.warn?.(`${job.name} was paid, but its ${job.kind} needs GM attention. Inspect the receipt; do not buy again to retry.`);
    }
    try{await save(doc,record);}catch(error){logger.error("Service execution audit save failed",error);break;}
  }
}
