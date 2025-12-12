// pages/Schedule.tsx (or wherever your page lives)
import { useEffect, useState } from "react";
import ScheduleCalendarLazy from "../components/ScheduleCalendarLazy";
import { useSafeSettings } from "./hooks/useSafeSettings";
import { primaryAccent } from "../colors";

export default function Schedule() {
  const [mountCalendar, setMountCalendar] = useState(false);
  const {primaryAccent} = useSafeSettings();
  useEffect(() => {
    const id = requestAnimationFrame(() => setMountCalendar(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="w-full h-dvh lg:h-full p-4">
      <div
        id="panel"
        style={{borderColor: `${primaryAccent}E6`}}
        className="p-4  border  text-zinc-200 h-full w-full rounded-xl"
      >
        {mountCalendar ? (
          <ScheduleCalendarLazy height="100%" interactive selected />
        ) : (
          <div className="w-full h-full rounded-xl  border " />
        )}
      </div>
    </div>
  );
}
