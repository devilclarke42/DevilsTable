import { MODULE_ID } from "../constants.js";
export const DEFAULT_CHECKOUT_TIME = "10:00";
export function calendarClock(time = globalThis.game?.time) {
  const days = time?.calendar?.days;
  const clock = { hours: days?.hoursPerDay ?? 24, minutes: days?.minutesPerHour ?? 60, seconds: days?.secondsPerMinute ?? 60 };
  if (Object.values(clock).some(n => !Number.isSafeInteger(n) || n <= 0)) throw Error("Calendar clock units are invalid.");
  return { ...clock, daySeconds: clock.hours * clock.minutes * clock.seconds };
}
/** Clock text is portable; its bounds follow the active Foundry calendar. */
export function validateCheckoutTime(value, time = globalThis.game?.time) {
  const clock = calendarClock(time);
  if (typeof value !== "string" || !/^\d{2,3}:\d{2,3}$/.test(value)) throw Error("Checkout time must use HH:mm, for example 10:00.");
  const [hour, minute] = value.split(":").map(Number);
  if (hour >= clock.hours || minute >= clock.minutes) throw Error("Checkout time is outside the active calendar's day. Set a valid merchant checkout time.");
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
export const merchantCheckoutTime = actor => actor?.getFlag(MODULE_ID, "merchant.settings")?.checkoutTime ?? DEFAULT_CHECKOUT_TIME;
/** One night ends on the following calendar date, including arrivals before checkout hour.
 * Use native components, rather than assuming world-time zero is local midnight.
 */
export function rentalEnd(nights, checkoutTime, time = globalThis.game?.time) {
  if (!Number.isSafeInteger(nights) || nights < 1 || nights > 365) throw Error("Rental nights must be between 1 and 365.");
  const value = validateCheckoutTime(checkoutTime, time), clock = calendarClock(time), start = time?.worldTime;
  if (!Number.isFinite(start)) throw Error("Foundry world time is unavailable.");
  const parts = time.calendar?.timeToComponents?.(start) ?? time.components;
  if (!parts || [parts.hour, parts.minute, parts.second].some(n => !Number.isFinite(n) || n < 0)) throw Error("Foundry calendar clock components are unavailable.");
  // Native calendars may expose hours completed within the year; reduce to time of day.
  const elapsed = ((parts.hour % clock.hours) * clock.minutes + parts.minute) * clock.seconds + parts.second;
  const [hour, minute] = value.split(":").map(Number);
  return start - elapsed + nights * clock.daySeconds + (hour * clock.minutes + minute) * clock.seconds;
}
