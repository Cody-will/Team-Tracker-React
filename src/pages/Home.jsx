import TeamDisplay from "../components/TeamDisplay";
import Carousel from "../components/Carousel";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useOutletContext } from "react-router-dom";

export default function Home() {
  const { data, loading } = useOutletContext();

  return (
    <motion.div className="flex flex-col items-start justify-between p-4 gap-2 relative w-full h-full">
      <div
        id="panel"
        className="flex items-start justify-center w-full relative h-3/4 border overflow-hidden border-zinc-800 rounded-md backdrop-blur-sm bg-zinc-950/10"
      >
        {data && <TeamDisplay team={data} />}
      </div>
      <div
        id="panel"
        className="relative w-full flex items-start justify-center h-1/4 
        border border-zinc-800 p-2 rounded-md backdrop-blur-sm bg-zinc-950/10"
      >
        {data && <Carousel team={data} />}
      </div>
    </motion.div>
  );
}
