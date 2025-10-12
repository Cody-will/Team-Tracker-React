import FullCalendar from "@fullcalendar/react";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useUser } from "../pages/context/UserContext";
import { useSchedule } from "../pages/context/ScheduleContext";
import rrulePlugin from "@fullcalendar/rrule";
import { useState, useEffect, useRef } from "react";
import type { EventType } from "../pages/context/ScheduleContext";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  display?:
    | "auto"
    | "block"
    | "list-item"
    | "background"
    | "inverse-background";
  type: "Vacation" | "Training" | "Shift-Swap";
}

export type AllEvents = CalendarEvent[];

interface CalendarProps {
  height?: string;
  interactive?: boolean;
  handleSelect?: (dateData: DateSelectArg) => void;
  selected?: boolean;
}

export default function ScheduleCalendar({
  height = "100%",
  interactive = false,
  handleSelect,
  selected,
}: CalendarProps) {
  const { userSettings } = useUser();
  const { allEvents, buildShiftEvents } = useSchedule();
  const { primaryAccent, secondaryAccent } = userSettings;
  const [shiftsOn, setShiftsOn] = useState(false);
  const calRef = useRef<FullCalendar>(null);
  const [filters, setFilters] = useState<Record<EventType, boolean>>({
    Vacation: true,
    Training: true,
    Coverage: true,
    "Shift-Swap": true,
  });

  useEffect(() => {
    const api = calRef.current?.getApi();
    if (!api) return;

    api.getEvents().forEach((ev) => {
      const kind: EventType =
        (ev.extendedProps.eventType as EventType) ??
        (ev.extendedProps.type as EventType);

      const show = filters[kind] ?? true;
      ev.setProp("display", show ? ev.display : "none");
    });
  }, [filters, allEvents]);

  const toggleKind = (k: EventType) =>
    setFilters((f) => ({ ...f, [k]: !f[k] }));

  useEffect(() => {
    if (!selected && interactive) {
      calRef.current?.getApi().unselect();
    }
  }, [selected]);

  useEffect(() => {
    const api = calRef.current?.getApi();
    const source = { id: "shifts", events: buildShiftEvents() };
    if (!api) return;
    const existing = api.getEventSourceById("shifts");
    if (shiftsOn) {
      if (!existing) api.addEventSource(source);
    } else {
      existing?.remove();
    }
  }, [shiftsOn]);

  return (
    <div
      id="calWrap"
      className="w-full h-full rounded-xl text-zinc-200 "
      style={{
        ["--fc-today-bg-color" as any]: primaryAccent,
        ["--fc-button-text-color" as any]: "#0a0a0a",
        ["--fc-button-bg-color" as any]: primaryAccent,
        ["--fc-button-border-color" as any]: "transparent",
        ["--fc-button-hover-bg-color" as any]: primaryAccent,
        ["--fc-button-hover-border-color" as any]: "transparent",
        ["--fc-button-active-bg-color" as any]: primaryAccent,
        ["--fc-button-active-border-color" as any]: "transparent",
        ["--fc-bg-event-opacity" as any]: "0.8",
        ["--fc-event-text-color" as any]: "#0a0a0a",
      }}
    >
      <style>{`
    .fc .fc-button {
      transition: transform .15s ease-out;
      transform-origin: center;
    }
    .fc .fc-button:hover {
      transform: scale(1.1);
    }
    .fc .fc-button:active {
      transform: scale(1.05);
    }
    .fc .fc-button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(14,165,233,.6);
    }

    .fc .fc-day-other .fc-daygrid-day-number { 
    color: rgba(148, 163, 184, 0.99); 
    }
    .fc .fc-day-other .fc-daygrid-day-frame {
      opacity: 1; 
    }

    #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
      color: #a1a1aa; 
    }

    #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-top,
    #calWrap .fc .fc-daygrid-day.fc-day-other .fc-event {
      opacity: 1;
    }

    #calWrap .fc {
      --fc-highlight-color: ${primaryAccent}98; 
    }
      

    #calWrap .fc .fc-daygrid-day.fc-day-today {
      outline: none;             
      box-shadow: inset 0 0 0 3px ${primaryAccent};
    }

    #calWrap .fc {
      --fc-today-bg-color: ${primaryAccent}30; 
    }
  `}</style>

      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
        initialView="dayGridMonth"
        height={height}
        unselectAuto={false}
        eventSources={allEvents}
        selectable={interactive}
        select={handleSelect ? handleSelect : () => {}}
        customButtons={{
          toggleShifts: {
            text: shiftsOn ? "Shifts ✓" : "Shifts ✗",
            click: () => setShiftsOn((prev) => !prev),
          },
          toggleVac: {
            text: filters.Vacation ? "Vacation ✓" : "Vacation ✗",
            click: () => toggleKind("Vacation"),
          },
          toggleTrain: {
            text: filters.Training ? "Training ✓" : "Training ✗",
            click: () => toggleKind("Training"),
          },
          toggleCov: {
            text: filters.Coverage ? "Coverage ✓" : "Coverage ✗",
            click: () => toggleKind("Coverage"),
          },
          toggleSwap: {
            text: filters["Shift-Swap"] ? "Swap ✓" : "Swap ✗",
            click: () => toggleKind("Shift-Swap"),
          },
        }}
        headerToolbar={{
          left: "dayGridMonth,toggleShifts,toggleVac,toggleTrain,toggleCov,toggleSwap",
          center: "title",
          right: "prev,next,today",
        }}
      />
    </div>
  );
}
