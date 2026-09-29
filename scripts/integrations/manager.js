import { MODULE_ID } from "../constants.js";

/** The only gateway to external modules. Adapters own all module-specific API/schema knowledge. */
export class IntegrationManager {
  #adapters=new Map();
  #tail=Promise.resolve();
  register(adapter) {
    if(!adapter||!/^[-a-z0-9]+$/.test(adapter.id)||this.#adapters.has(adapter.id)||!adapter.moduleId||!adapter.name||typeof adapter.available!=="function"||!adapter.actions)throw Error("Invalid or duplicate integration adapter.");
    for(const action of Object.values(adapter.actions))if(typeof action!=="function")throw Error("Integration actions must be functions.");
    this.#adapters.set(adapter.id,adapter);
  }
  status(id) {
    const adapter=this.#adapters.get(id), module=globalThis.game?.modules?.get(adapter?.moduleId);
    const enabled=globalThis.game?.settings?.get(MODULE_ID,"integrations")?.[id]!==false;
    let reason=!adapter?"Adapter not registered":!module?"Module not installed":!module.active?"Module is disabled":!enabled?"Disabled in Devil's Table":"";
    if(!reason)try {if(!adapter.available())reason="Required API is unavailable or incompatible";}catch {reason="Required API is unavailable or incompatible";}
    return {id,name:adapter?.name??id,moduleId:adapter?.moduleId,installed:Boolean(module),active:Boolean(module?.active),enabled,available:!reason,reason,actions:Object.keys(adapter?.actions??{})};
  }
  list(){return [...this.#adapters.keys()].map(id=>this.status(id));}
  async execute(id,action,context) {
    if(!game.user?.isGM||(game.users?.activeGM&&game.users.activeGM.id!==game.user.id))throw Error("Only the active GM may execute integration actions.");
    // Serialize external writes across merchants, including shared doors and scheduled checkout.
    const operation=this.#tail.then(async()=>{
      if(!game.user?.isGM||(game.users?.activeGM&&game.users.activeGM.id!==game.user.id))throw Error("GM authority changed before integration execution.");
      const status=this.status(id);
      if(!status.available)return {status:"skipped",reason:status.reason};
      const actions=this.#adapters.get(id)?.actions;
      const handler=actions&&Object.hasOwn(actions,action)?actions[action]:null;
      if(!handler)return {status:"skipped",reason:"Integration action is not registered"};
      try{return {status:"completed",result:await handler(context)};}
      catch(error){return {status:"needs-attention",error:error.message};}
    });
    this.#tail=operation.catch(()=>{});
    return operation;
  }
}
export const integrationManager=new IntegrationManager();
