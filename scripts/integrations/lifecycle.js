import { diceSoNiceAdapter } from "./dice-so-nice.js";
import { integrationManager } from "./manager.js";
import { bookings,bookingData,saveBooking } from "./bookings.js";
import { locknkeyAdapter } from "./locknkey.js";
import { calendariaAdapter } from "./calendaria.js";
let busy=false;
export function registerBuiltInIntegrations(){integrationManager.register(diceSoNiceAdapter);integrationManager.register(locknkeyAdapter);integrationManager.register(calendariaAdapter);}
export async function checkoutBooking(doc,{manual=false}={}) {
  if(!game.user?.isGM||game.users?.activeGM?.id!==game.user.id)throw Error("Only the active GM may check out a room.");
  let data=bookingData(doc);if(data.state==="closed")return;
  if(data.room.expiry==="manual"&&!manual)return;
  if(data.key&&data.room.expiry!=="persistent") {
    const result=await integrationManager.execute("locknkey","revoke-room-key",{booking:doc});
    if(result.status!=="completed")throw Error(`Key expiry unavailable: ${result.reason??result.error}. Re-enable the integration and check out manually.`);
  }
  data=bookingData(doc);data.state="closed";data.closedAt=game.time.worldTime;delete data.error;await saveBooking(doc,data);
}
export async function expireBookings(){
  if(busy||!game.user?.isGM||game.users?.activeGM?.id!==game.user.id)return;
  busy=true;
  try{for(const doc of bookings()){
    const data=bookingData(doc);if(data.state!=="active"||data.room.expiry!=="checkout"||data.end>game.time.worldTime)continue;
    try{await checkoutBooking(doc);}catch(error){const current=bookingData(doc);current.state="needs-attention";current.error=error.message;await saveBooking(doc,current);ui.notifications.warn(`Room booking: ${error.message}`);}
  }}finally{busy=false;}
}
export function registerBookingHooks(){Hooks.on("updateWorldTime",()=>{void expireBookings().catch(error=>ui.notifications.warn(error.message));});void expireBookings().catch(error=>ui.notifications.warn(error.message));}
