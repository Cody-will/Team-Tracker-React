import { useState, useEffect } from "react";

export default function InfoCard({ title = "", props = "", column = false }) {
  const [col, setCol] = useState(false);
  useEffect(() => {
    setCol(column);
  }, []);

  return (
    <div className="relative p-2 rounded-md flex flex-col justify-center items-center h-full w-full overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-800 shadow-lg/30">
      <div className="flex w-full items-center justify-start text-lg font-bold text-zinc-200">
        {title}
      </div>
      <div
        className={`relative flex${
          col ? "-col" : ""
        } gap-2 items-center justify-center p-2 w-full h-full`}
      >
        {props}
      </div>
    </div>
  );
}
