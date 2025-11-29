import {
  BsHouse,
  BsArrowRepeat,
  BsPeople,
  BsAirplane,
  BsShuffle,
  BsGear,
  BsDoorClosed,
  BsPersonPlus,
  BsCalendar2Plus,
  BsSliders,
  BsCalendarWeek,
} from "react-icons/bs";

import ProfilePhoto from "./ProfilePhoto.tsx";
import { useUser } from "../pages/context/UserContext.tsx";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, LayoutGroup, AnimatePresence } from "motion/react";
import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";
import { useSafeSettings } from "../pages/hooks/useSafeSettings.ts";
import { useAppVersion } from "../pages/context/VersionContext.tsx";

export default function Sidebar() {
  const [barItems, setBarItems] = useState([]);
  const { user } = useUser();
  const { primaryAccent } = useSafeSettings();
  const { updateAvailable } = useAppVersion();

  const excludes = ["Add User", "Configure"];

  const links = [
    { to: "/home", icon: <BsHouse size={32} />, label: "Home" },
    { to: "/team-management", icon: <BsPeople size={32} />, label: "Team" },
    { to: "/schedule", icon: <BsCalendarWeek size={32} />, label: "Schedule" },
    { to: "/vacation", icon: <BsAirplane size={32} />, label: "Scheduling" },
    { to: "/shift-swap", icon: <BsShuffle size={32} />, label: "Shift Swap" },
    { to: "/add-user", icon: <BsPersonPlus size={32} />, label: "Add User" },
    { to: "/coverage", icon: <BsCalendar2Plus size={32} />, label: "Coverage" },
    { to: "/settings", icon: <BsSliders size={32} />, label: "Settings" },
    { to: "/configure", icon: <BsGear size={32} />, label: "Configure" },
    {
      to: "/login",
      action: logOut,
      icon: <BsDoorClosed size={32} />,
      label: "Logout",
    },
  ];

  useEffect(() => {
    if (!user) return;

    const bar = links.map(({ to, action, icon, label }) =>
      roleCheck(label, user.Role, excludes) ? (
        <SideBarLink
          key={to}
          to={to}
          action={action}
          icon={icon}
          label={label}
        />
      ) : null
    );

    setBarItems(bar.filter(Boolean));
  }, [user]);

  function logOut() {
    signOut(auth).then(() => {});
  }

  return (
    <div className="relative w-20 z-50 flex items-end justify-center h-screen flex-col">
      <AnimatePresence>
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.5 }}
            className="absolute top-4 left-1.5 w-20 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center">
              <ProfilePhoto user={user} size={16} borderColor={primaryAccent} />
              <div className="text-zinc-200 font-medium">{user.Ranks}</div>
              <div className="text-zinc-200 font-medium">{user.lastName}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup>
        {user && (
          <div
            id="panel"
            className="w-16 py-4 gap-2 rounded-xl flex flex-col items-center justify-between border border-zinc-800 shadow-xl/40 bg-zinc-950/30"
          >
            {/* Top: main nav items */}
            <div className="flex flex-col items-center gap-2">{barItems}</div>

            {/* Bottom: update button (only when update is available) */}
            <UpdateButton />
          </div>
        )}
      </LayoutGroup>
    </div>
  );
}

function roleCheck(title, role, excludes) {
  if (role === "Admin") return true;
  return !excludes.includes(title);
}

function SideBarLink({ to, action, icon, label }) {
  const { primaryAccent } = useSafeSettings();

  return (
    <NavLink
      to={to}
      onClick={action ? () => action() : undefined}
      className={({ isActive }) =>
        [
          "relative flex items-center justify-center h-12 w-12 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300",
          "hover:scale-110",
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
              style={{ backgroundColor: primaryAccent }}
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

/**
 * Update button at the very bottom of the sidebar.
 * - Only shows when updateAvailable === true
 * - Uses BsArrowRepeat icon
 * - Red dot in top-right when update is available
 * - Click => hard reload (fetch latest build)
 */
function UpdateButton() {
  const { updateAvailable, latestVersion, appVersion } = useAppVersion();

  if (!updateAvailable) return null;

  function handleClick() {
    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center hover:cursor-pointer justify-center h-12 w-12 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300 hover:scale-110"
      title={
        latestVersion
          ? `Update available: v${latestVersion} (you are on v${appVersion}). Click to update.`
          : "Update available. Click to reload."
      }
    >
      <BsArrowRepeat size={32} />

      {/* Red dot badge */}
      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-zinc-950" />

      {/* Tooltip label */}
      <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-zinc-200 bg-zinc-950 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100">
        Update Available
      </span>
    </button>
  );
}
