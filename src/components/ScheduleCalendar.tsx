import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import listPlugin from "@fullcalendar/list";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  startTransition,
  memo,
} from "react";
import { useSchedule } from "../pages/context/ScheduleContext";
import type {
  DayEvent,
  EventType,
  ScheduleEvent,
} from "../pages/context/ScheduleContext";
import { LayoutGroup, motion } from "motion/react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import { useBreakpoint } from "../pages/hooks/useBreakpoint";
import type{PopUpProps} from "../components/PopUp";
import PopUp from "../components/PopUp"
import {useUser} from "../pages/context/UserContext";

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
  clickable: boolean;
}

function ScheduleCalendar({
  height = "100%",
  interactive = false,
  handleSelect,
  selected,
  clickable = false,
}: CalendarProps) {
  const [popUp, setPopup] = useState<PopUpProps | null>(null);
  const { allEvents, buildShiftEvents, deleteEvent } = useSchedule();
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const { lgUp } = useBreakpoint();
  const {user} = useUser();

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

  function handleEventDidMount(info: any) {
    if (lgUp && clickable) {
      info.el.style.cursor = "pointer";
    } else {
      info.el.style.cursor = "default";
    }
  }

  function handlePopup(response: boolean, data: EventClickArg){
    setPopup(null);
    if (!response) return;
    const eventID = data.event._def.publicId;
    deleteEvent(eventID);
  }

 
 
  function handleClickEvent(info: EventClickArg) {
    if (!lgUp) return;
    if (!user) return;
    info.jsEvent.preventDefault();

    const { originUID, targetUID, Division } = info.event._def.extendedProps;

    const sameDivision = user.Divisions === Division; // or includes() if it's an array
    const isAdmin = user.Role === "Admin";
    const isOrigin = originUID === user.uid;
    const isTarget = targetUID === user.uid;
    
    // Must be same division AND (admin OR origin OR target)
    const canDelete = sameDivision && (isAdmin || isOrigin || isTarget);

    if (!canDelete) return;

    createPopup(info);
  }


  function createPopup(tempData: EventClickArg) {
    setPopup({title: "Delete Event", message: "Are you sure you want to delete this event", onClose: handlePopup, location: "top-center", isConfirm: true, trueText: "Delete", falseText: "Cancel", tempData: tempData});

  }

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
      /* ---------- Toolbar Layout Override ---------- */
      #calWrap .fc .fc-toolbar.fc-header-toolbar {
        display: grid !important;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
      }

      #calWrap .fc .fc-toolbar-chunk:nth-child(1) {
        justify-self: start;
      }
      #calWrap .fc .fc-toolbar-chunk:nth-child(2) {
        justify-self: center;
      }
      #calWrap .fc .fc-toolbar-chunk:nth-child(3) {
        justify-self: end;
      }

      /* ---------- Calendar Title (Desktop) ---------- */
      #calWrap .fc .fc-toolbar-title {
        font-size: 1.4rem !important;
        font-weight: 700 !important;
        color: #f1f5f9 !important;
      }

      /* ---------- Calendar Title (Mobile) ---------- */
      @media (max-width: 768px) {
        #calWrap .fc .fc-toolbar-title {
          font-size: 1rem !important;
        }
      }

      /* ---------- LIST VIEW: Day Header Bar ---------- */
      /* Use .fc-list-heading td (no theme prefix) so it works regardless of themeSystem */
      #calWrap .fc .fc-list-heading td {
        background: ${primaryAccent} !important;
        color: #09090b !important;
        font-size: 0.9rem !important;
        font-weight: 600 !important;
      }

      #calWrap .fc .fc-list-heading-main,
      #calWrap .fc .fc-list-heading-alt {
        color: ${primaryAccent} !important;
        border-color: #27272a
      }

      & .fc-list-table tr > * {
        /* event background color */
        color: #e4e4e7
        border-color: #09090b
      }

      .fc-theme-standard {

        & .fc-list {
          border: 1px solid #27272a;
       }

       & .fc-list-event:hover td {
        background-color: ${secondaryAccent};
        color: #09090b;
        font-weight: 500;
      }

      }

      & .fc-list-table tr > * {
        border-color: #27272a
      }

      & .fc-list-table th {
        border-color: #27272a
      }

      .fc-theme-standard {

        & .fc-list-day-cushion {
          background-color: ${primaryAccent};
          color: #09090b;
          
        }

      } 

      /* ---------- BUTTON STYLE + SIZE (prev/next + custom toggles) ---------- */

      #calWrap .fc .fc-toolbar-chunk {
        display: flex !important;
        gap: .4rem !important; /* EXACT Tailwind gap-2 */
        align-items: center;
      }

      #calWrap .fc .fc-button {
        transition: transform .15s ease-out;
        transform-origin: center;
        padding: 0.2rem 0.5rem !important;   /* width/height */
        font-size: 1.1rem !important;        /* text size */
        border-radius: 5px !important;     /* pill shape */
        line-height: 1.2 !important;
        min-height: 1.75rem;
      }

      #calWrap .fc .fc-button:hover {
        transform: scale(1.1);
      }
      #calWrap .fc .fc-button:active {
        transform: scale(1.05);
      }
      #calWrap .fc .fc-button:focus-visible {
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(14,165,233,.6) !important;
      }

      /* Smaller buttons on mobile */
      @media (max-width: 768px) {
        #calWrap .fc .fc-button {
          padding: 0.2rem 0.6rem !important;
          font-size: 1rem !important;
          font-weight: 600;
          min-height: 1.5rem;
          
        }
      }

      /* ---------- Day Grid: Other Month Days ---------- */
      #calWrap .fc .fc-day-other .fc-daygrid-day-number {
        color: rgba(148,163,184,0.99) !important;
      }
      #calWrap .fc .fc-day-other .fc-daygrid-day-frame {
        opacity: 1 !important;
      }

      #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
        color: #a1a1aa !important;
      }
      #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-top,
      #calWrap .fc .fc-daygrid-day.fc-day-other .fc-event {
        opacity: 1 !important;
      }

      /* ---------- Today Styles ---------- */
      #calWrap .fc .fc-daygrid-day.fc-day-today {
        outline: none !important;
        box-shadow: inset 0 0 0 3px ${primaryAccent} !important;
      }

      #calWrap .fc {
        --fc-highlight-color: ${primaryAccent}98 !important;
        --fc-today-bg-color: ${primaryAccent}30 !important;
        --fc-page-bg-color: #09090b !important;
      }
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
      left: lgUp
        ? "toggleShifts,toggleVac,toggleTrain,toggleCov,toggleSwap"
        : "toggleShifts",
      center: "title",
      right: "prev,next",
    }),
    []
  );

  return (
    <motion.div
      id="calWrap"
      className="w-full h-full relative rounded-xl text-zinc-200"
      style={styleVars}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{styleText}</style>
      {popUp && <PopUp props{...popUp} />}

      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin, rrulePlugin, listPlugin]}
        initialView={lgUp ? "dayGridMonth" : "listWeek"}
        height={height}
        unselectAuto={false}
        // allEvents is already memoized in the provider; pass through directly
        eventSources={allEvents}
        selectable={interactive}
        select={handleSelect}
        customButtons={customButtons}
        headerToolbar={headerToolbar}
        eventClick={handleClickEvent}
        eventDidMount={handleEventDidMount}
      />
    </motion.div>
  );
}

export default memo(ScheduleCalendar);
