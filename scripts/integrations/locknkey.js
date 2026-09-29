import { validateRoom } from "./room.js";
import { MODULE_ID } from "../constants.js";
import { ensureBooking,bookingData,saveBooking } from "./bookings.js";
const api=()=>game.modules.get("LocknKey")?.api?.LnKFlags;
const codes=door=>String(api().KeyIDs(door)??"").split(";").filter(Boolean);
/** Upstream linkKeyLock does not await its writes. Use its public reader and verified flag schema
 * for awaited updates, retaining every unrelated access code. Never change lock/door states.
 */
async function writeCodes(door,values){await door.setFlag("LocknKey","IDKeysFlag",values.join(";"));if(codes(door).join(";")!==values.join(";"))throw Error("Lock & Key access-code verification failed.");}
async function grant(context) {
  const {job,character}=context, doors=[];validateRoom(job.config);
  for(const uuid of job.config.doors){const door=await fromUuid(uuid);if(door?.documentName!=="Wall"||!door.door||!api().isLockable(door))throw Error(`Configured door is missing or not Lock & Key enabled: ${uuid}`);doors.push(door);}
  const doc=await ensureBooking(context),data=bookingData(doc);
  if(data.key)throw Error("This booking already has a key attempt. Inspect it before recovery.");
  const code=`DT${foundry.utils.randomID(24)}`;
  data.key={code,doors:job.config.doors,itemUuid:null,status:"attempted"};await saveBooking(doc,data);
  for(const door of doors)await writeCodes(door,[...codes(door),code]);
  const [item]=await character.createEmbeddedDocuments("Item",[{name:job.config.keyName.trim()||`${job.config.name} Key`,type:"loot",img:"icons/svg/key.svg",
    system:{quantity:1,weight:{value:0,units:"lb"},price:{value:0,denomination:"cp"}},
    flags:{LocknKey:{IDKeysFlag:code},[MODULE_ID]:{rentalKey:{bookingUuid:doc.uuid}}}}]);
  if(!item)throw Error("Room key was not created.");
  data.key.itemUuid=item.uuid;data.key.status="active";await saveBooking(doc,data);
  return {bookingUuid:doc.uuid,keyUuid:item.uuid};
}
async function revoke({booking}) {
  const data=bookingData(booking);if(!data.key)return {revoked:false};
  for(const uuid of data.key.doors){const door=await fromUuid(uuid);if(!door)continue;await writeCodes(door,codes(door).filter(code=>code!==data.key.code));}
  // Removing the unique door grant revokes transferred/copied keys too. Do not delete unrelated Items.
  const key=data.key.itemUuid?await fromUuid(data.key.itemUuid):null;
  if(key?.getFlag(MODULE_ID,"rentalKey")?.bookingUuid===booking.uuid)await key.delete();
  data.key.status="revoked";await saveBooking(booking,data);return {revoked:true};
}
export const locknkeyAdapter={id:"locknkey",name:"Lock & Key",moduleId:"LocknKey",available:()=>typeof api()?.KeyIDs==="function"&&typeof api()?.isLockable==="function",actions:{"room-key":grant,"revoke-room-key":revoke}};
