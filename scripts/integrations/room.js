/** Merchant-local accommodation mapping; no external data or module imports. */
export function validateRoom(room) {
  if(room===undefined)return undefined;
  if(!room||Object.keys(room).some(k=>!["name","doors","keyName","expiry","days","key","calendar"].includes(k))||typeof room.name!=="string"||!room.name.trim()||room.name.length>160||typeof room.keyName!=="string"||room.keyName.length>160||
    !Array.isArray(room.doors)||room.doors.length>30||new Set(room.doors).size!==room.doors.length||room.doors.some(id=>!/^Scene\.[\w-]+\.Wall\.[\w-]+$/.test(id))||
    !["persistent","checkout","manual"].includes(room.expiry)||!Number.isSafeInteger(room.days)||room.days<1||room.days>365||typeof room.key!=="boolean"||typeof room.calendar!=="boolean")throw Error("Invalid room configuration. Use a name, unique Wall UUIDs, 1–365 days and an expiry policy.");
  if(room.key&&!room.doors.length)throw Error("Select at least one door for a room key.");
  return structuredClone(room);
}
export function roomActions(room) {
  if(!room)return [];
  return [...(room.key?[{kind:"integration",integration:"locknkey",action:"room-key",config:room}]:[]),
    ...(room.calendar?[{kind:"integration",integration:"calendaria",action:"room-booking",config:room}]:[])];
}
