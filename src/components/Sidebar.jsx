import {
  BsHouse,
  BsPersonCircle,
  BsPeople,
  BsAirplane,
  BsShuffle,
  BsGear,
  BsDoorClosed,
  BsPersonPlus,
  BsCalendar2Plus,
} from "react-icons/bs";

import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { primaryAccent, secondaryAccent } from "../colors.js";

export default function Sidebar({ setPage, pages }) {
  const links = [
    { to: "/home", icon: <BsHouse size={32} />, label: "Home" },
    { to: "/team-management", icon: <BsPeople size={32} />, label: "Team" },
    { to: "/vacation", icon: <BsAirplane size={32} />, label: "Vacation" },
    { to: "/shift-swap", icon: <BsShuffle size={32} />, label: "Shift Swap" },
    { to: "/add-user", icon: <BsPersonPlus size={32} />, label: "Add User" },
    { to: "/coverage", icon: <BsCalendar2Plus size={32} />, label: "Coverage" },
  ];
  const [selectedTab, setSelectedTab] = useState();

  return (
    <div
      id="panel"
      className="fixed top-0 left-0 h-screen w-16 z-50 flex gap-4 shadow-lg/40 flex-col bg-zinc-950/50"
    >
      <div className="h-3/4 mt-2">
        {links.map(({ to, icon, label }) => (
          <SideBarLink key={to} to={to} icon={icon} label={label} />
        ))}
      </div>
      <SideBarLink
        to={"/settings"}
        icon={<BsGear size={32} />}
        label="Settings"
      />
      <SideBarLink
        to="/login"
        icon={<BsDoorClosed size={32} />}
        label="Logout"
      />
    </div>
  );
}

function SideBarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        [
          "relative flex items-center justify-center h-12 w-12 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300",
          "hover:scale-110 hover:bg-orange-500 hover:text-zinc-950",
          isActive ? `bg-${secondaryAccent} text-zinc-950` : "",
        ].join(" ")
      }
    >
      {icon}
      <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-zinc-200 bg-zinc-950 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100">
        {label}
      </span>
    </NavLink>
  );
}
