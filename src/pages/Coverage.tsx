import { useState, useEffect } from "react";
import ListView from "../components/ListView";
import { motion } from "motion/react";
import Button from "../components/Button";
import { useUser } from "./context/UserContext";
import { useSchedule } from "./context/ScheduleContext";
import type { DayEvent } from "./context/ScheduleContext";
import PopUp from "../components/PopUp";
import type { PopUpProps } from "../components/PopUp";
import { useSafeSettings } from "./hooks/useSafeSettings";

export default function Coverage() {
  const [view, setView] = useState(true);
  const { user, data: users } = useUser();
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const { coverage } = useSchedule();
  const [filteredEvents, setFilteredEvents] = useState<DayEvent[] | []>([]);
  const [notify, setNotify] = useState<PopUpProps | null>(null);

  // This useEffect filters all of the coverage dates so the user doesn't see the ones from their shift
  useEffect(() => {
    if (!user || !coverage) return;
    setFilteredEvents(
      filterEvents(
        coverage.filter((e) => user?.Shifts != users[e.originUID].Shifts)
      )
    );
  }, [coverage, user]);

  // This function returns the filtered events to the useEffect
  function filterEvents(event: DayEvent[]): DayEvent[] {
    return event.filter(
      (e) => user?.Shifts != users[e.originUID].Shifts && !e.claimed
    );
  }
  // This function handles switching the view from list view to the upcoming calendar view
  function handleViewChange() {
    setView((prev) => !prev);
  }

  function createNotify() {
    setNotify({
      title: "Success",
      message: "Day successfully added to schedule",
      onClose: notifyComplete,
      location: "top-center",
      timer: 3,
    });
  }

  function notifyComplete() {
    setNotify(null);
  }

  if (filteredEvents.length == 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <motion.div
          id="panel"
          layout
          style={{borderColor: `${primaryAccent}E6`}}
          className="flex flex-col gap-4 items-center justify-center  border  rounded-xl p-4"
        >
          <div className="flex w-full">
            <div className="flex items-center justify-center text-2xl text-zinc-200 font-semibold">
              Coverage
            </div>
          </div>
          <div className=" text-zinc-200">No days currently available.</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {notify && (
        <PopUp
          title={notify?.title}
          onClose={notify?.onClose}
          location={notify?.location}
          message={notify?.message}
          timer={notify?.timer}
        />
      )}
      <motion.div
        id="panel"
        layout
        style={{borderColor: `${primaryAccent}E6`}}
        className="flex flex-col gap-4 items-center justify-center  border  rounded-xl p-4"
      >
        <div className="flex w-full">
          <div className="flex items-center justify-center text-2xl text-zinc-200 font-semibold">
            Coverage
          </div>
          <div className="w-full"></div>
          {false && (
            <Button
              text="Change View"
              action={handleViewChange}
              color={view ? primaryAccent : secondaryAccent}
            />
          )}
        </div>
        {view && <ListView events={filteredEvents} onComplete={createNotify} />}
      </motion.div>
    </div>
  );
}
