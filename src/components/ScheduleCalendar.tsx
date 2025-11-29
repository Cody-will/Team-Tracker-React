import FullCalendar from "@fullcalendar/react";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  startTransition,
  memo,
} from "react";
import { useSchedule } from "../pages/context/ScheduleContext";
import type { EventType } from "../pages/context/ScheduleContext";
import { motion } from "motion/react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

export type Display =
  | "auto"
  | "block"
  | "list-item"
  | "background"
  | "inverse-background";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  originDisplay?: Display;
  display?: Display;
  type: "Vacation" | "Training" | "Shift-Swap" | "Coverage";
}

export type AllEvents = CalendarEvent[];

interface CalendarProps {
  height?: string;
  interactive?: boolean;
  handleSelect?: (dateData: DateSelectArg) => void;
  selected?: boolean;
}

function ScheduleCalendar({
  height = "100%",
  interactive = false,
  handleSelect,
  selected,
}: CalendarProps) {
  const { allEvents, buildShiftEvents } = useSchedule();
  const { primaryAccent, secondaryAccent } = useSafeSettings();

  const [shiftsOn, setShiftsOn] = useState(false);
  const calRef = useRef<FullCalendar>(null);
  const [filters, setFilters] = useState<Record<EventType, boolean>>({
    Vacation: true,
    Training: true,
    Coverage: true,
    "Shift-Swap": true,
    Range: true,
    "Jail-School": true,
  });

  // ---- memoized style vars to avoid new object each render
  const styleVars = useMemo(
    () => ({
      ["--fc-page-bg-color" as any]: "#09090b",
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
    }),
    [primaryAccent]
  );

  // ---- memoized CSS text to avoid realloc on every render
  const styleText = useMemo(
    () => `
      #calWrap .fc .fc-toolbar.fc-header-toolbar {
        display: grid !important;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
      }
      #calWrap .fc .fc-toolbar-chunk:nth-child(1) { justify-self: start; }
      #calWrap .fc .fc-toolbar-chunk:nth-child(2) { justify-self: center; }
      #calWrap .fc .fc-toolbar-chunk:nth-child(3) { justify-self: end; }

      #calWrap .fc { --fc-page-bg-color: #09090b1; }

      .fc .fc-button { transition: transform .15s ease-out; transform-origin: center; }
      .fc .fc-button:hover { transform: scale(1.1); }
      .fc .fc-button:active { transform: scale(1.05); }
      .fc .fc-button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px rgba(14,165,233,.6);
      }

      .fc .fc-day-other .fc-daygrid-day-number { color: rgba(148,163,184,0.99); }
      .fc .fc-day-other .fc-daygrid-day-frame { opacity: 1; }

      #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number { color: #a1a1aa; }
      #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-top,
      #calWrap .fc .fc-daygrid-day.fc-day-other .fc-event { opacity: 1; }

      #calWrap .fc { --fc-highlight-color: ${primaryAccent}98; }

      #calWrap .fc .fc-daygrid-day.fc-day-today {
        outline: none;
        box-shadow: inset 0 0 0 3px ${primaryAccent};
      }

      #calWrap .fc { --fc-today-bg-color: ${primaryAccent}30; }
    `,
    [primaryAccent]
  );

  // ---- event visibility update: do it in a transition to keep animations smooth
  useEffect(() => {
    const api = calRef.current?.getApi();
    if (!api) return;

    startTransition(() => {
      api.getEvents().forEach((ev) => {
        const kind: EventType =
          (ev.extendedProps.eventType as EventType) ??
          (ev.extendedProps.type as EventType);
        const show = filters[kind] ?? true;
        ev.setProp("display", show ? ev.extendedProps.originDisplay : "none");
      });
    });
  }, [filters, allEvents]); // allEvents changes are memoized upstream

  const toggleKind = (k: EventType) =>
    setFilters((f) => ({ ...f, [k]: !f[k] }));

  // ---- keep selection state consistent without forcing layout sync
  useEffect(() => {
    if (!selected) {
      calRef.current?.getApi().unselect();
    }
  }, [selected]);

  // ---- add/remove shift source without rebuilding object every render
  const shiftSource = useMemo(
    () => ({ id: "shifts", events: buildShiftEvents() }),
    [buildShiftEvents]
  );

  useEffect(() => {
    const api = calRef.current?.getApi();
    if (!api) return;
    const existing = api.getEventSourceById("shifts");
    if (shiftsOn) {
      if (!existing) api.addEventSource(shiftSource);
    } else {
      existing?.remove();
    }
  }, [shiftsOn, shiftSource]);

  // ---- memoize custom buttons & header toolbar so FC doesn’t diff large objects on every render
  const customButtons = useMemo(
    () => ({
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
    }),
    [shiftsOn, filters] // safe: text reflects state; functions stable by closure
  );

  const headerToolbar = useMemo(
    () => ({
      left: "toggleShifts,toggleVac,toggleTrain,toggleCov,toggleSwap",
      center: "title",
      right: "prev,next,today",
    }),
    []
  );

  return (
    <motion.div
      id="calWrap"
      className="w-full h-full rounded-xl text-zinc-200"
      style={styleVars}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{styleText}</style>

      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
        initialView="dayGridMonth"
        height={height}
        unselectAuto={false}
        // allEvents is already memoized in the provider; pass through directly
        eventSources={allEvents}
        selectable={interactive}
        select={handleSelect ? handleSelect : () => {}}
        customButtons={customButtons}
        headerToolbar={headerToolbar}
      />
    </motion.div>
  );
}

export default memo(ScheduleCalendar);
