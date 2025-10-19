import ScheduleCalendar from "../components/ScheduleCalendar";

export default function Schedule() {
  return (
    <div className="w-full h-full p-4">
      <div
        id="panel"
        className="p-4 bg-zinc-950/70 border border-zinc-800 text-zinc-200 h-full w-full rounded-xl"
      >
        <ScheduleCalendar />
      </div>
    </div>
  );
}
