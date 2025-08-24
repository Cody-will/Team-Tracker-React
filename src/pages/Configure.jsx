import { useState, useRef } from "react";
import { motion } from "motion/react";
import { input } from "@material-tailwind/react";
import Button from "../components/Button";
import ListPanel from "../components/ListPanel";

export default function Configure() {
  const [rank, setRank] = useState("");
  const [shift, setShift] = useState("");
  const [division, setDivision] = useState("");
  const [shiftData, setShiftData] = useState([
    "Alpha",
    "Bravo",
    "Charlie",
    "Delta",
  ]);
  const inputStyle =
    "border-2 border-zinc-900  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  return (
    <div className="h-full w-full flex justify-center items-center">
      <motion.div
        layout
        id="panel"
        className="bg-zinc-950/30 rounded-lg border border-zinc-800 text-zinc-200 font-semibold flex flex-col p-4 gap-4"
      >
        <div className="flex w-full justify-start items-center text-3xl">
          Configure
        </div>
        <div className="flex gap-4">
          <ListPanel
            title="Ranks and Titles"
            inputStyle={inputStyle}
            name="rank"
            inputState={rank}
            setInputState={setRank}
            buttonText="Create Rank / Title"
            placeHolder="Create new rank / title"
            data={shiftData}
            setData={setShiftData}
          />
          <ListPanel
            title="Shifts"
            inputStyle={inputStyle}
            name="shift"
            inputState={shift}
            setInputState={setShift}
            buttonText="Create Shift"
            placeHolder="Create new shift"
            data={shiftData}
            setData={setShiftData}
          />
          <ListPanel
            title="Divisions"
            name="divisions"
            inputStyle={inputStyle}
            inputState={division}
            setInputState={setDivision}
            buttonText="Create Division"
            placeHolder="Create new division"
            data={shiftData}
            setData={setShiftData}
          />
        </div>
      </motion.div>
    </div>
  );
}
