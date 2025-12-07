import TeamDisplay from "../components/TeamDisplay.tsx";
import Carousel from "../components/Carousel";
import { motion } from "motion/react";
import { useUser } from "./context/UserContext.tsx";
import { useAuth } from "./context/AuthContext.jsx";
import SplashOverlay from "../components/SplashOverlay.tsx";
import { useBreakpoint } from "./hooks/useBreakpoint.ts";
import { useSafeSettings } from "./hooks/useSafeSettings.ts";
export default function Home() {
  const { currentUser, forceSplash } = useAuth();
  const { data, loading } = useUser();
  const { lgUp } = useBreakpoint();
  const { primaryAccent, secondaryAccent } = useSafeSettings();

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
    <motion.div className="flex flex-col  items-start overflow-auto lg:overflow-visible 2xl:overflow-visible  justify-between p-2 md:p-4 2xl:p-4 gap-1 2xl:gap-2 relative min-h-screen w-full lg:min-h-0 2xl:min-h-0 lg:h-full 2xl:h-full">
      <div
        id="panel"
        style={{ borderColor: primaryAccent }}
        className="lg:h-full 2xl:h-full w-full min-h-screen rounded-lg overflow-visible lg:min-h-0 2xl:min-h-0 flex items-center justify-center p-2"
      >
        {data && <TeamDisplay key="team-display-comp" team={data} />}
      </div>

      <div
        id="panel"
        style={{ borderColor: primaryAccent }}
        className="relative w-full flex items-start rounded-lg justify-center 2xl:h-4/10 2xl:max-h-[30%] grow-0 lg:max-h-[30%] lg:h-[30%] p-2"
      >
        <Carousel key="carousel-comp" team={data} />
      </div>
    </motion.div>
  );
}
