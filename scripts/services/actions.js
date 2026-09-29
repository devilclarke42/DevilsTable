const reference=value=>typeof value==="string"&&value.length<=300&&/^\w[\w.-]+$/.test(value);
/** Currency settlement and receipt recording are mandatory pipeline stages, never optional jobs. */
export function validateActions(actions,{max=20}={}) {
  if(actions===undefined)return [];
  if(!Array.isArray(actions)||actions.length>max)throw Error(`Service actions must be an array of at most ${max} actions.`);
  for(const row of actions) {
    if(!row||!['macro','journal','rollTable','activeEffect','grantItem','integration'].includes(row.kind)||Object.keys(row).some(k=>!["kind","uuid","integration","action","config","onFailure"].includes(k))||
      (row.onFailure!==undefined&&!["continue","stop"].includes(row.onFailure)))throw Error("Invalid service action.");
    if(row.kind==='integration') {
      if(!/^[a-z0-9-]+$/.test(row.integration??'')||!/^[a-z0-9-]+$/.test(row.action??'')||row.uuid!==undefined||row.config===null||typeof(row.config??{})!=="object"||Array.isArray(row.config))throw Error("Invalid integration action.");
      if(JSON.stringify(row.config??{}).length>16000)throw Error("Integration action configuration is too large.");
    } else if(!reference(row.uuid)||row.integration!==undefined||row.action!==undefined||row.config!==undefined)throw Error("Native actions require a document UUID.");
  }
  return structuredClone(actions);
}
