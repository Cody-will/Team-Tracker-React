import TeamDisplay from "./TeamDisplay";
import Carousel from "./Carousel";
import { setUserProperties } from "firebase/analytics";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { onValue, ref } from "firebase/database";
import { motion } from "motion/react";

export default function Home() {
  const [data, setData] = useState(null);

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
    <motion.div
      initial={{ opacity: 0.5, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.2,
      }}
      className="flex flex-col items-start justify-between p-4 gap-2 relative w-full h-full"
    >
      <div
        id="panel"
        className="flex items-start justify-center w-full relative h-3/4 border overflow-hidden border-zinc-200 rounded-md backdrop-blur-sm bg-zinc-200/10"
      >
        {data && <TeamDisplay team={data} />}
      </div>
      <div
        id="panel"
        className="relative w-full flex items-start justify-center h-1/4 
        border border-zinc-200 p-2 rounded-md backdrop-blur-sm bg-zinc-200/10"
      >
        {data && <Carousel team={data} />}
      </div>
    </motion.div>
  );
}
