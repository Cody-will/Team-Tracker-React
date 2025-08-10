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

function App() {
  const pages = {
    login: <Login />,
    home: <Home />,
    teamManagement: <TeamManagement />,
  };
  const [page, setPage] = useState(null);
  const [isLoggedIn, setIsLoggedin] = useState(true);
  const [padding, setPadding] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      setPage(pages.teamManagement);
      setPadding(16);
    } else {
      setPage(pages.login);
      setPadding(0);
    }
  }, [isLoggedIn]);

  return (
    <motion.div className="h-screen w-screen overflow-hidden relative">
      <div className="bg-[url('./assets/background.svg')] bg-no-repeat bg-center bg-cover fixed inset-0 z-0"></div>
      {isLoggedIn && <Sidebar setPage={setPage} pages={pages} />}
      <main className={`w-full h-full relative z-10 pl-${padding}`}>
        {page}
      </main>
    </motion.div>
  );
}

export default App;
