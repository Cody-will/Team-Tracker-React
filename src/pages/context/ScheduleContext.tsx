import { db } from "../../firebase";
import { ref, push, set, update, onValue } from "firebase/database";
import React, { useState, useEffect, useContext } from "react";
import { useUser } from "./UserContext";
import Holidays from "date-holidays";

// TODO:
// Create a function to sort / query database and return events based on UID | targetUID
// Create a function to sort / query database and return events based on eventType
// Create a function to write new events to the database
// Create a function that converts the start and end to one day string "2025-09-28"
// Create a function that filters out past events

export interface Value {
  events: ScheduleEvent | Record<string, ScheduleEvent>;
  allEvents: any[] | undefined;
}

export type Display =
  | "auto"
  | "background"
  | "list-item"
  | "block"
  | "inverse-background";
export type EventType = "Vacation" | "Training" | "Shift-Swap";

export interface ScheduleEvent {
  id: string;
  originUID: string;
  targetUID?: string;
  title: string;
  start: string;
  end?: string;
  display?: Display;
  eventType: EventType;
}
export type AllEvents = Record<string, ScheduleEvent>;

const ScheduleContext = React.createContext<Value | undefined>(undefined);

export function useSchedule(): Value {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("Schedule must be inside <ScheduleProvider>");
  }
  return context;
}

export function ScheduleProvider({ children }: any) {
  const [events, setEvents] = useState<AllEvents | {}>({});
  const { user, userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
  const [allEvents, setAllEvents] = useState<any[] | undefined>();

  const value = { events, allEvents };

  useEffect(() => {
    createEvents();
  }, [userSettings]);

  // This useEffect is used to pull all the events from the database and store them in events useState
  useEffect(() => {
    const confRef = ref(db, "events");
    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        setEvents(snapshot.exists() ? (snapshot.val() as AllEvents) : {});
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  // This function adds padding to the date if its only a single digit day or month it adds a 0 before it
  function addPadding(number: number): string {
    return String(number).padStart(2, "0");
  }

  // This function converts the millisecond dates to a day only date with no time
  function toDayOnly(msDate: Date): string {
    const date = new Date(msDate);
    return `${date.getFullYear()}-${addPadding(
      date.getMonth() + 1
    )}-${addPadding(date.getDate())}`;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const nextYear = currentYear + 1;
  const holidays = new Holidays("US");
  const currentHolidays = holidays.getHolidays(currentYear).map((h) => ({
    id: `holiday-${h.date}`,
    title: h.name,
    start: h.date,
    allDay: true,
    display: "background",
    color: secondaryAccent,
  }));
  const nextHolidays = holidays.getHolidays(nextYear).map((h) => ({
    id: `holiday-${h.date}`,
    title: h.name,
    start: h.date,
    allDay: true,
    display: "background",
    color: secondaryAccent,
  }));
  const payPeriod = {
    id: "pay-period",
    title: "Pay period begins",
    allDay: true,
    display: "list-item",
    rrule: {
      freq: "weekly",
      interval: 2,
      dtstart: "2025-09-29",
    },
  };

  const payDay = {
    id: "pay-day",
    title: "Pay Day",
    allDay: true,
    display: "list-item",
    color: secondaryAccent,
    rrule: {
      freq: "weekly",
      interval: 2,
      dtstart: "2025-09-19",
    },
  };

  const BASE = new Date(2025, 8, 29);
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  const cycle: Array<"AB" | "CD" | "-"> = [
    "AB", // Day 0:  2025-09-29  Alpha/Bravo
    "AB", // Day 1:  2025-09-30  Alpha/Bravo
    "CD", // Day 2:  2025-10-01  Charlie/Delta
    "CD", // Day 3:  2025-10-02  Charlie/Delta
    "AB", // Day 4:  2025-10-03 Alpha/Bravo
    "AB", // Day 5:  2025-10-04 Alpha/Bravo
    "AB", // Day 6:  2025-10-05  Alpha/Bravo
    "CD", // Day 7:  2025-10-06  Charlie/Delta
    "CD", // Day 8:  2025-10-07  Charlie/Delta
    "AB", // Day 9:  2025-10-08 Alpha/Bravo
    "AB", // Day 10: 2025-10-09  Alpha/Bravo
    "CD", // Day 11: 2025-10-10 Charlie/Delta
    "CD", // Day 12: 2025-10-11 Charlie/Delta
    "CD", // Day 13: 2025-10-12  Charlie/Delta
  ];

  const teamStart = {
    Alpha: "06:00:00",
    Bravo: "18:00:00",
    Charlie: "06:00:00",
    Delta: "18:00:00",
  } as const;

  const DURATION = { hours: 4 } as const;

  function buildShiftEvents() {
    const events: any[] = [];

    cycle.forEach((token, dayIndex) => {
      if (token === "-") return;

      const dateStr = toDayOnly(addDays(BASE, dayIndex));

      if (token === "AB") {
        events.push(
          {
            id: `alpha-d${dayIndex}`,
            title: "Alpha",
            rrule: {
              freq: "weekly",
              interval: 2,
              dtstart: `${dateStr}T${teamStart.Alpha}`,
            },
            duration: DURATION,
            display: "list-item",
            extendedProps: { team: "Alpha" },
          },
          {
            id: `bravo-d${dayIndex}`,
            title: "Bravo",
            rrule: {
              freq: "weekly",
              interval: 2,
              dtstart: `${dateStr}T${teamStart.Bravo}`,
            },
            duration: DURATION,
            display: "list-item",
            extendedProps: { team: "Bravo" },
          }
        );
      }

      if (token === "CD") {
        events.push(
          {
            id: `charlie-d${dayIndex}`,
            title: "Charlie",
            rrule: {
              freq: "weekly",
              interval: 2,
              dtstart: `${dateStr}T${teamStart.Charlie}`,
            },
            duration: DURATION,
            display: "list-item",
            extendedProps: { team: "Charlie" },
          },
          {
            id: `delta-d${dayIndex}`,
            title: "Delta",
            rrule: {
              freq: "weekly",
              interval: 2,
              dtstart: `${dateStr}T${teamStart.Delta}`,
            },
            duration: DURATION,
            display: "list-item",
            extendedProps: { team: "Delta" },
          }
        );
      }
    });

    return events;
  }

  const anotherEvent = {
    id: "anotherevent",
    title: "Vacation Willard, C",
    start: "2025-10-2",
    end: "2025-10-13",
    display: "block",
  };

  function createEvents() {
    setAllEvents([
      ...currentHolidays,
      ...nextHolidays,
      ...buildShiftEvents(),
      payDay,
      payPeriod,
      anotherEvent,
    ]);
  }

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}
