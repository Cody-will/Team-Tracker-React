export default function Card({
  firstname,
  lastname,
  title,
  badge,
  oic,
  fto,
  icon,
}) {
  return (
    <div className="relative flex flex-col h-full w-full max-w-24 max-h-24 bg-gradient-to-br from-zinc-900 to-zinc-800">
      <div className="flex relative items-center justify-center">
        <div class="relative flex justify-center items-center border-2 border-sky-">
          {icon}
        </div>
      </div>
      <div className="flex relative h-full w-full"></div>
    </div>
  );
}
