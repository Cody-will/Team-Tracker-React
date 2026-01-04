import TeamDisplay from "../components/TeamDisplay.tsx";
import Carousel from "../components/Carousel";
import { motion } from "motion/react";
import { useUser } from "./context/UserContext.tsx";
import { useAuth } from "./context/AuthContext.jsx";
import SplashOverlay from "../components/SplashOverlay.tsx";
import { useSafeSettings } from "./hooks/useSafeSettings.ts";
import {useEffect, useState} from "react";
import type{ UserRecord } from "./context/UserContext.tsx";

export default function Home() {
  const { currentUser, forceSplash } = useAuth();
  const { data, loading } = useUser();
  const { primaryAccent } = useSafeSettings();
  const [team, setTeam] = useState<UserRecord>({});
  
  useEffect(() => {
    if (data) setTeam(data);
  }, [data, loading]);


  useEffect(() => {
    console.log("Home is mounting");
  }, [])

  return (
    <motion.div
      className="
        flex flex-col
        w-full
        min-h-screen
        lg:h-screen           /* lock to viewport on desktop */
        p-2 md:p-4 2xl:p-4
        gap-1 2xl:gap-2
        relative
      "
    >
      {/* TOP PANEL - flexes to fill remaining space */}
      <div
        style={{ borderColor: `${primaryAccent}E6` }}
        id="panel"
        className="
          w-full
          flex-1             
          min-h-0            
          rounded-lg
          p-2
          overflow-visible
          flex items-center justify-center
        "
      > <h2 className="text-zinc-200 text-2xl">Hello world</h2>
        {team && <TeamDisplay key="team-display-comp" team={team} />}
      </div>

      {/* BOTTOM PANEL - fixed height on lg+, auto on mobile */}
      <div
        style={{ borderColor: `${primaryAccent}E6` }}
        id="panel"
        className="
          relative w-full
          rounded-lg p-2
          flex items-start justify-center
          flex-none          
          h-auto             
          lg:h-[30vh]        
          lg:max-h-[30vh]
        "
      >
        {/* Carousel can still manage its own overflow */}
        <Carousel key="carousel-comp" team={team} />
      </div>
    </motion.div>
  );
}

