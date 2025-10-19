import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import { useUser } from "../pages/context/UserContext";
import Button from "../components/Button";
import { useSchedule } from "./context/ScheduleContext";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import PopUp from "../components/PopUp";
import type { ScheduleEvent, EventType } from "./context/ScheduleContext";
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
  const [selectedType, setSelectedType] = useState<EventType | "">("");
  const [trainingInput, setTrainingInput] = useState("");

  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:border-[var(--accent)] focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

  function handleSelect(dateData: DateSelectArg) {
    const { start, end, allDay } = dateData;
    setSelectedDate({ start, end, allDay });
  }

  async function handleSchedule(coverage: boolean) {
    if (!selectedDate) return;
    const { start, end, allDay } = selectedDate;
    const newStart: number = new Date(start).getTime();
    const newEnd: number = new Date(end).getTime();
    if (!selectedType)
      return setError({
        key: "no-type",
        title: "Oops",
        message: "Type of event must be selected",
        location: "top-center",
        onClose: handleErrorPopUp,
        timer: 3,
      });
    const event: ScheduleEvent = {
      originUID: selectedUser,
      title: getTitle(selectedType),
      start: newStart,
      end: newEnd,
      allDay: allDay,
      eventType: selectedType,
      display: "block",
      coverage,
    };

    const isScheduled = await scheduleEvent(event);
    if (isScheduled) {
      setShowSuccess(true);
      setSelected(false);
      setSelectedDate(null);
      setSelectedType("");
      setSelectedUser("");
    }
  }

  function getTitle(eventType: EventType) {
    const firstName = data[selectedUser].firstName;
    const lastName = data[selectedUser].lastName;
    const badge = data[selectedUser].badge;
    switch (eventType) {
      case "Vacation":
        return `Vacation ${lastName}, ${firstName} #${badge}`;
      case "Training":
        return `Training( ${lastName}, ${
          firstName[0]
        } #${badge} ) ${trainingInput.trim()}`;
      case "Shift-Swap":
        return "";
      default:
        return "";
    }
  }

  // This function handles passing out the value from the pop up asking if coverage is needed
  function onCloseCoverage(result: boolean) {
    setShowCoverage(false);
    handleSchedule(result);
  }

  // This function handles the pop up after the event has been scheduled
  function onCloseSuccess() {
    setShowSuccess(false);
    setSelected(true);
    setinteractive(true);
  }

  // This function handles submit when the event is scheduled
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
    <motion.div
      layout
      className="flex items-center justify-center h-full w-full p-4"
    >
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
        className="p-4 bg-zinc-950/70 border border-zinc-800 text-zinc-200 flex flex-col gap-4 items-center justify-center h-full w-full rounded-xl"
      >
        <motion.div layout className="w-full flex gap-4">
          <div className="w-full gap-2 flex items-center justify-start">
            <div className="text-zinc-200 flex justify-start items-center text-3xl py-2">
              Scheduling
            </div>
          </div>
          <div className="w-full flex flex-col gap-2 items-center justify-center">
            <div className="w-full flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as EventType)}
                className={inputStyle}
              >
                <option value="">Select Type</option>
                <option value="Vacation">Vacation</option>
                <option value="Training">Training</option>
                <option value="Shift-Swap">Shift Swap</option>
              </select>
              <select
                value={selectedUser}
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

            <AnimatePresence initial={false}>
              {selectedType === "Training" && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  exit={{ width: 0 }}
                  transition={{
                    duration: 0.3,
                    type: "tween",
                  }}
                  className="w-full"
                >
                  <input
                    onChange={(e) => setTrainingInput(e.target.value)}
                    placeholder="Enter training class name"
                    className={inputStyle}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-full flex items-center justify-center">
            <Button
              disabled={showCoverage}
              text={"Submit"}
              action={handleSubmit}
              type="button"
            />
          </div>
        </motion.div>
        <motion.div layout className="w-full h-full">
          <motion.div
            layout
            className="border border-zinc-950 h-full w-full p-4 rounded-xl"
          >
            <ScheduleCalendar
              interactive={interactive}
              selected={isSelected}
              handleSelect={handleSelect}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
