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

export default function Sidebar({ setPage, pages }) {
  return (
    <div
      id="panel"
      className="fixed top-0 left-0 h-screen w-16 z-50 flex gap-4 shadow-inner/90 flex-col bg-zinc-950/50"
    >
      <div className="h-3/4 mt-2">
        <SideBarIcon
          icon={<BsHouse size="32" />}
          text="Home"
          location="home"
          setPage={setPage}
          pages={pages}
        />
        <SideBarIcon
          icon={<BsPeople size="32" />}
          text="Team"
          location="teamManagement"
          setPage={setPage}
          pages={pages}
        />
        <SideBarIcon icon={<BsAirplane size="32" />} text="Vacation" />
        <SideBarIcon
          icon={<BsShuffle size="32" />}
          text="Shift Swap"
          location="shiftSwap"
          setPage={setPage}
          pages={pages}
        />
        <SideBarIcon icon={<BsPersonPlus size="32" />} text="Add User" />
        <SideBarIcon icon={<BsCalendar2Plus size="32" />} text="Coverage" />
      </div>
      <div className="h-1/4 flex flex-col justify-end mb-4">
        <SideBarIcon icon={<BsGear size="32" />} text="Settings" />
        <SideBarIcon icon={<BsDoorClosed size="32" />} text="Logout" />
      </div>
    </div>
  );
}

const SideBarIcon = ({ icon, text, location, setPage, pages }) => (
  <button
    className="relative flex items-center justify-center h-12 w-12 mx-auto text-zinc-200 hover:scale-110 
    cursor-pointer transition-transform duration-300 hover:bg-amber-500 hover:text-zinc-950 rounded-lg group"
    onClick={() => setPage(pages[location])}
  >
    {icon}

    <span
      className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-zinc-200 bg-zinc-950 text-xs
        font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100"
    >
      {text}
    </span>
  </button>
);
