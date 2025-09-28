import { db } from "../../firebase";
import { ref, push, set, update, onValue } from "firebase/database";
import React, { useState, useEffect, useContext } from "react";
import { useUser } from "./UserContext";

// TODO:
// Create a function to sort / query database and return events based on UID | targetUID
// Create a function to sort / query database and return events based on eventType
// Create a function to write new events to the database
// Create a function that converts the start and end to one day string "2025-09-28"
// Create a function that filters out past events

export interface Value {
  events: ScheduleEvent | Record<string, ScheduleEvent>;
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
  const { user } = useUser();

  const value = { events };

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
  function toDayOnly(msDate: number): string {
    const date = new Date(msDate);
    return `${date.getFullYear()}-${addPadding(
      date.getMonth() + 1
    )}-${addPadding(date.getDate())}`;
  }

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}
