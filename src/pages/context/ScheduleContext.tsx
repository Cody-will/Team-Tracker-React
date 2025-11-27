import { db } from "../../firebase";
import { ref, push, set, update, onValue } from "firebase/database";
import {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  startTransition,
} from "react";
import { useUser } from "./UserContext";
import Holidays from "date-holidays";
import * as React from "react";

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

export type EventType =
  | "Vacation"
  | "Training"
  | "Shift-Swap"
  | "Coverage"
  | "Range"
  | "Jail-School";

export interface ScheduleEvent {
  id?: string;
  originUID: string;
  targetUID?: string;
  title: string;
  start: number | string;
  end: number | string;
  allDay?: boolean;
  display?: Display;
  originDisplay?: Display;
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

const BASE = new Date(2025, 8, 29);
const DURATION = { hours: 4 } as const;

const teamStart = {
  Alpha: "06:00:00",
  Bravo: "18:00:00",
  Charlie: "06:00:00",
  Delta: "18:00:00",
} as const;

const cycle: Array<"AB" | "CD" | "-"> = [
  "AB", // 0
  "AB", // 1
  "CD", // 2
  "CD", // 3
  "AB", // 4
  "AB", // 5
  "AB", // 6
  "CD", // 7
  "CD", // 8
  "AB", // 9
  "AB", // 10
  "CD", // 11
  "CD", // 12
  "CD", // 13
];

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const addPadding = (n: number) => String(n).padStart(2, "0");

const toDayOnly = (d: Date) =>
  `${d.getFullYear()}-${addPadding(d.getMonth() + 1)}-${addPadding(
    d.getDate()
  )}`;

function toLocalMidnight(millis: number | string) {
  const t =
    typeof millis === "number" ? millis : new Date(millis).getTime() || 0;
  const date = new Date(t);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function ScheduleProvider({ children }: any) {
  const [events, setEvents] = useState<AllEvents>([]);
  const { userSettings, user, data: users } = useUser();

  const {
    primaryAccent,
    secondaryAccent,
    vacationAccent,
    swapAccent,
    coverageAccent,
    trainingAccent,
  } = userSettings;

  const [coverage, setCoverage] = useState<Coverage>([]);
  const [training, setTraining] = useState<ScheduleEvent[]>([]);
  const [vacation, setVacation] = useState<ScheduleEvent[]>([]);
  const [range, setRange] = useState<ScheduleEvent[]>([]);
  const [swap, setSwap] = useState<ScheduleEvent[]>([]);
  const [jailSchool, setJailSchool] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    const cRef = ref(db, "coverage");
    const unsubscribe = onValue(
      cRef,
      (snapshot) => {
        startTransition(() => {
          const raw = snapshot.exists()
            ? (Object.values(snapshot.val()) as DayEvent[])
            : [];
          setCoverage(filterByDivision(raw));
        });
      },
      (error) => console.log(error)
    );
    return unsubscribe;
  }, []);

  const claimedCoverage = useMemo(
    () => coverage.filter((e) => e.coverage),
    [coverage]
  );

  useEffect(() => {
    const confRef = ref(db, "events");
    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          startTransition(() => {
            setEvents([]);
            setVacation([]);
            setTraining([]);
            setRange([]);
            setSwap([]);
            setJailSchool([]);
          });
          return;
        }

        const typedData = snapshot.val() as Record<string, ScheduleEvent>;
        const values = Object.values(typedData);

        const nextEvents: ScheduleEvent[] = [];
        const nextVacation: ScheduleEvent[] = [];
        const nextTraining: ScheduleEvent[] = [];
        const nextRange: ScheduleEvent[] = [];
        const nextSwap: ScheduleEvent[] = [];
        const nextJailSchool: ScheduleEvent[] = [];

        for (const e of values) {
          // Normalize once
          const normalized: ScheduleEvent = {
            ...e,
            start: toDayOnly(toLocalMidnight(e.start)),
            end: toDayOnly(toLocalMidnight(e.end)),
          };
          nextEvents.push(normalized);

          switch (e.eventType) {
            case "Vacation":
              nextVacation.push(normalized);
              break;
            case "Training":
              nextTraining.push(normalized);
              break;
            case "Range":
              nextRange.push(normalized);
              break;
            case "Shift-Swap":
              nextSwap.push(normalized);
              break;
            case "Jail-School":
              nextJailSchool.push(normalized);
          }
        }

        startTransition(() => {
          setEvents(filterByDivision(nextEvents));
          setVacation(filterByDivision(nextVacation));
          setTraining(filterByDivision(nextTraining));
          setRange(filterByDivision(nextRange));
          setSwap(filterByDivision(nextSwap));
          setJailSchool(filterByDivision(nextJailSchool));
        });
      },
      (error) => console.log(error)
    );
    return unsubscribe;
  }, []);

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const hd = useMemo(() => new Holidays("US"), []);

  const currentHolidays = useMemo(
    () =>
      hd.getHolidays(currentYear).map((h) => ({
        id: `holiday-${h.date}`,
        title: h.name,
        start: h.date,
        allDay: true,
        originDisplay: "background" as const,
        display: "background" as const,
        color: secondaryAccent,
      })),
    [hd, currentYear, secondaryAccent]
  );

  const nextHolidays = useMemo(
    () =>
      hd.getHolidays(nextYear).map((h) => ({
        id: `holiday-${h.date}`,
        title: h.name,
        start: h.date,
        allDay: true,
        originDislay: "background" as const,
        display: "background" as const,
        color: secondaryAccent,
      })),
    [hd, nextYear, secondaryAccent]
  );

  const payPeriod = useMemo(
    () => ({
      id: "pay-period",
      title: "Pay period begins",
      allDay: true,
      originDisplay: "list-item" as const,
      display: "list-item" as const,
      rrule: {
        freq: "weekly",
        interval: 2,
        dtstart: "2025-09-29",
      },
    }),
    []
  );

  const payDay = useMemo(
    () => ({
      id: "pay-day",
      title: "Pay Day",
      allDay: true,
      originDisplay: "list-item" as const,
      display: "list-item" as const,
      color: secondaryAccent,
      rrule: {
        freq: "weekly",
        interval: 2,
        dtstart: "2025-09-19",
      },
    }),
    [secondaryAccent]
  );

  function filterByDivision<
    T extends { originUID: string; targetUID?: string; eventType?: EventType }
  >(list: T[]): T[] {
    if (!user || !users) return list;

    return list.filter((e) => {
      const origin = users[e.originUID];
      const target = e.targetUID ? users[e.targetUID] : null;

      if (e.eventType === "Jail-School" || e.eventType === "Range") {
        return user.Divisions === "ADC";
      }

      const sameDivision =
        (origin && origin.Divisions === user.Divisions) ||
        (target && target.Divisions === user.Divisions);

      return sameDivision;
    });
  }

  function addExtended(event: ScheduleEvent | DayEvent | any) {
    const extendedProps = {
      originDisplay: event.display,
      eventType: event.eventType ? event.eventType : null,
    };
    return { ...event, extendedProps };
  }

  const addUnclaimedCoverage = useCallback(async (event: DayEvent) => {
    const cRef = ref(db, `coverage/${event.id}`);
    await set(cRef, { ...event, targetUID: null, color: null });
  }, []);

  const expandRange = useCallback(
    (e: ScheduleEvent) => {
      // robustly handle number|string
      const start = toLocalMidnight(e.start);
      let end = toLocalMidnight(e.end);
      end = addDays(end, -1);
      const last = end < start ? start : end;

      for (let d = start; d <= last; d = addDays(d, 1)) {
        const entry: DayEvent = {
          id: `${e.id}-${toDayOnly(d)}`,
          originUID: e.originUID,
          targetUID: e.targetUID,
          title: e.title,
          display: e.display,
          originDisplay: e.display,
          eventType: e.eventType,
          coverage: e.coverage,
          color: e.color,
          day: toDayOnly(d),
          allDay: e.allDay,
          claimed: false,
        };
        void addUnclaimedCoverage(entry);
      }
    },
    [addUnclaimedCoverage]
  );

  const scheduleEvent = useCallback(
    async (event: ScheduleEvent): Promise<boolean> => {
      const eRef = ref(db, "events");
      const eventRef = push(eRef);
      const key = eventRef.key!;
      const newEvent: ScheduleEvent = {
        id: key,
        ...event,
        originDisplay: event.display,
      };
      await set(eventRef, newEvent);
      if (event.coverage) expandRange(newEvent);
      return true;
    },
    [expandRange]
  );

  const addClaimedCoverage = useCallback(async (event: DayEvent) => {
    const cRef = ref(db, `coverage/${event.id}`);
    await update(cRef, { ...event, claimed: true, eventType: "Coverage" });
    return true;
  }, []);

  const buildShiftEvents = useCallback(() => {
    const evts: any[] = [];

    cycle.forEach((token, dayIndex) => {
      if (token === "-") return;

      const dateStr = toDayOnly(addDays(BASE, dayIndex));

      if (token === "AB") {
        evts.push(
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
        evts.push(
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

    return evts;
  }, []);

  const allEvents = useMemo(
    () => [
      { id: "currentHolidays", events: currentHolidays.map(addExtended) },
      { id: "nextHolidays", events: nextHolidays.map(addExtended) },
      { id: "payday", events: [payDay] },
      { id: "payPeriod", events: [payPeriod] },
      {
        id: "vacation",
        events: vacation.map(addExtended),
        color: vacationAccent,
      },
      {
        id: "shift-swap",
        events: swap.map(addExtended),
        color: swapAccent,
      },
      {
        id: "training",
        events: training.map(addExtended),
        color: trainingAccent,
      },
      {
        id: "coverage",
        events: claimedCoverage.map(addExtended),
        color: coverageAccent,
      },
      {
        id: "Range",
        events: range.map(addExtended),
        color: "#ef4444",
      },
      {
        id: "Jail-School",
        events: jailSchool.map(addExtended),
        color: "#ef4444",
      },
    ],
    [
      currentHolidays,
      nextHolidays,
      payDay,
      payPeriod,
      vacation,
      swap,
      training,
      claimedCoverage,
      range,
      vacationAccent,
      swapAccent,
      trainingAccent,
      coverageAccent,
      primaryAccent,
      secondaryAccent,
      jailSchool,
    ]
  );

  const value = useMemo(
    () => ({
      events,
      allEvents,
      scheduleEvent,
      buildShiftEvents,
      coverage,
      addClaimedCoverage,
    }),
    [
      events,
      allEvents,
      scheduleEvent,
      buildShiftEvents,
      coverage,
      addClaimedCoverage,
    ]
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}
