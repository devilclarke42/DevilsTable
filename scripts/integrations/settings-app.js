import { calendarClock } from "../services/checkout-time.js";
import { MODULE_ID } from "../constants.js";
import { integrationManager } from "./manager.js";
import { bookings,bookingData } from "./bookings.js";
import { checkoutBooking } from "./lifecycle.js";
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
export class IntegrationSettingsApplication extends HandlebarsApplicationMixin(ApplicationV2){
  #busy=false;
  static DEFAULT_OPTIONS={id:"devils-table-integrations",classes:["devils-table"],tag:"section",position:{width:740,height:650},window:{title:"Devil's Table — Integrations",resizable:true},actions:{save:IntegrationSettingsApplication.#save,checkout:IntegrationSettingsApplication.#checkout}};
  static PARTS={body:{template:"modules/devils-table/templates/integrations.hbs"}};
  async _prepareContext(options){
    if(!game.user?.isGM)throw Error("Integration administration is GM-only.");
    return {...await super._prepareContext(options),busy:this.#busy,integrations:integrationManager.list(),bookings:bookings().map(doc=>{const b=bookingData(doc),remaining=(b.end-game.time.worldTime)/calendarClock().daySeconds;return {uuid:doc.uuid,...b,characterName:game.actors.get(b.characterId)?.name??b.characterId,merchantName:game.actors.get(b.merchantId)?.name??b.merchantId,due:remaining>0?`In ${remaining.toFixed(1)} calendar days`:"Due now"};}).filter(b=>b.state!=="closed")};
  }
  async #run(operation){if(this.#busy)return;this.#busy=true;try{if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)throw Error("Only the active GM may administer integrations.");await operation();}catch(error){ui.notifications.error(error.message);}finally{this.#busy=false;if(this.rendered)await this.render();}}
  static async #save(){const values=Object.fromEntries([...this.element.querySelectorAll('[data-integration]')].map(el=>[el.dataset.integration,el.checked]));await this.#run(()=>game.settings.set(MODULE_ID,"integrations",values));}
  static async #checkout(_event,target){await this.#run(async()=>{
    const doc=bookings().find(row=>row.uuid===target.dataset.booking);if(!doc)throw Error("Booking no longer exists.");
    if(await foundry.applications.api.DialogV2.confirm({window:{title:"Check out this room?"},content:"<p>Close the booking and revoke its rental access unless Persistent Key is selected? Calendar notes and paid history remain.</p>",modal:true,rejectClose:false}))await checkoutBooking(doc,{manual:true});
  });}
}
