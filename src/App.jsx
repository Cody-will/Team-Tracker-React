import { useState, useEffect, useRef } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.jsx";
import { motion } from "motion/react";
import TeamManagement from "./pages/TeamManagement.tsx";
import ShiftSwap from "./pages/ShiftSwap.tsx";
import Vacation from "./pages/Vacation.tsx";
import Settings from "./pages/Settings.tsx";
import AddUser from "./pages/AddUser.tsx";
import Coverage from "./pages/Coverage";
import Configure from "./pages/Configure";
import { Outlet, Routes, Route, Navigate } from "react-router-dom";
import { db } from "./firebase.js";
import { onValue, ref } from "firebase/database";
import { AuthProvider } from "./pages/context/AuthContext.jsx";
import { ConfigureProvider } from "./pages/context/configureContext.jsx";
import { useAuth } from "./pages/context/AuthContext.jsx";
import { UserProvider } from "./pages/context/UserContext.tsx";
import { useUser } from "./pages/context/UserContext.tsx";
import { useSafeSettings } from "./pages/hooks/useSafeSettings.ts";
import Schedule from "./pages/Schedule.tsx";
import { ScheduleProvider } from "./pages/context/ScheduleContext.tsx";
import SplashOverlay from "./components/SplashOverlay.tsx";
import { VersionProvider } from "./pages/context/VersionContext.tsx";
import { useBreakpoint } from "./pages/hooks/useBreakpoint.ts";

const LoginRoute = () => {
  const { currentUser, authReady, forceSplash } = useAuth();

  if (!authReady) {
    // Still waiting on Firebase
    return null;
  }

  // Only auto-redirect if user is logged in AND
  // we are NOT in the middle of a login transition using the curtain.
  if (currentUser && !forceSplash) {
    return <Navigate to="/home" replace />;
  }

  return <Login />;
};

function useSeamlessWallpaper(initial, fadeMs = 300) {
  const [current, setCurrent] = useState(initial ?? null);
  const [next, setNext] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const timerRef = useRef(null);
  const imgRef = useRef(null);

  const startSwap = (url) => {
    if (!url || url === current) return;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (imgRef.current) {
      imgRef.current.onload = null;
      imgRef.current.onerror = null;
    }

    const img = new Image();
    imgRef.current = img;
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;

    const promote = () => {
      setNext(url);
      setShowNext(true);
      timerRef.current = window.setTimeout(() => {
        setCurrent(url);
        setShowNext(false);
        setNext(null);
      }, fadeMs);
    };

    if (typeof img.decode === "function") {
      img.decode().then(promote).catch(promote);
    } else {
      img.onload = promote;
      img.onerror = promote;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }
    };
  }, []);

  return { current, next, showNext, startSwap, fadeMs };
}

function App() {
  return (
    <AuthProvider>
      <ConfigureProvider>
        <UserProvider>
          <ScheduleProvider>
            <VersionProvider>
              <SplashOverlay />
              <Routes>
                <Route path="/login" element={<LoginRoute />} />

                <Route element={<ProtectedLayout />}>
                  <Route index element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/team-management" element={<TeamManagement />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/vacation" element={<Vacation />} />
                  <Route path="/add-user" element={<AddUser />} />
                  <Route path="/shift-swap" element={<ShiftSwap />} />
                  <Route path="/coverage" element={<Coverage />} />
                  <Route path="/configure" element={<Configure />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route
                  path="*"
                  element={<div className="p-6">Not Found</div>}
                />
              </Routes>
            </VersionProvider>
          </ScheduleProvider>
        </UserProvider>
      </ConfigureProvider>
    </AuthProvider>
  );
}

const ProtectedLayout = () => {
  const [loading, setLoading] = useState(true); // team loading
  const [data, setData] = useState();
  const { currentUser, authReady } = useAuth();
  const { bgImage } = useSafeSettings();
  const { loading: usersLoading } = useUser(); // 🔹 user/settings loading from context
  const { isTallDesktop } = useBreakpoint();

  const { current, next, showNext, startSwap, fadeMs } = useSeamlessWallpaper(
    bgImage ?? null,
    300
  );

  useEffect(() => {
    const teamData = ref(db, "team");

    const unsubscribe = onValue(
      teamData,
      (snapshot) => {
        setData(snapshot.exists() ? Object.values(snapshot.val()) : null);
        setLoading(false);
      },
      (error) => {
        console.log(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    startSwap(bgImage ?? null);
  }, [bgImage]);

  // 1️⃣ Wait until Firebase tells us if there's a user at all
  if (!authReady) {
    return null;
  }

  // 2️⃣ If there is NO user after auth is ready, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ User is logged in, but user data/settings still loading -> don't render layout yet.
  //    SplashOverlay is up during this, so the user won't see a flash of default settings.
  if (usersLoading) {
    return null;
  }

  return (
    <motion.div
      style={{
        backgroundColor: "#27272a",
      }}
      className="lg:h-screen min-h-screen w-screen overflow-scroll lg:overflow-hidden flex relative"
    >
      {current && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${current})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      )}

      {next && (
        <div
          className="absolute inset-0 z-0 transition-opacity"
          style={{
            opacity: showNext ? 1 : 0,
            transitionDuration: `${fadeMs}ms`,
            backgroundImage: `url(${next})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      )}

      <Sidebar />
      <main className="lg:w-full 2xl:w-full 2xl:h-full lg:h-full min-h-screen lg:min-h-full 2xl:min-h-0 w-full lg:overflow-hidden relative z-10">
        <Outlet context={{ data, loading }} />
      </main>
    </motion.div>
  );
};

export default App;
