import TeamDisplay from "../components/TeamDisplay.tsx";
import Carousel from "../components/Carousel";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { useUser } from "./context/UserContext.tsx";
import type { User, UserRecord } from "./context/UserContext.tsx";

export default function Home() {
  const { data } = useUser();

  return (
    <motion.div className="flex flex-col items-start justify-between p-4 gap-2 relative w-full h-full">
      <div
        id="panel"
        className="h-full w-full flex items-center justify-center p-2 border border-zinc-800 bg-zinc-950/10 rounded-md"
      >
        {data && <TeamDisplay team={data} />}
      </div>
      <div
        id="panel"
        className="relative w-full flex items-start justify-center h-4/10
        border border-zinc-800 p-2 rounded-md backdrop-blur-sm bg-zinc-950/10"
      >
        {data && <Carousel team={data} />}
      </div>
    </motion.div>
  );
}
