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
