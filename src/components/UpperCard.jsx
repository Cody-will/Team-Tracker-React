import { primaryAccent, secondaryAccent } from "../colors.js";

// The larger card, used for displaying upper rank supervisors that are always on call or on all shifts (Maj, LT, Ect..)

export default function UpperCard({ firstname, lastname, badge, title, icon }) {
  return (
    <div className="bg-gradient-to-br flex-shrink from-zinc-900 to-zinc-800 rounded-md shadow-lg/50 flex justify-between items-center px-4 py-2 w-full h-full hover:scale-110 duration-300 ease-in-out hover:z-30">
      <div className="flex items-center justify-center">
        <div
          className={`h-20 w-20 rounded-full border-2 border-${primaryAccent} flex items-center justify-center text-zinc-200`}
        >
          {icon}
        </div>
      </div>
      <div className="flex relative flex-col h-full items-center justify-center text-zinc-300 font-bold text-center text-shadow-sm my-2">
        <div className="">{title}</div>
        <div className="">{`${lastname}, ${firstname[0]}`}</div>
        <div
          className={`flex-grow-0 mt-1 text-sm bg-${secondaryAccent} text-zinc-900 rounded-xs px-2 py-0.5 shadow-md/30`}
        >
          {badge}
        </div>
      </div>
      <div className="flex justify-center items-end h-full">
        <div className="relative text-xs text-zinc-300 font-semibold whitespace-nowrap">
          000-000-0000
        </div>
      </div>
    </div>
  );
}
