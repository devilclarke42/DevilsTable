import { validateRoom } from "./room.js";
import { ensureBooking,bookingData,saveBooking } from "./bookings.js";
const api=()=>globalThis.CALENDARIA?.api;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function schedule(context){
  validateRoom(context.job.config);
  const doc=await ensureBooking(context),data=bookingData(doc);
  if(data.calendar)throw Error("This booking already has a calendar attempt. Inspect the booking before recovery.");
  const start=api().timestampToDate(data.start),end=api().timestampToDate(data.end);
  if(!start||!end)throw Error("Calendaria has no active calendar.");
  data.calendar={status:"attempted",notes:[]};await saveBooking(doc,data);
  const content=`<p>${escape(context.character.name)} — ${escape(data.room.name)}. ${data.room.days} calendar days. Quantity: ${data.quantity}. This is a paid service record, not a capacity reservation.</p>`;
  for(const [name,startDate,endDate] of [[`Check-in — ${data.room.name}`,start,end],[`Check-out — ${data.room.name}`,end,undefined]]){
    const note=await api().createNote({name,content,startDate,endDate,allDay:false,visibility:"secret",subjects:[context.character.uuid,context.merchant.uuid].filter(Boolean),reminderType:"toast",reminderTargets:"gm",openSheet:false});
    if(!note?.uuid)throw Error("Calendaria did not create a booking note.");
    data.calendar.notes.push(note.uuid);await saveBooking(doc,data);
  }
  data.calendar.status="completed";await saveBooking(doc,data);return {bookingUuid:doc.uuid,noteUuids:data.calendar.notes};
}
export const calendariaAdapter={id:"calendaria",name:"Calendaria",moduleId:"calendaria",available:()=>typeof api()?.createNote==="function"&&typeof api()?.timestampToDate==="function",actions:{"room-booking":schedule}};
