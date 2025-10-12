import { db } from "../../firebase";
import { ref, push, set, update, onValue } from "firebase/database";
import React, { useState, useEffect, useContext } from "react";
import { useUser } from "./UserContext";
import Holidays from "date-holidays";

export interface Value {
  events: ScheduleEvent[];
  allEvents: any[] | undefined;
  scheduleEvent: (event: ScheduleEvent) => Promise<boolean>;
  buildShiftEvents: () => any[];
  coverage: Coverage | [];
  addClaimedCoverage: (event: DayEvent) => Promise<boolean>;
}

export type Display =
  | "auto"
  | "background"
  | "list-item"
  | "block"
  | "inverse-background";
export type EventType = "Vacation" | "Training" | "Shift-Swap" | "Coverage";

export interface ScheduleEvent {
  id?: string;
  originUID: string;
  targetUID?: string;
  title: string;
  start: number | string;
  end: number | string;
  allDay?: boolean;
  display?: Display;
  eventType: EventType;
  coverage?: boolean;
  color?: string;
}

export type ScheduleEventMilli = Omit<ScheduleEvent, "start" | "end"> & {
  start: number;
  end: number;
};

export type DayEvent = Omit<ScheduleEventMilli, "start" | "end"> & {
  day: string;
  claimed: boolean;
  start?: number | string;
};

export type AllEvents = ScheduleEvent[];

export type Coverage = DayEvent[];

const ScheduleContext = React.createContext<Value | undefined>(undefined);

export function useSchedule(): Value {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("Schedule must be inside <ScheduleProvider>");
  }
  return context;
}

export function ScheduleProvider({ children }: any) {
  const [events, setEvents] = useState<AllEvents>([]);
  const [eventsMilli, setEventsMilli] = useState<ScheduleEventMilli[]>([]);
  const { user, userSettings } = useUser();
  const {
    primaryAccent,
    secondaryAccent,
    vacationAccent,
    swapAccent,
    coverageAccent,
    trainingAccent,
  } = userSettings;
  const [allEvents, setAllEvents] = useState<any[] | undefined>();
  const [coverage, setCoverage] = useState<Coverage>([]);
  const [claimedCoverage, setClaimedCoverage] = useState<Coverage>([]);
  const [training, setTraining] = useState<ScheduleEvent[]>([]);
  const [vacation, setVacation] = useState<ScheduleEvent[]>([]);
  const [swap, setSwap] = useState<ScheduleEvent[]>([]);

  const value = {
    events,
    allEvents,
    scheduleEvent,
    buildShiftEvents,
    coverage,
    addClaimedCoverage,
  };

  // This use effect gets all of the coverage events from the database
  useEffect(() => {
    const cRef = ref(db, "coverage");
    const unsubscribe = onValue(
      cRef,
      (snapshot) => {
        setCoverage(
          snapshot.exists()
            ? ([...Object.values(snapshot.val())] as DayEvent[])
            : []
        );
        setClaimedCoverage(
          snapshot.exists()
            ? ([...Object.values(snapshot.val())] as DayEvent[]).filter(
                (e) => e.coverage
              )
            : []
        );
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  // This useEffect creates all of the events and updates them based on if colors, events and userSettings
  useEffect(() => {
    createEvents();
  }, [
    userSettings,
    events,
    primaryAccent,
    secondaryAccent,
    vacationAccent,
    trainingAccent,
    swapAccent,
    coverageAccent,
    claimedCoverage,
  ]);

  // This useEffect is used to pull all the events from the database and store them in events useState
  useEffect(() => {
    const confRef = ref(db, "events");
    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        const typedData = snapshot.val() as Record<string, ScheduleEvent>;
        setEventsMilli(
          snapshot.exists()
            ? ([...Object.values(typedData)] as ScheduleEventMilli[])
            : []
        );
        setEvents(
          snapshot.exists()
            ? (Object.values(typedData).map(normalize) as ScheduleEvent[])
            : []
        );
        setVacation(
          snapshot.exists()
            ? ([...Object.values(typedData)].filter(
                (e) => e.eventType === "Vacation"
              ) as ScheduleEvent[])
            : []
        );
        setTraining(
          snapshot.exists()
            ? ([...Object.values(typedData)].filter(
                (e) => e.eventType === "Training"
              ) as ScheduleEvent[])
            : []
        );
        setSwap(
          snapshot.exists()
            ? ([...Object.values(typedData)].filter(
                (e) => e.eventType === "Shift-Swap"
              ) as ScheduleEvent[])
            : []
        );
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  async function addClaimedCoverage(event: DayEvent) {
    const claimed = true;
    const eventType = "Coverage";
    const cRef = ref(db, `coverage/${event.id}`);
    try {
      await update(cRef, { ...event, claimed, eventType });
      return true;
    } catch (e) {
      throw new Error(`${e}`);
    }
  }

  // This function converts the start and end dates for all the database events so the calendar reads them correctly
  function normalize(empEvents: ScheduleEvent) {
    const newStart = new Date(empEvents.start);
    const newEnd = new Date(empEvents.end);
    return {
      ...empEvents,
      start: toDayOnly(newStart),
      end: toDayOnly(newEnd),
    };
  }

  // This function schedules a new event
  async function scheduleEvent(event: ScheduleEvent): Promise<boolean> {
    const eRef = ref(db, "events");
    try {
      const eventRef = push(eRef);
      const key = eventRef.key!;
      const newEvent: ScheduleEvent = { id: key, ...event };
      await set(eventRef, newEvent);
      if (event.coverage) expandRange(newEvent as ScheduleEventMilli);

      return true;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

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

  async function addUnclaimedCoverage(event: DayEvent) {
    const cRef = ref(db, `coverage/${event.id}`);
    try {
      await set(cRef, { ...event, targetUID: null, color: null });
    } catch (e) {
      throw new Error(`${e}`);
    }
  }

  function toLocalMidnight(millis: number) {
    const date = new Date(millis);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function expandRange(e: ScheduleEventMilli) {
    const start = toLocalMidnight(e.start);
    let end = toLocalMidnight(e.end);
    end = addDays(end, -1);
    const last = end < start ? start : end;

    for (let d = start; d <= last; d = addDays(d, 1)) {
      const entry = {
        id: `${e.id}-${toDayOnly(d)}`,
        originUID: e.originUID,
        targetUID: e.targetUID,
        title: e.title,
        display: e.display,
        eventType: e.eventType,
        coverage: e.coverage,
        color: e.color,
        day: toDayOnly(d),
        allDay: e.allDay,
        claimed: false,
      };
      addUnclaimedCoverage(entry);
    }
  }

  // This block creates all of the holidays for the current year and next year, as well as
  // creates all of the pay day and pay period schedules for the calendar
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
    "AB", // Day 0:   Alpha/Bravo
    "AB", // Day 1:   Alpha/Bravo
    "CD", // Day 2:   Charlie/Delta
    "CD", // Day 3:   Charlie/Delta
    "AB", // Day 4:   Alpha/Bravo
    "AB", // Day 5:   Alpha/Bravo
    "AB", // Day 6:   Alpha/Bravo
    "CD", // Day 7:   Charlie/Delta
    "CD", // Day 8:   Charlie/Delta
    "AB", // Day 9:   Alpha/Bravo
    "AB", // Day 10:  Alpha/Bravo
    "CD", // Day 11:  Charlie/Delta
    "CD", // Day 12:  Charlie/Delta
    "CD", // Day 13:  Charlie/Delta
  ];

  // This block creates the shifts to add to the calendar
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

  // This function adds all of the events together into one bundle
  function createEvents() {
    setAllEvents([
      { id: "currentHolidays", events: currentHolidays },
      { id: "nextHolidays", events: nextHolidays },
      { id: "payday", events: [payDay] },
      { id: "payPeriod", events: [payPeriod] },
      { id: "vacation", events: vacation, color: vacationAccent },
      { id: "shift-swap", events: swap, color: swapAccent },
      { id: "training", events: training, color: trainingAccent },
      {
        id: "coverage",
        events: claimedCoverage,
        color: coverageAccent,
      },
    ]);
  }

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}
