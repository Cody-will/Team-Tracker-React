import { motion, AnimatePresence } from "motion/react";
import CoverageItem from "./CoverageItem";
import type { DayEvent, ScheduleEvent } from "../pages/context/ScheduleContext";
import { useUser } from "../pages/context/UserContext";
import { useSchedule } from "../pages/context/ScheduleContext";

export interface ListViewProps {
  events: DayEvent[];
  onComplete: () => void;
}

export default function ListView(props: ListViewProps) {
  const { events, onComplete } = props;
  const { data: users, user } = useUser();
  const { addClaimedCoverage } = useSchedule();

  async function submitDay(event: DayEvent) {
    const { id, originUID, display, eventType, day } = event;
    const targetUID = user?.uid;
    const origin = users[event.originUID];
    const title = `${user?.lastName}, ${user?.firstName[0]} #${user?.badge} covering ${origin.lastName}, ${origin.firstName[0]} #${origin.badge}`;
    const newEvent: DayEvent = {
      id,
      originUID,
      targetUID,
      title,
      display,
      eventType,
      day,
      claimed: true,
      allDay: true,
      start: day,
    };

    const isAdded = await addClaimedCoverage(newEvent);
    if (isAdded) onComplete();
  }

  return (
    <motion.div className="w-full grid grid-cols-2 items-center justify-center gap-2">
      <AnimatePresence>
        {events &&
          events.map((event) => (
            <CoverageItem key={event.id} event={event} onClick={submitDay} />
          ))}
      </AnimatePresence>
    </motion.div>
  );
}
