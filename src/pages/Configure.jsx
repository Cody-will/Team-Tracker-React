import { useState, useEffect, useRef, useReducer } from "react";
import { motion } from "motion/react";
import { input } from "@material-tailwind/react";
import Button from "../components/Button";
import ListPanel from "../components/ListPanel";
import { useConfigure } from "./context/configureContext.jsx";
import { BsPlusLg } from "react-icons/bs";
import { createUserWithEmailAndPassword } from "firebase/auth";

function reducer(state, action) {}

export default function Configure() {
  const { data } = useConfigure();
  const { updateConfig } = useConfigure();
  const args = Object.values(data);

  const update = useEffect(() => {
    data && console.log(data);
  }, [data]);

  const inputStyle =
    "border-2 border-zinc-900  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  return (
    <div className="h-full w-full flex justify-center items-center">
      <motion.div
        layout
        id="panel"
        className="bg-zinc-950/30 rounded-lg border border-zinc-800 text-zinc-200 font-semibold flex flex-col p-4 gap-4"
      >
        <div className="flex gap-4 justify-center items-center w-full">
          <div className="flex w-full justify-start items-center text-3xl">
            Configure
          </div>
          <div className="w-full"></div>
          <div className="w-full">
            <Button text={<BsPlusLg size={24} />} />
          </div>
        </div>
        <div className="flex gap-4">
          {data &&
            Object.values(args).forEach((item) =>
              Object.values(item).map((i) => <ListPanel title={i} />)
            )}
        </div>
      </motion.div>
    </div>
  );
}
