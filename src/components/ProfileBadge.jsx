export function ProfileBadge({ title, color, position }) {
  const base =
    "absolute px-2 text-sm font-semibold rounded-sm text-zinc-900 z-10";
  const pos =
    position === "bottom-right"
      ? "bottom-0 right-0 translate-x-1/2 translate-y-1/4"
      : "bottom-0 left-0 translate-x-3/4 translate-y-1/4";

  return <div className={`${base} ${pos} ${color}`}>{title}</div>;
}
