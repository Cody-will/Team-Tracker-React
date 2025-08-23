import Calendar from "../components/Calendar";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";
import Button from "../components/Button";
import { primaryAccent, secondaryAccent } from "../colors";
import { useOutletContext } from "react-router-dom";

/**
 * A minimal Person shape used in this view.
 * @typedef {Object} Person
 * @property {string|number} badgeNum
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * Direction value for slide animations: +1 next, -1 back.
 * @typedef {number} Direction
 */

/**
 * Variants object for direction-aware slide transitions.
 * `enter` and `exit` receive the custom `Direction` value.
 * @typedef {Object} SlideVariants
 * @property {(dir: Direction) => Object} enter
 * @property {Object} center
 * @property {(dir: Direction) => Object} exit
 */

/**
 * Vacation request page: select a person, choose a date range, submit.
 * Holds shared state and renders step content with animations.
 * @returns {JSX.Element}
 */
export default function Vacation() {
  const [range, setRange] = useState(undefined);
  const [selectedPersonId, setSelectedPersonId] = useState(undefined);
  const [direction, setDirection] = useState(null);
  const { data, loading } = useOutletContext();

  /** @type {{ duration: number; ease: string }} */
  const transition = { duration: 0.5, ease: "easeInOut" };

  /** @type {SlideVariants} */
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

  /** @returns {void} */
  const handleNext = () => {};

  /** @returns {void} */
  const handleBack = () => {};

  return (
    <motion.div className="h-full w-full text-zinc-200 flex justify-center items-center">
      <motion.div
        id="panel"
        className="relative flex flex-col gap-4 p-4 bg-zinc-950/30 overflow-hidden shadow-xl/40 rounded-xl border border-zinc-800"
      >
        <span className="relative text-3xl font-semibold flex w-full items-start justify-start">
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

/**
 * Step for choosing a date range.
 * @param {{ range: import('react-day-picker').DateRange | undefined, setRange: (r: import('react-day-picker').DateRange | undefined) => void }} props
 * @returns {JSX.Element}
 */
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

/**
 * Step for selecting the person who is requesting vacation.
 * @param {{
 *   selectedPersonId: string | undefined,
 *   setSelectedPersonId: (id: string | undefined) => void,
 *   handleNext: () => void,
 *   handleBack: () => void,
 *   data: Person[] | null,
 *   variants: SlideVariants,
 *   transition: { duration: number; ease: string },
 *   custom: Direction | null
 * }} props
 * @returns {JSX.Element}
 */
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
