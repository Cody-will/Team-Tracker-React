import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ScheduleCalendarLazy from "../components/ScheduleCalendarLazy";
import { useUser } from "../pages/context/UserContext";
import Button from "../components/Button";
import { useSchedule } from "./context/ScheduleContext";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import PopUp from "../components/PopUp";
import type { ScheduleEvent, EventType } from "./context/ScheduleContext";
import type { Location } from "../components/PopUp";
import { useBreakpoint } from "./hooks/useBreakpoint";

export type DateData = {
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
};
export type ErrorNotify = {
  key: string;
  title: string;
  message: string;
  location: Location;
  onClose: () => void;
  timer?: number;
};

export default function Vacation() {
  const { data, user } = useUser();
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
  const { lgUp } = useBreakpoint();

  const [mountCalendar, setMountCalendar] = useState(false);
  const excludes = ["", "Range", "Jail-School"];
  useEffect(() => {
    const id = requestAnimationFrame(() => setMountCalendar(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const inputStyle =
    "border-2 border-zinc-500 w-full 2xl:text-base text-md text-zinc-200 bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:outline-none focus:border-[var(--accent)] focus:ring-1 f2xl:ocus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

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
      allDay,
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
    if (eventType === "Range") return "Range Day";
    const u = data[selectedUser];
    const firstName = u?.firstName ?? "";
    const lastName = u?.lastName ?? "";
    const badge = u?.badge ?? "";
    if (eventType === "Vacation")
      return `Vacation ${lastName}, ${firstName} #${badge}`;
    if (eventType === "Training")
      return `Training (${lastName}, ${
        firstName[0] ?? ""
      } #${badge}) ${trainingInput.trim()}`;
    if (eventType === "Jail-School") return "Jail School";
    return "";
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
    if (
      (selectedType !== "Range" &&
        selectedType !== "Jail-School" &&
        selectedUser === "") ||
      selectedUser === "Select Employee"
    ) {
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
    if (selectedType !== "Range" && selectedType !== "Jail-School") {
      setShowCoverage(true);
    }
    setinteractive(false);
    if (selectedType === "Range" || selectedType === "Jail-School") {
      handleSchedule(false);
    }
  }

  function hasPermission() {
    if (!user) return;
    return user.Role === "Admin";
  }

  function handleErrorPopUp() {
    setError(null);
  }

  if (!lgUp) {
    return (
      <div className="h-dvh w-full p-4">
        <div
          id="panel"
          className="min-h-dvh w-full border p-4 gap-4 border-zinc-900 bg-zinc-900/40 text-zinc-200 flex flex-col items-center justify-center rounded-md"
        >
          <div className="text-3xl font-bold flex items-center justify-center">
            Sorry!
          </div>
          <div className="text-lg flex items-center justify-center text-center">
            The scheduling page is currently under construction for mobile.
            Please use the desktop version for scheduling.
          </div>
        </div>
      </div>
    );
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
        className="2xl:p-4 p-2 bg-zinc-950/70 border border-zinc-800 text-zinc-200 flex flex-col gap-4 items-center justify-center h-full w-full rounded-xl"
      >
        <motion.div layout className="w-full flex gap-4">
          <div className="w-full gap-2 flex items-center justify-start">
            <div className="text-zinc-200 flex justify-start items-center text-xl lg:text-3xl py-2">
              Scheduling
            </div>
          </div>

          <div className="w-full flex flex-col gap-2 items-center justify-center">
            <div className="w-full flex gap-2">
              <motion.select
                layout
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as EventType)}
                className={inputStyle}
              >
                <option value="">Select Type</option>
                <option value="Vacation">Vacation</option>
                <option value="Training">Training</option>
                {user?.Divisions === "ADC" && (
                  <option value="Jail-School">Jail School</option>
                )}
                {user?.firearms && <option value="Range">Range Day</option>}
              </motion.select>

              <AnimatePresence>
                {!excludes.includes(selectedType) && (
                  <motion.select
                    layout
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ width: 0 }}
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">Select employee</option>
                    {data &&
                      hasPermission() &&
                      Object.entries(data).map(([id, user]) => (
                        <option
                          key={id}
                          value={user.uid}
                        >{`${user.lastName}, ${user.firstName} - ${user.badge}`}</option>
                      ))}
                    {data &&
                      !hasPermission() &&
                      Object.entries(data).map(
                        ([id, u]) =>
                          u.uid === user?.uid && (
                            <option
                              key={id}
                              value={u.uid}
                            >{`${u.lastName}, ${u.firstName} - ${u.badge}`}</option>
                          )
                      )}
                  </motion.select>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {selectedType === "Training" && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3, type: "tween" }}
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
            {mountCalendar ? (
              <ScheduleCalendarLazy
                interactive={interactive}
                selected={isSelected}
                handleSelect={handleSelect}
                height="100%"
              />
            ) : (
              // lightweight placeholder for one frame
              <div className="w-full h-full rounded-xl bg-zinc-950/60 border border-zinc-800" />
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
