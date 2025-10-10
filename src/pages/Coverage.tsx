import { useState, useEffect } from "react";
import ListView from "../components/ListView";
import { motion } from "motion/react";
import Button from "../components/Button";
import { useUser } from "./context/UserContext";
import { useSchedule } from "./context/ScheduleContext";
import type { ScheduleEvent, DayEvent } from "./context/ScheduleContext";

//TODO:
// Set up functionality for when the user picks up the shift

export default function Coverage() {
  const [view, setView] = useState(true);
  const { userSettings, user, data: users } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
  const { coverage } = useSchedule();
  const [filteredEvents, setFilteredEvents] = useState<DayEvent[] | []>([]);

  useEffect(() => {
    if (!user || !coverage) return;
    setFilteredEvents(
      filterEvents(
        coverage.filter((e) => user?.Shifts != users[e.originUID].Shifts)
      )
    );
  }, [coverage, user]);

  function filterEvents(event: DayEvent[]): DayEvent[] {
    return event.filter((e) => user?.Shifts != users[e.originUID].Shifts);
  }

  function handleViewChange() {
    setView((prev) => !prev);
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <motion.div
        id="panel"
        layout
        className="flex flex-col gap-4 items-center justify-center bg-zinc-950/30 border border-zinc-700 rounded-xl p-4"
      >
        <div className="flex w-full">
          <div className="flex items-center justify-center text-2xl text-zinc-200 font-semibold">
            Coverage
          </div>
          <div className="w-full"></div>
          <Button
            text="Change View"
            action={handleViewChange}
            color={view ? primaryAccent : secondaryAccent}
          />
        </div>
        {view && <ListView events={filteredEvents} />}
      </motion.div>
    </div>
  );
}
