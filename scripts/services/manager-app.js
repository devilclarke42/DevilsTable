import { ServicePanel } from "./panel.js";
const { ApplicationV2, HandlebarsApplicationMixin }=foundry.applications.api;
/** Compatibility entry point; the primary service editor lives in the Builder Services tab. */
export class MerchantServicesApplication extends HandlebarsApplicationMixin(ApplicationV2){
  #panel;#busy=false;
  constructor(actor,options={}){super(options);this.#panel=new ServicePanel(actor);}
  static DEFAULT_OPTIONS={id:"devils-table-services",classes:["devils-table"],tag:"section",position:{width:760,height:680},window:{title:"Merchant Services",resizable:true},actions:{saveServices:MerchantServicesApplication.#save,generateServices:MerchantServicesApplication.#generate,saveServiceDefinitions:MerchantServicesApplication.#definitions}};
  static PARTS={body:{template:"modules/devils-table/templates/merchant-services.hbs"}};
  async _prepareContext(options){if(!game.user.isGM)throw Error("Service administration is GM-only.");return {...await super._prepareContext(options),...this.#panel.context(this.#busy)};}
  _onRender(context,options){super._onRender?.(context,options);this.#panel.bind(this.element);}
  async #run(action){if(this.#busy)return;this.#busy=true;try{await action();}catch(error){ui.notifications.error(error.message);}finally{this.#busy=false;if(this.rendered)await this.render();}}
  static async #save(){await this.#run(()=>this.#panel.save());}
  static async #generate(){await this.#run(()=>this.#panel.generate());}
  static async #definitions(){await this.#run(()=>this.#panel.saveDefinitions());}
}
