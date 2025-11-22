import { useState, useEffect, useRef } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.jsx";
import { motion, AnimatePresence } from "motion/react";
import TeamManagement from "./pages/TeamManagement.tsx";
import ShiftSwap from "./pages/ShiftSwap.tsx";
import Vacation from "./pages/Vacation.tsx";
import Settings from "./pages/Settings.tsx";
import AddUser from "./pages/AddUser.tsx";
import Coverage from "./pages/Coverage";
import Configure from "./pages/Configure";
import PoliceRadarWallpaper from "./pages/PoliceRadarWallpaper";
import { Outlet, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { db } from "./firebase.js";
import { onValue, ref } from "firebase/database";
import { AuthProvider } from "./pages/context/AuthContext.jsx";
import { ConfigureProvider } from "./pages/context/configureContext.jsx";
import CometWallpaper from "./pages/CometWallpaper";
import { useAuth } from "./pages/context/AuthContext.jsx";
import { UserProvider } from "./pages/context/UserContext.tsx";
import { useUser } from "./pages/context/UserContext.tsx";
import Schedule from "./pages/Schedule.tsx";
import {
  ScheduleProvider,
  useSchedule,
} from "./pages/context/ScheduleContext.tsx";

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
            <Routes>
              <Route path="/login" element={<Login />} />

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

              <Route path="*" element={<div className="p-6">Not Found</div>} />
            </Routes>
          </ScheduleProvider>
        </UserProvider>
      </ConfigureProvider>
    </AuthProvider>
  );
}

const ProtectedLayout = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [nightMode, setNightMode] = useState(false);
  const { currentUser } = useAuth();
  const { userSettings } = useUser();

  const { current, next, showNext, startSwap, fadeMs } = useSeamlessWallpaper(
    userSettings?.bgImage ?? null,
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
    startSwap(userSettings?.bgImage ?? null);
  }, [userSettings?.bgImage]);

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <motion.div
      style={{
        backgroundColor: "#09090b",
      }}
      className={`h-screen w-screen overflow-hidden flex relative`}
    >
      {!nightMode && current && (
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
      {!nightMode && next && (
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
      <AnimatePresence>{nightMode && <CometWallpaper />}</AnimatePresence>
      <Sidebar toggleState={nightMode} setToggleState={setNightMode} />
      <main className={`w-full h-full relative z-10`}>
        <Outlet context={{ data, loading }} />
      </main>
    </motion.div>
  );
};

export default App;
