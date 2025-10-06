import { useState } from "react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import { useUser } from "../pages/context/UserContext";
import Button from "../components/Button";
import { useSchedule } from "./context/ScheduleContext";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import PopUp from "../components/PopUp";

type DateData = { start: Date; end?: Date; allDay: boolean };

export default function Vacation() {
  const { data } = useUser();
  const [selectedDate, setSelectedDate] = useState<DateData | {}>({});
  const [open, setOpen] = useState<boolean>(false);

  const inputStyle =
    "border-2 border-zinc-900 w-full  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  function handleSelect(dateData: DateSelectArg) {
    const { start, end, allDay } = dateData;
    setSelectedDate({ start, end, allDay });
  }

  function onClose(result: boolean) {}

  function handleSubmit() {}

  return (
    <div className="flex items-center justify-center h-full w-full p-4">
      <PopUp
        open={open}
        onClose={onClose}
        title="Confirm"
        message="Are you sure?"
        location="top-center"
      />
      <div
        id="panel"
        className="p-4 bg-zinc-950/30 border border-zinc-800 text-zinc-200 flex flex-col gap-4 items-center justify-center h-full w-full rounded-xl"
      >
        <div className="w-full flex gap-4">
          <div className="w-full flex items-center justify-start">
            <div className="text-zinc-200 flex justify-start items-center text-3xl py-2">
              Vacation
            </div>
          </div>
          <div className="w-full flex items-center justify-center">
            <select className={inputStyle}>
              <option value="">Select person</option>
              {data &&
                Object.entries(data).map(([id, user]) => (
                  <option
                    key={id}
                    value={user.uid}
                  >{`${user.lastName}, ${user.firstName} - ${user.badge}`}</option>
                ))}
            </select>
          </div>
          <div className="w-full flex items-center justify-center">
            <Button text={"next"} action={() => {}} type="button" />
          </div>
        </div>
        <div id="thisOne" className="w-full h-full">
          <div className="border border-zinc-950 h-full w-full p-4 rounded-xl">
            <ScheduleCalendar interactive={true} handleSelect={handleSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}
