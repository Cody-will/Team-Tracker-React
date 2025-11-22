import type { User } from "../pages/context/UserContext";

const SHIFT_DAY_MAP: Record<string, 0 | 1> = {
  Alpha: 0,
  Bravo: 1,
  Charlie: 0,
  Delta: 1,
  CommandStaff: 0,
};

function isDayShift(shift: string): boolean {
  return (SHIFT_DAY_MAP[shift] ?? 0) === 0;
}

export function calculateSickExpires(user: User, now = new Date()): number {
  const isDay = isDayShift(user.Shifts.replaceAll(" ", ""));
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const hour = now.getHours();

  if (isDay) {
    // Day shift (6am–6pm): clear at midnight
    const midnight = new Date(year, month, date + 1, 0, 0, 0, 0);
    return midnight.getTime();
  }

  // Night shift (6pm–6am)
  if (hour >= 18) {
    // Toggled during evening part of shift: clear at tomorrow 06:00
    const end = new Date(year, month, date + 1, 6, 0, 0, 0);
    return end.getTime();
  }

  if (hour < 6) {
    // Toggled between 00:00–05:59: same shift, clear today at 06:00
    const end = new Date(year, month, date, 6, 0, 0, 0);
    return end.getTime();
  }

  // Weird midday toggle: just clear at next 06:00
  const nextEnd = new Date(year, month, date + 1, 6, 0, 0, 0);
  return nextEnd.getTime();
}
