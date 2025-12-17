import {
  BsHouse,
  BsArrowRepeat,
  BsPeople,
  BsAirplane,
  BsUpcScan,
  BsShuffle,
  BsGear,
  BsDoorClosed,
  BsPersonPlus,
  BsCalendar2Plus,
  BsList,
  BsXCircle,
  BsSliders,
  BsCalendarWeek,
} from "react-icons/bs";

import { Columns3Cog } from "lucide-react";

import ProfilePhoto from "./ProfilePhoto.tsx";
import { useUser } from "../pages/context/UserContext.tsx";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, LayoutGroup, AnimatePresence } from "motion/react";
import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";
import { useSafeSettings } from "../pages/hooks/useSafeSettings.ts";
import { useAppVersion } from "../pages/context/VersionContext.tsx";
import { useBreakpoint } from "../pages/hooks/useBreakpoint.ts";
import ToggleSwitch from "./ToggleSwitch.tsx";
import { useConfigure } from "../pages/context/configureContext.jsx";

export default function Sidebar() {
  const [barItems, setBarItems] = useState([]);
  const [showNav, setShowNav] = useState(false);
  const { user, view, setView } = useUser();
  const { primaryAccent } = useSafeSettings();
  const { updateAvailable } = useAppVersion();
  const { isShortDesktop, mdUp, xlUp, twoXlUp, lgUp } = useBreakpoint();
  const excludes = ["Add User", "Configure"];
  const { data: conf } = useConfigure();
    const oppShift =
    conf && user
      ? Object.values(conf.Divisions.items).filter(
          (item) => item.title !== user.Divisions
        )[0]
      : "";

  const iconSize = getIcon();
    function getIcon() {
    if (twoXlUp) return 32;
    if (xlUp) return 32;
    if (lgUp) return 16;
    return 28;
  }
  
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
      to: "/cardsettings",
      icon: <Columns3Cog size={iconSize} />,
      label: "Info Card Configuration",
    },
    { to: "/booking", icon: <BsUpcScan size={iconSize} />, label: "Booking"},
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
      roleCheck(label, user.Role, excludes, user.Divisions, view, user) ? (
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
  }, [view, user]);

  function logOut() {
    signOut(auth).then(() => {});
  }

  function getToggle() {
    return { isOn: oppShift, isOff: user.Divisions };
  }

  function photoSize() {
    if (twoXlUp) return 14;
    if (xlUp) return 12;
    if (lgUp) return 10;
  }

  return (
    <AnimatePresence initial={false}>
      <LayoutGroup id="mobileNave">
        {!showNav && !lgUp ? (
          <Hamburger state={showNav} setState={setShowNav} />
        ) : (
          <motion.div
            layoutId="mobileNav"
            style={{ borderColor: `${primaryAccent}E6` }}
            transition={{ type: "tween" }}
            className="lg:relative fixed right-2 lg:left-0 2xl:w-20 lg:w-14 w-20 z-50 flex items-end justify-center h-screen flex-col"
          >
           
            <LayoutGroup>
              {user && (
                <div
                  id="panel"
                  style={{
                    borderColor: `${primaryAccent}E6`,
                    borderWidth: "2px",
                  }}
                  className="relative 2xl:w-14 w-14 lg:w-10  py-4 gap-2 2xl:gap-2 rounded-xl flex flex-col items-center justify-between  shadow-xl/40"
                >
                  {/* Top: main nav items */}
                  <AnimatePresence>
              
                      {user && xlUp && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "tween", duration: 0.5 }}
                          className="absolute top-0 -translate-y-[110%] w-18 2xl:w-22 lg:w-14 flex flex-col items-center justify-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <ProfilePhoto
                              user={user}
                              size={photoSize()}
                              borderColor={primaryAccent}
                            />
                           <div className="text-zinc-200 2xl:text-md text-sm font-medium 2xl:font-medium">
                              {user.Ranks}
                            </div>
                            <div className="text-zinc-200 2xl:text-md text-sm font-medium 2xl:font-medium">
                              {user.lastName}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  <div className="flex flex-col items-center gap-2">
                    {!lgUp && (
                      <motion.div
                        layout={!showNav}
                        onClick={() => setShowNav(false)}
                        className="relative flex items-center justify-center 2xl:w-12 2xl:h-12 h-10 w-10 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300 hover:scale-110"
                      >
                        <BsXCircle size={iconSize} />
                      </motion.div>
                    )}
                    {barItems}
                    {true && (
                      <ToggleSwitch
                        state={view !== user.Divisions}
                        setState={() =>
                          setView((prev) => (prev === "ADC" ? "UPD" : "ADC"))
                        }
                        text={{ isOn: "", isOff: "" }}
                        size={lgUp && !xlUp ? "xs" : "sm"}
                      />
                    )}
                  </div>

                  {/* Bottom: update button (only when update is available) */}
                  <UpdateButton iconSize={iconSize} />
                </div>
              )}
            </LayoutGroup>
          </motion.div>
        )}
      </LayoutGroup>
    </AnimatePresence>
  );
}

function roleCheck(title, role, excludes, division, view, user) {
  if (title === "Scheduling" && user.Divisions !== view && user.lastName !== "Willard") {
    return false;
  }
  if (title === "Info Card Configuration" && user.lastName !== "Willard")
    return false;
  if (title === "Booking" && user.lastName !== "Willard") return false;
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
          "relative flex items-center justify-center size-12 2xl:size-12 lg:size-8 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300",
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
              className="absolute inset-0 rounded-lg z-0"
            />
          )}
          <motion.div className="z-10">
          {icon}
          </motion.div>
          <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-zinc-200 bg-zinc-950 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-10">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function UpdateButton({iconSize}) {
  const { updateAvailable, latestVersion, appVersion } =
    useAppVersion();
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
      className="relative flex items-center justify-center size-12 2xl:size-12 lg:size-8 mx-auto text-zinc-200 rounded-lg group transition-transform duration-300 hover:scale-110"
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

function Hamburger({ state, setState }) {
  const { primaryAccent } = useSafeSettings();
  return (
    <motion.div
      id="panel"
      layoutId="mobileNav"
      style={{ borderColor: `${primaryAccent}E6` }}
      onClick={() => setState(true)}
      className="fixed right-4 bottom-4 z-50 p-5 rounded-full text-zinc-200 border shadow-xl/40 "
    >
      <BsList size={24} />
    </motion.div>
  );
}
