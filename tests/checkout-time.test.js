import test from "node:test";
import assert from "node:assert/strict";
import { rentalEnd,validateCheckoutTime } from "../scripts/services/checkout-time.js";
const time=(hour,minute=0,offset=0)=>({worldTime:offset+hour*3600+minute*60,
 calendar:{days:{hoursPerDay:24,minutesPerHour:60,secondsPerMinute:60},timeToComponents:()=>({hour,minute,second:0})}});
test("one night checks out next date at ten, regardless of arrival before or after ten",()=>{
 for(const hour of [0,8,10,20,23])assert.equal(rentalEnd(1,"10:00",time(hour)),34*3600);
 assert.equal(rentalEnd(3,"10:00",time(20)),82*3600);
 assert.equal(rentalEnd(7,"11:30",time(20)),(7*24+11.5)*3600);
});
test("native clock controls midnight; epoch offset and midnight checkout are preserved",()=>{
 assert.equal(rentalEnd(1,"00:00",time(20,15,123)),24*3600+123);
 const t=time(49);t.worldTime=49*3600;
 assert.equal(rentalEnd(1,"10:00",t),82*3600);
});
test("clock validation rejects invalid values and supports custom native days",()=>{
 for(const value of [null,"", "10am","24:00","10:60","-1:00"])assert.throws(()=>validateCheckoutTime(value,time(0)));
 const custom={worldTime:100,components:{hour:1,minute:1,second:10},calendar:{days:{hoursPerDay:10,minutesPerHour:2,secondsPerMinute:30}}};
 assert.equal(rentalEnd(3,"09:00",custom),2340);
 assert.throws(()=>rentalEnd(1,"10:00",custom),/outside/);
 assert.throws(()=>rentalEnd(0,"09:00",custom),/nights/);
 assert.throws(()=>rentalEnd(1,"10:00",{worldTime:1}),/components/);
});
