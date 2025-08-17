import { db } from "../firebase.js";
import { ref, onValue } from "firebase/database";
import Calendar from "./Calendar";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Button from "./Button";
import { primaryAccent, secondaryAccent } from "../colors.js";

export default function Vacation() {
  const [range, setRange] = useState(undefined);
  const [selectedPersonId, setSelectedPersonId] = useState(undefined);
  const [direction, setDirection] = useState(null);
  const [data, setData] = useState([]);

  const transition = { duration: 0.5, ease: "easeInOut" };
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

  const handleNext = () => {};

  const handleBack = () => {};

  return (
    <motion.div className="h-full w-full text-zinc-200 flex justify-center items-center">
      <motion.div
        id="panel"
        className="relative flex flex-col gap-4 p-4 bg-zinc-900/50 overflow-hidden shadow-xl/40 rounded-xl border border-zinc-700"
      >
        <span className="relative text-2xl font-semibold flex w-full items-start justify-start">
          Vacation
        </span>
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {
            <SelectPerson
              data={data}
              selectedPersonId={selectedPersonId}
              setSelectedPersonId={setSelectedPersonId}
              handleNext={handleNext}
              handleBack={handleBack}
              variants={variants}
              transition={transition}
              custom={direction}
            />
          }
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

const ChooseDates = ({ range, setRange }) => {
  return (
    <motion.div className="relative flex p-10 flex-col gap-4">
      <Calendar range={range} setRange={setRange} />
      <div className="relative flex gap-4">
        <Button text="Next" />
      </div>
    </motion.div>
  );
};

const SelectPerson = ({
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
        className={`border-2 border-zinc-500 text-lg font-semibold rounded-md px-5 py-3 focus:ring-2 focus:ring-${primaryAccent} focus:border-${primaryAccent} focus:shadow-[0_0_10px_2px_rgba(3,105,161,0.7)] focus:outline-none`}
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
