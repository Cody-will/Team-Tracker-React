import { db } from "../firebase";
import { useLayoutEffect, useState, useMemo, useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function ShiftSwap() {
  const [person, setPerson] = useState(null);
  const [coverDate, setCoverDate] = useState(null);
  const [workDate, setWorkDate] = useState(null);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1);
  const initial = { x: 300, opacity: 0 };
  const animate = { x: 0, opacity: 1 };
  const exit = { x: -300, opacity: 0 };
  const transition = { duration: 0.5, ease: "easeInOut" };

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

  return (
    <div className="relative h-full w-full justify-center items-center flex">
      <motion.div
        transition={{ duration: 0.35, ease: "easeInOut" }}
        id="panel"
        className=" bg-zinc-900/50 shadow-xl/40 rounded-xl transition-all duration-300 ease-in-out border border-zinc-700 relative flex flex-col"
      >
        <div className="h-1/10 text-2xl font-semibold text-zinc-200 w-full flex items-center justify-start p-2">
          Shift Swap
        </div>
        <AnimatePresence>
          {step === 1 ? (
            <StepOne
              data={data}
              setStep={setStep}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={transition}
            />
          ) : step === 2 ? (
            <StepTwo
              setStep={setStep}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={transition}
            />
          ) : (
            <StepThree />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const StepOne = ({
  data,
  setStep,
  initial,
  animate,
  exit,
  key,
  transition,
}) => {
  return (
    <motion.div
      key={1}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className="relative w-full h-full flex flex-col text-zinc-200 gap-4 py-15 px-12 justify-center items-center"
    >
      <div className="relative justify-center items-center flex">
        Select person to swap with:
      </div>
      <select className=" border-2 border-zinc-500 rounded-md px-3 py-2">
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
        onClick={() => setStep(2)}
      >
        Next
      </motion.button>
    </motion.div>
  );
};

const StepTwo = ({ setStep, initial, animate, exit, transition }) => {
  return (
    <motion.div
      key={2}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className="relative w-full h-full flex flex-col text-zinc-200 p-15 gap-4 justify-center items-center"
    >
      <div className="relative justify-center items-center flex">
        Select dates you need covered:
      </div>
      <div className="">{<Calendar />}</div>
      <div className="relative flex gap-4 justify-center items-center">
        <motion.button
          className="text-center text-zinc-900 text-lg font-semibold px-5 py-2 bg-sky-500 rounded-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(1)}
        >
          Back
        </motion.button>
        <motion.button
          className="text-center text-zinc-900 text-lg font-semibold px-5 py-2 bg-sky-500 rounded-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(3)}
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );
};

const StepThree = ({ initial, animate, exit, key }) => {
  return <></>;
};

const Calendar = () => {
  const [range, setRange] = useState(null);
  return (
    <DayPicker
      mode="range"
      range={range}
      onSelect={setRange}
      navLayout="around"
      showOutsideDays={true}
      fixedWeeks={6}
      classNames={{
        caption_label: "text-2xl",
        weekdays: "grid text-lg font-semibold grid-cols-7",
        week: "grid gap-2 grid-cols-7",
        weeks: "grid gap-2",
        day: "w-24 min-h-16 p-1 rounded-md border-2 border-zinc-300 text-sm text-zinc-200 hover:bg-sky-500 hover:border-sky-500 hover:txt-zinc-900",
        selected: "bg-sky-600 text-zinc-900 hover:bg-sky-700",
        daytoday: "border border-sky-500",
        chevron:
          "fill-sky-500 hover:scale-150 transition duration-300 ease-in-out",
        outsideDaya: "border-sky-600 text-zinc-200 text-sm",
      }}
    />
  );
};
