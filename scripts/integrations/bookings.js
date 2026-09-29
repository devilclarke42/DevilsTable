import { MODULE_ID } from "../constants.js";
const read=doc=>doc.getFlag(MODULE_ID,"booking");
export function bookings(){return [...(game.journal??[])].filter(doc=>read(doc)?.schemaVersion===1);}
export async function saveBooking(doc,booking){await doc.setFlag(MODULE_ID,"booking",structuredClone(booking));}
/** Private world journals survive receipt retention. Booking data is references and access leases, not stock. */
export async function ensureBooking({record,receipt,job,merchant,character}) {
  const id=`${record.id}:${job.serviceId}`, existing=bookings().find(doc=>read(doc).id===id);
  if(existing)return existing;
  const room=job.config;
  const day=game.time?.calendar?.days;
  const secondsPerDay=(day?.hoursPerDay??24)*(day?.minutesPerHour??60)*(day?.secondsPerMinute??60);
  if(!Number.isFinite(secondsPerDay)||secondsPerDay<=0)throw Error("Calendar day length is invalid.");
  const start=game.time?.worldTime;
  if(!Number.isFinite(start))throw Error("Foundry world time is unavailable.");
  const data={schemaVersion:1,id,receiptUuid:receipt.uuid,merchantId:merchant.id,characterId:character.id,serviceId:job.serviceId,
    room:structuredClone(room),quantity:job.quantity,start,end:start+room.days*secondsPerDay,state:"active",key:null,calendar:null};
  return JournalEntry.create({name:`Room booking — ${room.name}`,ownership:{default:0},flags:{[MODULE_ID]:{booking:data}}});
}
export const bookingData=doc=>structuredClone(read(doc));
