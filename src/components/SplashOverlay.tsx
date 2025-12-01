import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../pages/context/AuthContext.jsx";
import { useUser } from "../pages/context/UserContext.tsx";
import { useSafeSettings } from "../pages/hooks/useSafeSettings.ts";

const MIN_VISIBLE_MS = 3000; // how long to keep splash after data is ready
const CURTAIN_DURATION = 0.6; // seconds, must match your login navigate delay (600ms)

export default function SplashOverlay() {
  const { currentUser, forceSplash, setForceSplash } = useAuth();
  const { loading: usersLoading, user, userSettings } = useUser();
  const { primaryAccent } = useSafeSettings();

  // Data is "ready" when:
  // - there's an auth user
  // - user data is done loading
  // - we have a user record and settings
  const isDataReady =
    !!currentUser && !usersLoading && !!user && !!userSettings;

  // Minimum visible time after data is ready (for bg to fully load)
  const [canHide, setCanHide] = useState(false);

  useEffect(() => {
    if (!isDataReady) {
      setCanHide(false);
      return;
    }

    const timer = setTimeout(() => {
      setCanHide(true);
    }, MIN_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [isDataReady]);

  // If this was a login transition and we're fully ready,
  // let the overlay actually disappear by clearing forceSplash.
  useEffect(() => {
    if (forceSplash && isDataReady && canHide) {
      setForceSplash(false);
    }
  }, [forceSplash, isDataReady, canHide, setForceSplash]);

  // Only show overlay if:
  // - we're in a login curtain flow (forceSplash), OR
  // - we have a user and app is still bootstrapping data/settings
  const showOverlay =
    forceSplash || (!!currentUser && (!isDataReady || !canHide));

  // 🔹 DIFFERENCE:
  // If this is a login transition, we want the curtains to CLOSE on mount
  // (from sides -> center). If it's just a refresh / existing session loading,
  // we want the curtains to START CLOSED (no closing animation) and only OPEN on exit.
  const isLoginTransition = forceSplash;

  const leftInitialX = isLoginTransition ? "-100%" : 0;
  const rightInitialX = isLoginTransition ? "100%" : 0;

  return (
    <AnimatePresence mode="wait">
      {showOverlay && (
        <motion.div
          key="app-splash"
          className="fixed inset-0 z-9999 overflow-hidden pointer-events-auto"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }} // curtains handle the visual; keep root solid
        >
          {/* LEFT curtain */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-zinc-950"
            initial={{ x: leftInitialX }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }} // open to the left
            transition={{ duration: CURTAIN_DURATION, ease: "easeInOut" }}
          />

          {/* RIGHT curtain */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-zinc-950"
            initial={{ x: rightInitialX }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }} // open to the right
            transition={{ duration: CURTAIN_DURATION, ease: "easeInOut" }}
          />

          {/* CENTER CONTENT (welcome + spinner) */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: isLoginTransition ? 0 : 1, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center space-y-4 px-6">
              <div className="text-3xl font-semibold text-zinc-100">
                {user?.firstName
                  ? `Welcome back, ${user.Ranks} ${user.lastName}`
                  : "Loading your workspace..."}
              </div>

              <div className="text-zinc-400">
                Loading your settings and team…
              </div>

              <div className="mt-6 flex justify-center">
                <div
                  className="h-10 w-10 rounded-full border-2 border-zinc-700 animate-spin"
                  style={{ borderTopColor: primaryAccent }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
