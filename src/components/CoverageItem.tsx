import { useState } from "react";
import { useUser } from "../pages/context/UserContext";
import type { DayEvent } from "../pages/context/ScheduleContext";
import { motion } from "motion/react";
import Button from "./Button";

export interface CoverageItemProps {
  event: DayEvent;
  onClick: (event: DayEvent) => Promise<void>;
}

export default function CoverageItem(props: CoverageItemProps) {
  const { event, onClick } = props;
  const { originUID, day } = event;
  const { data: users, userSettings, user } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
  const { firstName, lastName, Shifts } = users[originUID];
  const date = toLocalDateFromISODateOnly(day).toDateString();

  function toLocalDateFromISODateOnly(isoDate: string) {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  return (
    <motion.div
      id="panel"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      exit={{ scaleX: 0 }}
      transition={{ duration: 0.3, type: "tween" }}
      layout
      style={{ borderColor: `${secondaryAccent}` }}
      className="flex items-center border bg-zinc-950/50 justify-center gap-4 w-full text-lg font-semibold text-zinc-300 p-2 rounded-lg"
    >
      <div className=" text-xl font-semibold whitespace-nowrap flex items-center justify-start">{`${lastName}, ${firstName}`}</div>
      <div className="whitespace-nowrap flex items-start justify-center">
        {Shifts}
      </div>
      <div className=" whitespace-nowrap flex items-center justify-start">
        {event.eventType}
      </div>
      <div className="w-full whitespace-nowrap flex justify-center items-center">
        <div className="w-full flex items-center justify-center whitespace-nowrap">
          {date}
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Button
          text="Work Day"
          action={() => onClick(event)}
          fontSize="text-sm"
        />
      </div>
    </motion.div>
  );
}
