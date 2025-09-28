import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import { useUser } from "../pages/context/UserContext";
import Holidays from "date-holidays";

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

export default function ScheduleCalendar() {
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
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
  const allHolidays = [...currentHolidays, ...nextHolidays];

  return (
    <div
      className="w-full h-full text-zinc-200 "
      style={{
        ["--fc-today-bg-color" as any]: primaryAccent,
        ["--fc-button-text-color" as any]: "#0a0a0a",
        ["--fc-button-bg-color" as any]: primaryAccent,
        ["--fc-button-border-color" as any]: "transparent",
        ["--fc-button-hover-bg-color" as any]: primaryAccent,
        ["--fc-button-hover-border-color" as any]: "transparent",
        ["--fc-button-active-bg-color" as any]: primaryAccent,
        ["--fc-button-active-border-color" as any]: "transparent",
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
    opacity: .99; /* optional: fade the whole cell slightly */
  }
  `}</style>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="100%"
        events={allHolidays}
      />
    </div>
  );
}
