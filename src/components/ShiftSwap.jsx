import { db } from "../firebase";

export default function ShiftSwap() {
  return (
    <div className="relative h-full w-full justify-center items-center flex">
      <div
        id="panel"
        className="h-3/4 w-3/4 bg-zinc-900/50 shadow-xl/40 rounded-md border border-zinc-700 relative flex"
      >
        <div className="h-1/10 text-2xl font-semibold text-zinc-200 w-full flex items-center justify-start p-2">
          Shift Swap
        </div>
      </div>
    </div>
  );
}
