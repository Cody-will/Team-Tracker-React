import { useLayoutEffect, useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { select } from "@material-tailwind/react";
import { format } from "date-fns";
import Calendar from "../components/Calendar";
import Button from "../components/Button";
import { primaryAccent, secondaryAccent } from "../colors";
import { useOutletContext } from "react-router-dom";

export default function ShiftSwap() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(null);
  const [coverRange, setCoverRange] = useState(null);
  const [workRange, setWorkRange] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState(undefined);
  const { data, loading } = useOutletContext();
  const selectedPerson = useMemo(
    () => data?.find((person) => person.badgeNum === selectedPersonId) ?? null,
    [data, selectedPersonId]
  );
  getDefaultClassNames();

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 600 : -600,
      opacity: 0,
      filter: "blur(15px)",
    }),
    center: { x: 0, opacity: 1, filter: "none" },
    exit: (dir) => ({
      x: dir < 0 ? 600 : -600,
      opacity: 0,
      filter: "blur(15px)",
    }),
  };

  const transition = { duration: 0.5, ease: "easeInOut" };

  const handleNext = () => {
    setStep((cur) => cur + 1);
    setDirection(1);
  };

  const handleBack = () => {
    setStep((cur) => cur - 1);
    setDirection(-1);
  };

  useEffect(() => {
    console.log(selectedPersonId);
  }, [selectedPersonId]);

  return (
    <div className="relative h-full w-full justify-center items-center flex">
      <motion.div
        layout
        transition={{
          default: { ease: "easeIn" },
          layout: { duration: 0.3, type: "tween" },
        }}
        id="panel"
        className="bg-zinc-900/50 overflow-hidden shadow-xl/40 rounded-xl border border-zinc-700 relative flex flex-col"
      >
        <div className="h-1/10 text-3xl font-semibold text-zinc-200 w-full flex items-center justify-start p-2">
          Shift Swap
        </div>
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {step === 1 ? (
            <StepOne
              key={step}
              selectedPersonId={selectedPersonId}
              setSelectedPersonId={setSelectedPersonId}
              handleNext={handleNext}
              data={data}
              variants={variants}
              transition={transition}
              custom={direction}
            />
          ) : step === 2 ? (
            <StepTwo
              key={step}
              handleNext={handleNext}
              handleBack={handleBack}
              variants={variants}
              transition={transition}
              custom={direction}
              range={coverRange}
              setRange={setCoverRange}
            />
          ) : step === 3 ? (
            <StepThree
              key={step}
              handleNext={handleNext}
              handleBack={handleBack}
              variants={variants}
              transition={transition}
              custom={direction}
              range={workRange}
              setRange={setWorkRange}
            />
          ) : (
            <Confirm
              key={step}
              selectedPerson={selectedPerson}
              coverRange={coverRange}
              workRange={workRange}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const StepOne = ({
  selectedPersonId,
  setSelectedPersonId,
  handleNext,
  data,
  variants,
  transition,
  custom,
}) => {
  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      custom={custom}
      className="relative w-full h-full flex flex-col text-zinc-200 gap-4 py-24 px-18 justify-center items-center"
    >
      <div className="relative justify-center items-center flex">
        Select person to swap with:
      </div>
      <select
        className={`border-2 border-zinc-500 text-lg font-semibold rounded-md px-5 py-3 focus:ring-2 focus:ring-${primaryAccent} focus:border-none focus:shadow-[0_0_10px_2px_rgba(3,105,161,0.7)] focus:outline-none`}
        value={selectedPersonId}
        onChange={(event) => setSelectedPersonId(event.target.value)}
      >
        {" "}
        <option value={undefined}>Please select person</option>
        {data &&
          Object.values(data).map((person) => (
            <option
              key={person.badgeNum}
              value={person.badgeNum}
            >{`${person.lastName}, ${person.firstName[0]} ${person.badgeNum}`}</option>
          ))}
      </select>
      <Button text="Next" action={handleNext} />
    </motion.div>
  );
};

const StepTwo = ({
  handleNext,
  handleBack,
  variants,
  transition,
  custom,
  range,
  setRange,
}) => {
  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      custom={custom}
      className="relative w-full h-full flex flex-col text-zinc-200 p-15 gap-4 justify-center items-center"
    >
      <div className="relative justify-center items-center flex">
        Select dates you need covered:
      </div>
      <div className="">{<Calendar range={range} setRange={setRange} />}</div>
      <div className="relative w-full flex gap-4 justify-center items-center">
        <Button text={"Back"} action={handleBack} />
        <Button text={"Next"} action={handleNext} />
      </div>
    </motion.div>
  );
};

const StepThree = ({
  handleBack,
  handleNext,
  variants,
  transition,
  custom,
  range,
  setRange,
}) => {
  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      custom={custom}
      className="relative w-full h-full flex flex-col text-zinc-200 p-15 gap-4 justify-center items-center"
    >
      <div className="relative justify-center items-center flex">
        Select dates you need covered:
      </div>
      <div className="">{<Calendar range={range} setRange={setRange} />}</div>
      <div className="relative w-full flex gap-4 justify-center items-center">
        <Button text={"Back"} action={handleBack} />
        <Button text={"Next"} action={handleNext} />
      </div>
    </motion.div>
  );
};

const Confirm = ({ selectedPerson, coverRange, workRange }) => {
  return (
    <motion.div className="relative flex flex-col justify-center items-center gap-2 text-zinc-200 text-xl font-semibold p-15">
      <div className="">{`${selectedPerson.lastName} ${selectedPerson.badgeNum}`}</div>
      <div className="relative flex">
        {`${format(coverRange.from, "EEE, MMM d, yyyy")} - ${format(
          coverRange.to,
          "EEE, MMM d, yyyy"
        )}`}
      </div>
      <div className="relative flex ">
        {`${format(workRange.from, "EEE, MMM d, yyyy")} - ${format(
          workRange.to,
          "EEE, MMM d, yyyy"
        )}`}
      </div>
    </motion.div>
  );
};
