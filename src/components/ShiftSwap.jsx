import { db } from "../firebase";
import { useLayoutEffect, useState, useMemo, useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { select } from "@material-tailwind/react";

export default function ShiftSwap() {
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(null);
  const [coverRange, setCoverRange] = useState(null);
  const [workRange, setWorkRange] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState("Select Person");
  const selectedPerson = useMemo(
    () => data?.find((person) => person.badgeNum === selectedPersonId) ?? null,
    [data, selectedPersonId]
  );
  getDefaultClassNames();

  useEffect(() => {
    const teamData = ref(db, "team");

    const unsubscribe = onValue(
      teamData,
      (snapshot) => {
        setData(snapshot.exists() ? Object.values(snapshot.val()) : null);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(selectedPerson);
  }, [selectedPersonId]);

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
        className=" border-2 border-zinc-500 text-lg font-semibold rounded-md px-5 py-3 focus:ring-2 focus:ring-sky-500 focus:border-none focus:shadow-[0_0_10px_2px_rgba(3,105,161,0.7)] focus:outline-none"
        value={selectedPersonId}
        onChange={(event) => setSelectedPersonId(event.target.value)}
      >
        {data &&
          Object.values(data).map((person) => (
            <option
              key={person.badgeNum}
              value={person.badgeNum}
            >{`${person.lastName}, ${person.firstName[0]} ${person.badgeNum}`}</option>
          ))}
      </select>
      <motion.button
        className="text-center text-zinc-900 text-lg font-semibold px-5 py-2 bg-sky-500 rounded-md"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          handleNext();
        }}
      >
        Next
      </motion.button>
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
      <div className="relative flex gap-4 justify-center items-center">
        <motion.button
          className="text-center text-zinc-900 text-lg font-semibold px-5 py-2 bg-sky-500 rounded-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            handleBack();
          }}
        >
          Back
        </motion.button>
        <motion.button
          className="text-center text-zinc-900 text-lg font-semibold px-5 py-2 bg-sky-500 rounded-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            handleNext();
          }}
        >
          Next
        </motion.button>
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
      <div className="relative flex gap-4 justify-center items-center">
        <motion.button
          className="text-center text-zinc-900 text-lg font-semibold px-5 py-2 bg-sky-500 rounded-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            handleBack();
          }}
        >
          Back
        </motion.button>
        <motion.button
          className="text-center text-zinc-900 text-lg font-semibold px-5 py-2 bg-sky-500 rounded-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            handleNext();
          }}
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );
};

const Confirm = ({ selectedPerson, coverRange, workRange }) => {
  return (
    <>
      <div className="">{`${selectedPerson.lastName} ${selectedPerson.badgeNum}`}</div>
      <div className="">{format(coverRange, "PP")}</div>
      <div className="">{format(workRange, "PP")}</div>
    </>
  );
};

const Calendar = ({ range, setRange }) => {
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
};
