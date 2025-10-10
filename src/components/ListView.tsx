import { useState } from "react";
import { motion } from "motion/react";
import CoverageItem from "./CoverageItem";
import type { DayEvent } from "../pages/context/ScheduleContext";

export interface ListViewProps {
  events: DayEvent[];
}

export default function ListView(props: ListViewProps) {
  const { events } = props;

  return (
    <motion.div className="w-full grid grid-cols-2 items-center justify-center gap-2">
      {events &&
        events.map((event) => <CoverageItem key={event.id} event={event} />)}
    </motion.div>
  );
}
