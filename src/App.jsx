import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Sidebar from "./components/Sidebar";
import TeamDisplay from "./components/TeamDisplay";
import InfoCard from "./components/InfoCard";
import Carousel from "./components/Carousel";
import Home from "./components/Home";
import Login from "./components/Login";
import { motion } from "motion/react";
import TeamManagement from "./components/TeamManagement";
import ShiftSwap from "./components/ShiftSwap";
import Vacation from "./components/Vacation";
import Settings from "./components/Settings";
import { Outlet, Routes, Route, Navigate, useLocation } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/shift-swap" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/team-management" element={<TeamManagement />} />
        <Route path="/vacation" element={<Vacation />} />
        <Route path="/shift-swap" element={<ShiftSwap />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<div className="p-6">Not Found</div>} />
    </Routes>
  );
}

const ProtectedLayout = () => {
  const isLoggedIn = true;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
    <motion.div className="h-screen w-screen overflow-hidden relative">
      <div className="bg-[url('./assets/background.svg')] bg-no-repeat bg-center bg-cover fixed inset-0 z-0"></div>
      {isLoggedIn && <Sidebar />}
      <main className={`w-full h-full relative z-10 pl-16`}>
        <Outlet />
      </main>
    </motion.div>
  );
};

export default App;
