import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login.jsx";
import SplashOverlay from "./components/SplashOverlay.tsx";

import { Outlet, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./pages/context/AuthContext.jsx";
import { ConfigureProvider } from "./pages/context/configureContext.jsx";
import { useAuth } from "./pages/context/AuthContext.jsx";
import { UserProvider } from "./pages/context/UserContext.tsx";
import { useSafeSettings } from "./pages/hooks/useSafeSettings.ts";
import { ScheduleProvider } from "./pages/context/ScheduleContext.tsx";
import { VersionProvider } from "./pages/context/VersionContext.tsx";
import { useBreakpoint } from "./pages/hooks/useBreakpoint.ts";
import { CardProvider } from "./pages/context/CardContext.tsx";

import { motion } from "motion/react";

const Home = lazy(() => import("./pages/Home.tsx"));
const TeamManagement = lazy(() => import("./pages/TeamManagement.tsx"));
const ShiftSwap = lazy(() => import("./pages/ShiftSwap.tsx"));
const Vacation = lazy(() => import("./pages/Vacation.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const AddUser = lazy(() => import("./pages/AddUser.tsx"));
const Coverage = lazy(() => import("./pages/Coverage"));
const Configure = lazy(() => import("./pages/Configure"));
const Schedule = lazy(() => import("./pages/Schedule.tsx"));
const CardConfigure = lazy(() => import("./pages/CardConfigure.tsx"));
const Booking = lazy(() => import("./pages/Booking.tsx"));

function RouteFallback() {
  return <div className="p-6 text-zinc-200">Loading…</div>;
}

const LoginRoute = () => {
  const { currentUser, authReady, forceSplash } = useAuth();

  if (!authReady) return null;

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

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ConfigureProvider>
          <ScheduleProvider>
            <CardProvider>
              <VersionProvider>
                <SplashOverlay />

                {/* ✅ Wrap routes in Suspense so lazy pages can load */}
                <Suspense fallback={<RouteFallback />}>
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
                      <Route path="/cardsettings" element={<CardConfigure />} />
                      <Route path="/booking" element={<Booking />} />
                    </Route>

                    <Route path="*" element={<div className="p-6">Not Found</div>} />
                  </Routes>
                </Suspense>
              </VersionProvider>
            </CardProvider>
          </ScheduleProvider>
        </ConfigureProvider>
      </UserProvider>
    </AuthProvider>
  );
}

const ProtectedLayout = () => {
  const { currentUser, authReady } = useAuth();
  const { bgImage } = useSafeSettings();
  const { isTallDesktop } = useBreakpoint();

  const { current, next, showNext, startSwap, fadeMs } = useSeamlessWallpaper(
    bgImage ?? null,
    300
  );

  useEffect(() => {
    startSwap(bgImage ?? null);
  }, [bgImage]);

  if (!authReady) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <motion.div
      style={{ backgroundColor: "#27272a" }}
      className="lg:h-screen min-h-screen w-screen overflow-x-hidden lg:overflow-hidden flex relative"
    >
      {current && (
        <div
          className="fixed inset-0 z-0"
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
          className="fixed inset-0 z-0 transition-opacity"
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
        <Outlet />
      </main>
    </motion.div>
  );
};

