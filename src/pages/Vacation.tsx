import { useState } from "react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import { useUser } from "../pages/context/UserContext";
import { useSchedule } from "./context/ScheduleContext";

export default function Vacation() {
  return (
    <div className="h-full w-full p-4">
      <div
        id="panel"
        className="p-4 bg-zinc-950/30 border border-zinc-800 text-zinc-200 h-full w-full rounded-xl"
      >
        <div className="text-zinc-200 flex justify-start items-center text-3xl py-2">
          Vacation
        </div>
        <div className="border border-zinc-950 h-full w-full p-4 rounded-xl">
          <ScheduleCalendar />
        </div>
      </div>
    </div>
  );
}
