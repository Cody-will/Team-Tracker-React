import { BsPersonCircle } from "react-icons/bs";
import Card from "./Card";
import UpperCard from "./UpperCard";
import Shifts from "./Shifts";
import { useEffect, useState } from "react";
import { app, db } from "../firebase";
import { onValue, ref } from "firebase/database";
import { findUpperSupervisors, findSupervisors } from "../teamSorting";
import { createUpper, createCards } from "../createCards";
import { motion } from "motion/react";

export default function TeamDisplay({ team }) {
  const [data, setData] = useState(team ? Object.values(team) : null);
  const [upper, setUpper] = useState(null);
  const [allShifts, setAllShifts] = useState(null);

  useEffect(() => {
    team ? setData(Object.values(team)) : null;
  }, [team]);

  // Whenever 'data' changes, update 'upper' and 'allShifts'
  useEffect(() => {
    if (data) {
      setUpper(createUpper(findUpperSupervisors(data)));

      const shifts = ["alpha", "bravo", "charlie", "delta"];
      const shiftPanels = shifts.map((shift) => (
        <Shifts key={shift} shift={shift} team={data} />
      ));
      setAllShifts(shiftPanels);
    } else {
      setUpper(null);
      setAllShifts(null);
    }
  }, [data]);

  return (
    <motion.div className="flex flex-col w-full">
      <div className="w-full flex justify-center pt-1">
        <ButtonBar />
      </div>

      <div id="mainContainer" className="w-full p-2">
        <div id="topContainer" className="flex w-full h-28">
          <div
            id="majContainer"
            className="flex pb-2 w-full justify-stretch gap-2 items-center"
          >
            {upper}
          </div>
        </div>
        <div
          id="middleContainer"
          className="relative flex gap-2 rounded-md w-full h-full"
        >
          {allShifts}
        </div>
      </div>
    </motion.div>
  );
}

// Button group for switching between shifts
const ButtonBar = () => {
  return (
    <div className="flex bg-zinc-900 justify-evenly items-center text-zinc-300 text-center text-md divide-x-1 divide-zinc-300 font-semibold rounded-md shadow-lg/50">
      <button className="py-1.5 px-2.5 hover:bg-amber-500 hover:rounded-l-md">
        All
      </button>
      <button className="py-1.5 px-2.5 hover:bg-amber-500 hover:text-zinc-950">
        Alpha
      </button>
      <button className="py-1.5 px-2.5 hover:bg-amber-500 hover:text-zinc-950">
        Bravo
      </button>
      <button className="py-1.5 px-2.5 hover:bg-amber-500 hover:text-zinc-950">
        Charlie
      </button>
      <button className="py-1.5 px-2.5 hover:bg-amber-500 hover:rounded-r-md">
        Delta
      </button>
    </div>
  );
};
