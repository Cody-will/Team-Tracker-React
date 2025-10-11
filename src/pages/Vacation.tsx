import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import { useUser } from "../pages/context/UserContext";
import Button from "../components/Button";
import { useSchedule } from "./context/ScheduleContext";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import PopUp from "../components/PopUp";
import type { ScheduleEvent } from "./context/ScheduleContext";
import type { Location } from "../components/PopUp";

type DateData = { start: Date | string; end: Date | string; allDay?: boolean };
type ErrorNotify = {
  key: string;
  title: string;
  message: string;
  location: Location;
  onClose: () => void;
  timer?: number;
};

export default function Vacation() {
  const { data } = useUser();
  const { scheduleEvent } = useSchedule();
  const [selectedDate, setSelectedDate] = useState<DateData | null>(null);
  const [showCoverage, setShowCoverage] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [error, setError] = useState<ErrorNotify | null>(null);
  const [isSelected, setSelected] = useState<boolean>(true);
  const [interactive, setinteractive] = useState<boolean>(true);

  const inputStyle =
    "border-2 border-zinc-900 w-full  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  function handleSelect(dateData: DateSelectArg) {
    const { start, end, allDay } = dateData;
    setSelectedDate({ start, end, allDay });
  }

  async function handleSchedule(coverage: boolean) {
    if (!selectedDate) return;
    const { start, end, allDay } = selectedDate;
    const newStart: number = new Date(start).getTime();
    const newEnd: number = new Date(end).getTime();
    const firstName = data[selectedUser].firstName;
    const lastName = data[selectedUser].lastName;
    const event: ScheduleEvent = {
      originUID: selectedUser,
      title: `Vacation ${lastName}, ${firstName}`,
      start: newStart,
      end: newEnd,
      allDay: allDay,
      eventType: "Vacation",
      display: "block",
      coverage,
    };

    const isScheduled = await scheduleEvent(event);
    if (isScheduled) {
      setShowSuccess(true);
      setSelected(false);
      setSelectedDate(null);
    }
  }

  function onCloseCoverage(result: boolean) {
    setShowCoverage(false);
    handleSchedule(result);
  }

  function onCloseSuccess() {
    setShowSuccess(false);
    setSelected(true);
    setinteractive(true);
  }

  function handleSubmit() {
    if (selectedUser === "" || selectedUser === "Select Employee") {
      const notify: ErrorNotify = {
        key: "no_employee",
        title: "Oops",
        message: "No employee selected",
        location: "top-center",
        onClose: handleErrorPopUp,
        timer: 3,
      };
      setError(notify);
      return;
    } else if (!selectedDate) {
      const notify: ErrorNotify = {
        key: "no_date",
        title: "Oops",
        message: "No dates selected",
        location: "top-center",
        onClose: handleErrorPopUp,
        timer: 3,
      };
      setError(notify);
      return;
    }
    setShowCoverage(true);
    setinteractive(false);
  }

  function handleErrorPopUp() {
    setError(null);
  }

  return (
    <div className="flex items-center justify-center h-full w-full p-4">
      <AnimatePresence>
        {showCoverage && (
          <PopUp
            key="coverage"
            isConfirm
            open={showCoverage}
            onClose={onCloseCoverage}
            title="Coverage"
            message="Will coverage be needed for selected days?"
            location="top-center"
            trueText="Yes"
            falseText="No"
          />
        )}
        {showSuccess && (
          <PopUp
            key="success"
            open={showSuccess}
            onClose={onCloseSuccess}
            title="Success"
            message="Event successfuly scheduled"
            location="top-center"
            timer={3}
          />
        )}
        {error && (
          <PopUp
            key={error?.key}
            onClose={error?.onClose}
            title={error?.title}
            message={error?.message}
            location={error?.location}
            timer={error?.timer}
          />
        )}
      </AnimatePresence>
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
            <select
              onChange={(e) => setSelectedUser(e.target.value)}
              className={inputStyle}
            >
              <option value="">Select employee</option>
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
            <Button
              disabled={showCoverage}
              text={"Submit"}
              action={handleSubmit}
              type="button"
            />
          </div>
        </div>
        <div className="w-full h-full">
          <div className="border border-zinc-950 h-full w-full p-4 rounded-xl">
            <ScheduleCalendar
              interactive={interactive}
              selected={isSelected}
              handleSelect={handleSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
