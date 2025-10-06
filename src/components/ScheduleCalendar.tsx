import FullCalendar from "@fullcalendar/react";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useUser } from "../pages/context/UserContext";
import Holidays from "date-holidays";
import { useSchedule } from "../pages/context/ScheduleContext";
import rrulePlugin from "@fullcalendar/rrule";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
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
}

export default function ScheduleCalendar({
  height = "100%",
  interactive = false,
  handleSelect,
}: CalendarProps) {
  const { userSettings } = useUser();
  const { allEvents } = useSchedule();
  const { primaryAccent, secondaryAccent } = userSettings;

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
        ["--fc-event-text-color" as any]: "#fafafa",
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
    color: rgba(148, 163, 184, 0.99); /* zinc-400 @ 45% */
    }
    .fc .fc-day-other .fc-daygrid-day-frame {
      opacity: 1; /* optional: fade the whole cell slightly */
    }

    #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
      color: #a1a1aa; /* tailwind zinc-400 */
    }

    /* Optional: also dim event text/pills in other-month cells */
    #calWrap .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-top,
    #calWrap .fc .fc-daygrid-day.fc-day-other .fc-event {
      opacity: 1;
    }

    #calWrap .fc {
      --fc-highlight-color: ${primaryAccent}98; /* sky-400 @ 25% */
    }
      

    /* Today: keep the normal background but add an accent outline */
    #calWrap .fc .fc-daygrid-day.fc-day-today {
      outline: none;               /* remove default outline if any */
      box-shadow: inset 0 0 0 3px ${primaryAccent};
    }

    /* If FullCalendar's "today" background is too strong, you can lighten it: */
    #calWrap .fc {
      --fc-today-bg-color: ${primaryAccent}30; /* subtle sky-400 tint; tweak as you like */
    }
  `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
        initialView="dayGridMonth"
        height={height}
        events={allEvents}
        selectable={interactive}
        select={handleSelect ? handleSelect : () => {}}
      />
    </div>
  );
}
