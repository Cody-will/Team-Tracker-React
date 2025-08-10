export default function InfoCard({ title = "", props = "" }) {
  return (
    <div className="relative p-1 rounded-md flex flex-col justify-center items-center h-full w-full overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-800 shadow-lg/30">
      <div className="absolute top-0 left-0 pl-2 pt-2 flex items-center justify-start text-lg font-bold text-zinc-200">
        {title}
      </div>
      <div className="relative flex gap-4 items-center justify-center">
        {props}
      </div>
    </div>
  );
}
