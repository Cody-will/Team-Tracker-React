import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login.jsx";
import { motion, AnimatePresence } from "motion/react";
import TeamManagement from "./pages/TeamManagement";
import ShiftSwap from "./pages/ShiftSwap";
import Vacation from "./pages/Vacation";
import Settings from "./pages/Settings";
import AddUser from "./pages/AddUser";
import Coverage from "./pages/Coverage";
import Configure from "./pages/Configure";
import { Outlet, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { db } from "./firebase.js";
import { onValue, ref } from "firebase/database";
import { AuthProvider } from "./pages/context/AuthContext.jsx";
import CometWallpaper from "./pages/CometWallpaper";
import { useAuth } from "./pages/context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/shift-swap" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/team-management" element={<TeamManagement />} />
          <Route path="/vacation" element={<Vacation />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/shift-swap" element={<ShiftSwap />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/configure" element={<Configure />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </AuthProvider>
  );
}

const ProtectedLayout = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [nightMode, setNightMode] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const teamData = ref(db, "team");

    const unsubscribe = onValue(
      teamData,
      (snapshot) => {
        setData(snapshot.exists() ? Object.values(snapshot.val()) : null);
        setLoading(false);
        console.log(snapshot.exists());
      },
      (error) => {
        console.log(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);
  if (!currentUser) return <Navigate to="/login" replace />;
  const backgrounddd =
    "bg-[url('./assets/background.svg')] bg-no-repeat bg-center bg-cover";

  return (
    <motion.div
      className={` ${
        !nightMode && backgrounddd
      } h-screen w-screen overflow-hidden  flex relative`}
    >
      <AnimatePresence>{nightMode && <CometWallpaper />}</AnimatePresence>
      <div className=" fixed inset-0 z-0"></div>
      <Sidebar toggleState={nightMode} setToggleState={setNightMode} />
      <main className={`w-full h-full relative z-10`}>
        <Outlet context={{ data, loading }} />
      </main>
    </motion.div>
  );
};

export default App;
