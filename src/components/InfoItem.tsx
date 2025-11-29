import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { ScheduleEvent, DayEvent } from "../pages/context/ScheduleContext";
import { useUser } from "../pages/context/UserContext";
import type { User } from "../pages/context/UserContext";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

export interface InfoItemProps {
  event?: ScheduleEvent;
  coverage?: DayEvent;
}

export default function InfoItem(props: InfoItemProps) {
  const [user, setUser] = useState<User>();
  const { event, coverage } = props;
  const { data: users } = useUser();
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  useEffect(() => {
    if (event) setUser(users[event.originUID]);
    if (coverage) setUser(users[coverage.originUID]);
  }, []);
  const title = getTitle();
  const startDate = event && event.start;
  const endDate = event && event.end;
  const coverDate = coverage && coverage.day;

  function getDates() {
    if (coverage) return `${splitDate(coverDate as string)}`;
    if (event)
      return `${splitDate(startDate as string)} - ${splitDate(
        endDate as string
      )}`;
  }

  function getTitle() {
    if (event) return event.title;
    if (coverage) return coverage.title;
  }

  function splitDate(date: string) {
    const sep = date.split("-");
    return `${sep[1]}/${sep[2]}/${sep[0]}`;
  }

  return (
    <motion.div
      style={{ borderColor: primaryAccent }}
      className="w-full flex justify-evenly items-center text-zinc-200 border-2 font-medium rounded-md bg-zinc-900 shadow-lg/40 shadow-zinc-950"
    >
      <div className="flex justify-start pl-3 items-center w-full">{title}</div>
      <div className="flex justify-start px-3 items-center text-zinc-200 text-nowrap">
        {getDates()}
      </div>
    </motion.div>
  );
}
