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

import { NavLink } from "react-router-dom";
import { motion, LayoutGroup } from "motion/react";
import { primaryAccentHex } from "../colors";

export default function Sidebar({ setPage, pages }) {
  const links = [
    { to: "/home", icon: <BsHouse size={32} />, label: "Home" },
    { to: "/team-management", icon: <BsPeople size={32} />, label: "Team" },
    { to: "/vacation", icon: <BsAirplane size={32} />, label: "Vacation" },
    { to: "/shift-swap", icon: <BsShuffle size={32} />, label: "Shift Swap" },
    { to: "/add-user", icon: <BsPersonPlus size={32} />, label: "Add User" },
    { to: "/coverage", icon: <BsCalendar2Plus size={32} />, label: "Coverage" },
    { to: "/settings", icon: <BsGear size={32} />, label: "Settings" },
    { to: "/login", icon: <BsDoorClosed size="32" />, label: "Logout" },
  ];
  return (
    <div className="w-20 z-50 flex items-end justify-center h-screen flex-col">
      <LayoutGroup>
        <div
          id="panel"
          className="w-16 py-4 gap-2 rounded-xl flex flex-col items-center justify-center border border-zinc-700 shadow-xl/40 bg-zinc-950/40"
        >
          {links.map(({ to, icon, label }) => (
            <SideBarLink key={to} to={to} icon={icon} label={label} />
          ))}
        </div>
      </LayoutGroup>
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
          "hover:scale-120",
          isActive ? "text-zinc-950" : "",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="sidebar-highlight"
              transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
              style={{ backgroundColor: primaryAccentHex }}
              className="absolute inset-0 rounded-lg -z-10"
            />
          )}
          {icon}
          <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-zinc-200 bg-zinc-950 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
