import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login.jsx";
import { motion } from "motion/react";
import TeamManagement from "./pages/TeamManagement";
import ShiftSwap from "./pages/ShiftSwap";
import Vacation from "./pages/Vacation";
import Settings from "./pages/Settings";
import AddUser from "./pages/AddUser";
import { Outlet, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { db } from "./firebase.js";
import { onValue, ref } from "firebase/database";
import { AuthProvider } from "./pages/context/AuthContext.jsx";

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
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </AuthProvider>
  );
}

const ProtectedLayout = () => {
  const isLoggedIn = true;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();

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

  return (
    <motion.div className="h-screen w-screen overflow-hidden  flex relative">
      <div className="bg-[url('./assets/background.svg')] bg-no-repeat bg-center bg-cover fixed inset-0 z-0"></div>
      {isLoggedIn && <Sidebar />}
      <main className={`w-full h-full relative z-10`}>
        <Outlet context={{ data, loading }} />
      </main>
    </motion.div>
  );
};

export default App;
