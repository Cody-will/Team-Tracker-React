import { DayPicker } from "react-day-picker";

export default function Calendar({ range, setRange }) {
  return (
    <DayPicker
      mode="range"
      animate
      selected={range}
      onSelect={setRange}
      navLayout="around"
      showOutsideDays={true}
      fixedWeeks={6}
      classNames={{
        day_button: "h-full w-full flex",
        today: "text-sky-500 bg-sky-500",
        range_start: "bg-sky-500 text-zinc-900",
        range_middle: "bg-sky-500 text-zinc-900",
        range_end: "bg-sky-500 text-zinc-900",
        caption_label: "text-2xl",
        weekdays: "grid text-lg font-semibold grid-cols-7",
        week: "grid gap-2 grid-cols-7",
        weeks: "grid gap-2",
        day: "w-22 min-h-16 font-semibold hover:cursor-pointer hover:scale-110 p-1 rounded-md border-2 border-zinc-200 text-sm text-zinc-200 hover:bg-sky-500 hover:border-sky-500 hover:txt-zinc-900",
        selected:
          "bg-sky-500 border border-sky-500 text-zinc-900 hover:bg-sky-700",
        chevron:
          "fill-sky-500 hover:scale-150 transition duration-300 ease-in-out",
        outside: "text-zinc-400 border-zinc-400",
      }}
    />
  );
}
