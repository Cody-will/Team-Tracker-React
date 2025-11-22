// shiftHelpers.ts

export type ShiftName = "Alpha" | "Bravo" | "Charlie" | "Delta";
type Pair = "AB" | "CD";

/**
 * 14-day rotation of which pair (AB or CD) owns the *calendar day*.
 *
 * Each entry represents one full calendar day:
 *   - Day shift: 06:00–18:00 = first letter (A or C)
 *   - Night shift: 18:00–06:00 = second letter (B or D)
 *
 * This pattern is 14 days long and repeats forever.
 * You can tweak this array if your rotation ever changes.
 */
const ROTATION: Pair[] = [
  "AB", // day 0
  "AB", // day 1
  "CD", // day 2
  "CD", // day 3
  "AB", // day 4
  "AB", // day 5
  "AB", // day 6
  "CD", // day 7
  "CD", // day 8
  "AB", // day 9
  "AB", // day 10
  "CD", // day 11
  "CD", // day 12
  "CD", // day 13
];

/**
 * Start of the rotation.
 *
 * We define **2025-11-10 00:00 local** as "rotation day 0",
 * and that day is an **AB day**:
 *   - Alpha: 06:00–18:00 on Nov 10
 *   - Bravo: 18:00 on Nov 10 – 06:00 on Nov 11
 *
 * The array above then repeats every 14 days from this date.
 */
const ROTATION_START = new Date(2025, 10, 10, 0, 0, 0, 0); // months are 0-based (10 = November)

/** Utility to safely index the 14-day rotation array. */
function getPairForDayIndex(dayIndex: number): Pair {
  const len = ROTATION.length;
  const idx = ((dayIndex % len) + len) % len;
  return ROTATION[idx];
}

function getDayShiftName(pair: Pair): ShiftName {
  return pair === "AB" ? "Alpha" : "Charlie";
}

function getNightShiftName(pair: Pair): ShiftName {
  return pair === "AB" ? "Bravo" : "Delta";
}

/**
 * Internal: which shift is working **right now** for a given time.
 *
 * Rules:
 * - 06:00–18:00 → DAY shift of TODAY's pair
 * - 18:00–24:00 → NIGHT shift of TODAY's pair
 * - 00:00–06:00 → NIGHT shift of YESTERDAY's pair
 */
export function getCurrentShiftName(now: Date = new Date()): ShiftName {
  const msPerDay = 24 * 60 * 60 * 1000;

  // Normalize both to midnight of their days (local time)
  const startOfRotation = new Date(
    ROTATION_START.getFullYear(),
    ROTATION_START.getMonth(),
    ROTATION_START.getDate()
  );

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const daysSinceStart = Math.floor(
    (startOfToday.getTime() - startOfRotation.getTime()) / msPerDay
  );

  const todayIndex = daysSinceStart;
  const hour = now.getHours();

  if (hour >= 6 && hour < 18) {
    // Day shift for today's pair
    const pair = getPairForDayIndex(todayIndex);
    return getDayShiftName(pair);
  }

  if (hour >= 18) {
    // Night shift for today's pair
    const pair = getPairForDayIndex(todayIndex);
    return getNightShiftName(pair);
  }

  // 00:00–05:59 → night shift that started yesterday at 18:00
  const yesterdayIndex = todayIndex - 1;
  const yPair = getPairForDayIndex(yesterdayIndex);
  return getNightShiftName(yPair);
}

/**
 * Public helper:
 *   isCurrentShift("Alpha") → true/false
 *
 * Use this in your UI like:
 *   const isCurrent = isCurrentShift(shiftName);
 */
export function isCurrentShift(
  shift: ShiftName,
  now: Date = new Date()
): boolean {
  return getCurrentShiftName(now) === shift;
}
