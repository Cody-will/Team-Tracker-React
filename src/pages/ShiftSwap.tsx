import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import ScheduleCalendarLazy, {
  prefetchScheduleCalendar,
} from "../components/ScheduleCalendarLazy";
import { motion, AnimatePresence } from "motion/react";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import Button from "../components/Button";
import { BsArrowRight } from "react-icons/bs";
import { User, useUser } from "./context/UserContext";
import type { DateData, ErrorNotify } from "./Vacation";
import PopUp from "../components/PopUp";
import type { ScheduleEvent } from "./context/ScheduleContext";
import { useSchedule } from "./context/ScheduleContext";
import { useBreakpoint } from "./hooks/useBreakpoint";

export default function ShiftSwap() {
  const [step, setStep] = useState<0 | 1>(0);
  const [mountCalendars, setMountCalendars] = useState(false);
  const [requestedDays, setRequestedDays] = useState<DateData | null>(null);
  const [offeredDays, setOfferedDays] = useState<DateData | null>(null);
  const { data: users, user: currUser } = useUser();
  const [error, setError] = useState<ErrorNotify | null>(null);
  const [selectedEmployee, setEmployee] = useState<string>("");
  const { scheduleEvent } = useSchedule();
  const { twoXlUp } = useBreakpoint();

  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-md py-1 px-1.5 2xl:rounded-lg 2xl:py-2 2xl:px-3 focus:outline-none focus:border-[var(--accent)] focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] 2xl:focus:shadow-[0_0_5px_1px_var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

  const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const DURATION = 0.3;

  useEffect(() => {
    const ric =
      (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 120));
    const cic = (window as any).cancelIdleCallback || clearTimeout;
    const id = ric(() => prefetchScheduleCalendar());
    return () => cic(id);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMountCalendars(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleSelectRequested = useCallback((d: DateSelectArg) => {
    const { start, end, allDay } = d;
    setRequestedDays({ start, end, allDay });
  }, []);
  const handleSelectOffered = useCallback((d: DateSelectArg) => {
    const { start, end, allDay } = d;
    setOfferedDays({ start, end, allDay });
  }, []);

  async function handleSubmit() {
    const noEmployee: ErrorNotify = {
      key: "no-employee",
      title: "Oops!",
      message: "Employee must be selected",
      onClose: closePopup,
      location: "top-center",
    };
    const noDate: ErrorNotify = {
      key: "no-date-selected",
      title: "Oops!",
      message: "Must select date(s) to work",
      onClose: closePopup,
      location: "top-center",
    };

    if (!currUser || !currUser.uid) {
      setError({
        key: "no-user",
        title: "Oops!",
        message: "Current user not found.",
        onClose: closePopup,
        location: "top-center",
      });
      return;
    }
    if (!selectedEmployee) {
      setError(noEmployee);
      return;
    }
    const selected = users?.[selectedEmployee];
    if (!selected) {
      setError({
        key: "bad-employee",
        title: "Oops!",
        message: "Selected employee not found.",
        onClose: closePopup,
        location: "top-center",
      });
      return;
    }
    if (!requestedDays || !offeredDays) {
      setError(noDate);
      return;
    }

    const { start: reqStart, end: reqEnd, allDay: reqAllDay } = requestedDays;
    const { start: targStart, end: targEnd, allDay: targAllDay } = offeredDays;

    const newReqStart = new Date(reqStart).getTime();
    const newReqEnd = new Date(reqEnd).getTime();
    const newTargStart = new Date(targStart).getTime();
    const newTargEnd = new Date(targEnd).getTime();

    const reqUser: ScheduleEvent = {
      originUID: selectedEmployee,
      targetUID: currUser.uid,
      title: `Shift Swap ${currUser.lastName} #${currUser.badge} for ${selected.lastName} #${selected.badge}`,
      start: newTargStart,
      end: newTargEnd,
      allDay: targAllDay,
      display: "block",
      eventType: "Shift-Swap",
    };

    const targUser: ScheduleEvent = {
      originUID: currUser.uid,
      targetUID: selected.uid,
      title: `Shift Swap ${selected.lastName} #${selected.badge} for ${currUser.lastName} #${currUser.badge}`,
      start: newReqStart,
      end: newReqEnd,
      allDay: reqAllDay,
      display: "block",
      eventType: "Shift-Swap",
    };

    const addReqUser = await addToSchedule(reqUser);
    const addTargUser = await addToSchedule(targUser);

    if (addReqUser && addTargUser) success(), resetPage();
  }

  async function addToSchedule(event: ScheduleEvent): Promise<boolean> {
    const completed = await scheduleEvent(event);
    return completed;
  }

  function success() {
    setError({
      key: "success",
      title: "Success!",
      message: "Shift Swap successfully added",
      location: "top-center",
      onClose: closePopup,
    });
  }

  function resetPage() {
    setOfferedDays(null);
    setRequestedDays(null);
    setStep(0);
    setEmployee("");
  }

  function closePopup() {
    setError(null);
  }

  function handleNext() {
    if (!requestedDays) {
      setError({
        key: "no-date",
        title: "Oops!",
        message: "Please select a date",
        location: "top-center",
        onClose: closePopup,
      });
      return;
    }
    setStep(1);
  }

  function handleBack() {
    setStep(0);
  }

  const slide = useMemo(
    () => ({
      initialLeft: { x: 0, filter: "none", opacity: 1 },
      exitLeft: { x: -1800, filter: "blur(15px)", opacity: 0.9 },
      initialRight: { x: 1800, filter: "blur(15px)", opacity: 0.9 },
      enterCenter: { x: 0, filter: "none", opacity: 1 },
    }),
    []
  );

  return (
    <motion.div className="h-full w-full flex items-center justify-center p-4">
      <AnimatePresence>
        {error && (
          <PopUp
            key={error?.key}
            title={error?.title}
            message={error?.message}
            location={error?.location}
            onClose={error?.onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        id="panel"
        className="flex h-full w-full flex-col gap-4 p-4 items-center justify-center bg-zinc-950/70 border border-zinc-800 rounded-xl"
      >
        <motion.div className="w-full flex items-center justify-center gap-2">
          <div className="font-semibold w-full text-2xl 2xl:text-3xl text-zinc-200 flex items-center justify-start">
            Shift Swap
          </div>

          <div className="w-full flex flex-col gap-2 items-center justify-center">
            <select
              className={inputStyle}
              value={selectedEmployee}
              onChange={(e) => setEmployee(e.target.value)}
            >
              <option value="">Select Employee</option>
              {users &&
                currUser &&
                Object.entries(users).map(([uid, u]) =>
                  u.badge !== currUser.badge ? (
                    <option key={uid} value={uid}>
                      {`${u.lastName}, ${u.firstName[0]} #${u.badge}`}
                    </option>
                  ) : null
                )}
            </select>

            <div className="relative w-full flex items-center jusitify-center h-6 overflow-hidden">
              <motion.div
                initial={false}
                animate={
                  step === 0
                    ? { x: 0, filter: "none", opacity: 1 }
                    : { x: -1800, filter: "blur(15px)", opacity: 0.9 }
                }
                transition={{ duration: DURATION, ease: EASE }}
                className="absolute flex items-center justify-center inset-0 text-zinc-200 text-lg"
              >
                Select dates you need covered
              </motion.div>

              <motion.div
                initial={false}
                animate={
                  step === 1
                    ? { x: 0, filter: "none", opacity: 1 }
                    : { x: 1800, filter: "blur(15px)", opacity: 0.9 }
                }
                transition={{ duration: DURATION, ease: EASE }}
                className="absolute flex items-center justify-center inset-0 text-zinc-200 text-lg"
              >
                Select dates you want to work
              </motion.div>
            </div>
          </div>

          <motion.div
            layout
            style={{ justifyContent: step === 0 ? "end" : "end" }}
            className="w-full ml-4 flex items-center gap-4 text-zinc-200"
          >
            <motion.button
              type="button"
              layout="position"
              onClick={step === 0 ? handleNext : handleBack}
              aria-label={step === 0 ? "Next" : "Back"}
              className="p-2 hover:cursor-pointer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.98 }}
              animate={{ rotate: step === 0 ? 0 : 180, x: step === 0 ? 0 : -2 }}
              transition={{ duration: DURATION, ease: EASE }}
              style={{ transformOrigin: "center" }}
            >
              <BsArrowRight size={twoXlUp ? 48 : 38} />
            </motion.button>

            <motion.div
              animate={{ width: step === 0 ? 0 : "100%" }}
              className="flex items-center justify-end"
            >
              <AnimatePresence initial={false} mode="wait">
                {step === 1 && (
                  <motion.div
                    key="submit"
                    initial={{ x: 24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 24, opacity: 0 }}
                    transition={{ duration: DURATION, ease: EASE }}
                    className="flex w-1/2 items-center"
                  >
                    <Button text="Submit" action={handleSubmit} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="relative w-full h-full overflow-hidden">
          {mountCalendars && (
            <motion.div
              key="cal-requested"
              initial={slide.initialLeft}
              animate={step === 0 ? slide.enterCenter : slide.exitLeft}
              transition={{ duration: DURATION, ease: EASE }}
              className="absolute inset-0"
              style={{ pointerEvents: step === 0 ? "auto" : "none" }}
            >
              <ScheduleCalendarLazy
                height="100%"
                handleSelect={handleSelectRequested}
                interactive
                selected
                delayMs={0}
                suppressSkeleton
              />
            </motion.div>
          )}

          {mountCalendars && (
            <motion.div
              key="cal-offered"
              initial={slide.initialRight}
              animate={step === 1 ? slide.enterCenter : slide.initialRight}
              transition={{ duration: DURATION, ease: EASE }}
              className="absolute inset-0"
              style={{ pointerEvents: step === 1 ? "auto" : "none" }}
            >
              <ScheduleCalendarLazy
                height="100%"
                handleSelect={handleSelectOffered}
                interactive
                selected
                delayMs={0}
                suppressSkeleton
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
