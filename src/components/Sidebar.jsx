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
import { useBreakpoint } from "../pages/hooks/useBreakoint.ts";

export default function Sidebar() {
  const [barItems, setBarItems] = useState([]);
  const { user } = useUser();
  const { primaryAccent } = useSafeSettings();
  const { updateAvailable } = useAppVersion();
  const { isShortDesktop } = useBreakpoint();
  const excludes = ["Add User", "Configure"];

  const iconSize = !isShortDesktop ? 32 : 24;

  const links = [
    { to: "/home", icon: <BsHouse size={iconSize} />, label: "Home" },
    {
      to: "/team-management",
      icon: <BsPeople size={iconSize} />,
      label: "Team",
    },
    {
      to: "/schedule",
      icon: <BsCalendarWeek size={iconSize} />,
      label: "Schedule",
    },
    {
      to: "/vacation",
      icon: <BsAirplane size={iconSize} />,
      label: "Scheduling",
    },
    {
      to: "/shift-swap",
      icon: <BsShuffle size={iconSize} />,
      label: "Shift Swap",
    },
    {
      to: "/add-user",
      icon: <BsPersonPlus size={iconSize} />,
      label: "Add User",
    },
    {
      to: "/coverage",
      icon: <BsCalendar2Plus size={iconSize} />,
      label: "Coverage",
    },
    { to: "/settings", icon: <BsSliders size={iconSize} />, label: "Settings" },
    { to: "/configure", icon: <BsGear size={iconSize} />, label: "Configure" },
    {
      to: "/login",
      action: logOut,
      icon: <BsDoorClosed size={iconSize} />,
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

  const photoSize = !isShortDesktop ? 16 : 12;

  return (
    <div className="relative 2xl:w-20 w-18 z-50 flex items-end justify-center h-screen flex-col">
      <AnimatePresence>
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.5 }}
            className="absolute top-4 left-1.5 w-18 2xl:w-20 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center">
              <ProfilePhoto
                user={user}
                size={photoSize}
                borderColor={primaryAccent}
              />
              <div className="text-zinc-200 2xl:text-sm text-sm font-medium 2xl:font-medium">
                {user.Ranks}
              </div>
              <div className="text-zinc-200 2xl:text-sm text-sm font-medium 2xl:font-medium">
                {user.lastName}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup>
        {user && (
          <div
            id="panel"
            className="2xl:w-16 w-14 py-4 gap-2 2xl:gap-2 rounded-xl flex flex-col items-center justify-between border border-zinc-800 shadow-xl/40 bg-zinc-950/30"
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
          "relative flex items-center justify-center 2xl:w-12 2xl:h-12 h-10 w-10 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300",
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
  const { isShortDesktop } = useBreakpoint();
  const iconSize = !isShortDesktop ? 32 : 20;

  if (!updateAvailable) return null;

  async function handleClick() {
    try {
      // 1) Clear Cache Storage (if any)
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2) Reload page (Firebase Auth session will remain)
      window.location.reload();
    } catch (err) {
      console.error("Error while updating app:", err);
      window.location.reload(); // fallback
    }
  }

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center hover:cursor-pointer justify-center 2xl:h-12 h-10 w-10 2xl:w-12 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300 hover:scale-110"
      title={
        latestVersion
          ? `Update available: v${latestVersion} (you are on v${appVersion}). Click to update.`
          : "Update available. Click to reload."
      }
    >
      <BsArrowRepeat size={iconSize} />

      {/* Red dot badge */}
      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-zinc-950" />

      {/* Tooltip label */}
      <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-zinc-200 bg-zinc-950 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100">
        Update Available
      </span>
    </button>
  );
}
