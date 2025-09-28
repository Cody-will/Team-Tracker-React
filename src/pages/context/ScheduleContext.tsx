import { db } from "../../firebase";
import { ref, push, set, update, onValue } from "firebase/database";

import React, { useState, useEffect, useContext } from "react";
import { useUser } from "./UserContext";

export interface Value {}

export interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  display?:
    | "auto"
    | "background"
    | "list-item"
    | "block"
    | "inverse-background";
  type: "Vacation" | "Training" | "Shift-Swap";
}

export interface AllEvents {
  vacation?: ScheduleEvent;
  training?: ScheduleEvent;
  shiftSwap?: ScheduleEvent;
}

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

  const value = {};

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

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}
