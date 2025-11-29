import TeamDisplay from "../components/TeamDisplay.tsx";
import Carousel from "../components/Carousel";
import { motion } from "motion/react";
import { useUser } from "./context/UserContext.tsx";
import { useAuth } from "./context/AuthContext.jsx";
import SplashOverlay from "../components/SplashOverlay.tsx";

export default function Home() {
  const { currentUser, forceSplash } = useAuth();
  const { data, loading } = useUser();

  // ✅ "Ready" means:
  // - we have a logged-in user
  // - user context is done loading
  // - we actually have some users in `data`
  const hasTeam = data && Object.keys(data).length > 0;
  const isReady = !!currentUser && !loading && hasTeam;

  // 🔹 As long as we're not ready, or we've explicitly forced the splash,
  // show ONLY your main splash screen.
  if (!isReady || forceSplash) {
    return <SplashOverlay />;
  }

  // 🔹 Once ready, render the real dashboard.
  return (
    <motion.div className="flex flex-col items-start justify-between p-4 gap-2 relative w-full h-full">
      <div
        id="panel"
        className="h-full w-full flex items-center justify-center p-2 border border-zinc-800 bg-zinc-950/10 rounded-md"
      >
        <TeamDisplay key="team-display-comp" team={data} />
      </div>

      <div
        id="panel"
        className="relative w-full flex items-start justify-center h-4/10 border border-zinc-800 p-2 rounded-md backdrop-blur-sm bg-zinc-950/10"
      >
        <Carousel key="carousel-comp" team={data} />
      </div>
    </motion.div>
  );
}
