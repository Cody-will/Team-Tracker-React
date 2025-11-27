// scheduleHelpers.ts

import type {
  ScheduleEvent,
  EventType,
  DayEvent,
} from "../pages/context/ScheduleContext";
import type { User } from "../pages/context/UserContext";

export type ShiftName = "Alpha" | "Bravo" | "Charlie" | "Delta";

//
// ──────────────── internal date utilities (not exported) ────────────────
//

function toMidnight(value: number | string): Date {
  const t = typeof value === "number" ? value : new Date(value).getTime() || 0;
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayMidnight(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDaysLocal(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toDayString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Does this event cover the given calendar day ("YYYY-MM-DD")? */
function eventCoversDay(event: ScheduleEvent, day: string): boolean {
  const dayDate = toMidnight(day);
  const start = toMidnight(event.start);
  let end = toMidnight(event.end);
  // FullCalendar all-day events use exclusive end → make it inclusive
  end = addDaysLocal(end, -1);

  const rangeStart = start <= end ? start : end;
  const rangeEnd = end >= start ? end : start;

  return dayDate >= rangeStart && dayDate <= rangeEnd;
}

/** True if event overlaps [today, today + maxDays]. */
function eventInUpcomingWindow(
  event: ScheduleEvent,
  maxDays: number,
  now: Date = new Date()
): boolean {
  const today = todayMidnight(now);
  const windowEnd = addDaysLocal(today, maxDays);

  const start = toMidnight(event.start);
  const end = toMidnight(event.end);

  const rangeStart = start <= end ? start : end;
  const rangeEnd = end >= start ? end : start;

  if (rangeEnd < today) return false; // fully in the past
  if (rangeStart > windowEnd) return false; // starts after window
  return true;
}

/** True if event is not fully in the past. */
function eventIsActiveOrUpcoming(
  event: ScheduleEvent,
  now: Date = new Date()
): boolean {
  const today = todayMidnight(now);
  const end = toMidnight(event.end);
  return end >= today;
}

//
// ──────────────── 1) isWorking (for non-home shifts) ────────────────
//
// For user.Shifts !== shift:
//   We want to know if they're working THIS panel shift TODAY via:
//   - Shift-Swap
//   - Coverage (claimed)
//
// Semantics (corrected):
//   Shift-Swap ScheduleEvent:
//     - originUID = person who is NORMALLY scheduled that day
//     - targetUID = person who is actually working FOR them
//
//   Coverage DayEvent:
//     - originUID = person who normally owns the shift
//     - targetUID = person working the coverage (claimer)
//
// Panel logic:
//   For a panel "Charlie":
//     - Show the *worker* (targetUID) in the panel of the owner (originUID.Shifts === "Charlie").
//

export interface IsWorkingResult {
  isWorking: boolean;
  reason?: EventType;
  workingFor: string; // practically "Shift-Swap" | "Coverage"
}

/**
 * isWorking for when user.Shifts !== shift.
 *
 * @param uid      the user to check
 * @param shift    the shift panel name ("Alpha" | "Bravo" | "Charlie" | "Delta")
 * @param events   schedule events (from ScheduleContext)
 * @param coverage claimed coverage DayEvents
 * @param users    map of uid -> User (from useUser().data)
 */
export function isWorking(
  uid: string,
  shift: ShiftName,
  events: ScheduleEvent[],
  coverage: DayEvent[],
  users: Record<string, User>,
  now: Date = new Date()
): IsWorkingResult {
  const todayStr = toDayString(todayMidnight(now));
  let workingFor: string = "";

  // ── Shift-Swap: worker = targetUID, owner = originUID ─────────────
  const swap = events.find((e) => {
    if (e.eventType !== "Shift-Swap") return false;
    if (!e.originUID || !e.targetUID) return false;
    if (e.targetUID !== uid) return false; // this user is the worker

    const owner = users[e.originUID]; // owner is normally scheduled
    if (!owner) return false;
    if (owner.Shifts !== shift) return false; // panel is owner's shift
    workingFor = e.originUID;

    return eventCoversDay(e, todayStr);
  });

  if (swap) {
    return {
      isWorking: true,
      reason: "Shift-Swap",
      workingFor: workingFor,
    };
  }

  // ── Coverage: worker = targetUID, owner = originUID ────────────────
  const cov = coverage.find((c) => {
    if (c.eventType !== "Coverage") return false;
    if (!c.originUID || !c.targetUID) return false;
    if (c.targetUID !== uid) return false; // this user is the worker

    const owner = users[c.originUID];
    if (!owner) return false;
    if (owner.Shifts !== shift) return false;
    workingFor = c.originUID;

    // DayEvent uses .day as "YYYY-MM-DD"
    return c.day === todayStr;
  });

  if (cov) {
    return {
      isWorking: true,
      reason: "Coverage",
      workingFor,
    };
  }

  return {
    isWorking: false,
    workingFor,
  };
}

//
// ──────────────── 2) getAllRange / getAllNext30OfType ────────────────
//
// These are NOT user-specific. They just return all events of a given type
// that are current or upcoming within a given range.
//

/**
 * Return all events of a given type that:
 *  - are not fully in the past
 *  - AND overlap [today, today + rangeDays]
 *
 * @param type      eventType to filter (e.g. "Vacation", "Shift-Swap")
 * @param rangeDays number of days forward (e.g. 30)
 * @param events    schedule events (ScheduleEvent[] or DayEvent[])
 */
export function getAllRange(
  type: EventType,
  rangeDays: number,
  events: (ScheduleEvent | DayEvent)[],
  now: Date = new Date()
): (ScheduleEvent | DayEvent)[] {
  return events.filter((raw) => {
    const e = raw as ScheduleEvent; // DayEvent is close enough shape-wise
    if (e.eventType !== type) return false;
    return eventInUpcomingWindow(e, rangeDays, now);
  });
}

/**
 * Shortcut: all current or upcoming events of a given type
 * in the next 30 days.
 */
export function getAllNext30OfType(
  type: EventType,
  events: (ScheduleEvent | DayEvent)[],
  now: Date = new Date()
): (ScheduleEvent | DayEvent)[] {
  return getAllRange(type, 30, events, now);
}

//
// ──────────────── 3) isOff (home shift off reasons) ────────────────
//
// isOff(uid, events) → { isOff, type }
//
// For a user's *home* shift panel, we consider them off if they have:
//   - Vacation covering today  → type "Vacation"
//   - Training covering today  → type "Training"
//   - Shift-Swap where they are originUID
//     (they're normally scheduled but someone else works for them) → type "Shift-Swap"
//

export interface IsOffResult {
  isOff: boolean;
  type: "Vacation" | "Training" | "Shift-Swap" | null;
}

/**
 * Returns whether the user is "off" today due to:
 *   - Vacation
 *   - Training
 *   - Shift-Swap (someone else working for them)
 *
 * Semantics:
 *   - Vacation/Training: originUID = the user taking time off
 *   - Shift-Swap: originUID = the user who is normally scheduled
 *
 * @param uid    user id
 * @param events schedule events (from ScheduleContext)
 */
export function isOff(
  uid: string,
  events: ScheduleEvent[],
  now: Date = new Date()
): IsOffResult {
  const todayStr = toDayString(todayMidnight(now));

  // Vacation
  const vacation = events.find(
    (e) =>
      e.originUID === uid &&
      e.eventType === "Vacation" &&
      eventCoversDay(e, todayStr)
  );
  if (vacation) {
    return { isOff: true, type: "Vacation" };
  }

  // Training
  const training = events.find(
    (e) =>
      e.originUID === uid &&
      e.eventType === "Training" &&
      eventCoversDay(e, todayStr)
  );
  if (training) {
    return { isOff: true, type: "Training" };
  }

  // Shift-Swap: they are normally scheduled (originUID),
  // but someone else (targetUID) is working for them.
  const swap = events.find(
    (e) =>
      e.eventType === "Shift-Swap" &&
      e.originUID === uid &&
      eventCoversDay(e, todayStr)
  );
  if (swap) {
    return { isOff: true, type: "Shift-Swap" };
  }

  return { isOff: false, type: null };
}
