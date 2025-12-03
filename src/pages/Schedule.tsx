// pages/Schedule.tsx (or wherever your page lives)
import { useEffect, useState } from "react";
import ScheduleCalendarLazy from "../components/ScheduleCalendarLazy";

export default function Schedule() {
  const [mountCalendar, setMountCalendar] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMountCalendar(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="w-full h-dvh lg:h-full p-4">
      <div
        id="panel"
        className="p-4 bg-zinc-950/70 border border-zinc-800 text-zinc-200 h-full w-full rounded-xl"
      >
        {mountCalendar ? (
          <ScheduleCalendarLazy height="100%" interactive selected />
        ) : (
          <div className="w-full h-full rounded-xl bg-zinc-950/60 border border-zinc-800" />
        )}
      </div>
    </div>
  );
}
