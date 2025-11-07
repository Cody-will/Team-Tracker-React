import React, { lazy, Suspense, useEffect, useState } from "react";

const ScheduleCalendarHeavy = lazy(() => import("./ScheduleCalendar"));

type Props = {
  height?: string;
  interactive?: boolean;
  handleSelect?: any;
  selected?: boolean;
  /** wait this many ms before mounting the heavy calendar (default: 16ms) */
  delayMs?: number;
  /** if true, render nothing while loading (no skeleton) */
  suppressSkeleton?: boolean;
};

function CalendarSkeleton({ height = "100%" }: { height?: string }) {
  return (
    <div
      className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 animate-pulse"
      style={{ height }}
      aria-busy
      aria-label="Loading calendar"
    />
  );
}

export default function ScheduleCalendarLazy({
  delayMs = 16,
  suppressSkeleton = false,
  ...props
}: Props) {
  const [ready, setReady] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const id = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);

  if (!ready) {
    return suppressSkeleton ? null : <CalendarSkeleton height={props.height} />;
  }

  const fallback = suppressSkeleton ? null : (
    <CalendarSkeleton height={props.height} />
  );

  return (
    <Suspense fallback={fallback}>
      <ScheduleCalendarHeavy {...props} />
    </Suspense>
  );
}

/** Call to prefetch the heavy chunk without mounting it */
export function prefetchScheduleCalendar() {
  // @ts-ignore
  import(/* webpackPrefetch: true */ "./ScheduleCalendar");
}
