import { motion } from "framer-motion";
import { primaryAccent, secondaryAccent } from "../colors.js";

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
    <motion.div
      className="relative h-24 w-24"
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.05, zIndex: 30 },
      }}
    >
      {/* Default Small Card */}
      <motion.div
        variants={{
          rest: { opacity: 1 },
          hover: { opacity: 0 },
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 h-24 w-24 flex flex-col gap-2 justify-center items-center bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-md shadow-lg/30"
      >
        <div
          className={`h-14 w-14 relative border-2 border-${primaryAccent} text-zinc-200 rounded-full flex items-center justify-center text-4xl`}
        >
          {icon}
          {fto && <Badge label="FTO" position="bottom-right" />}
          {oic && <Badge label="OIC" position="bottom-left" />}
          {title === "Sergeant" && <Badge label="Sgt" position="bottom-left" />}
        </div>
        <div className="text-xs font-semibold text-zinc-200">{`${lastname}, ${firstname[0]}`}</div>
      </motion.div>

      {/* Hover Expanded Card */}
      <motion.div
        variants={{
          rest: {
            opacity: 0,
            scale: 1,
            translateX: 0,
          },
          hover: {
            opacity: 1,
            scale: 1.1,
          },
        }}
        transition={{ duration: 0.3 }}
        className="absolute h-24 w-44 px-2 inset-0 flex flex-col gap-2 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-md shadow-lg/50 justify-center items-center"
      >
        {/* Row 1 */}
        <div className="flex flex-row gap-2 items-center justify-center">
          <div
            className={`h-14 w-14 relative border-2 border-${primaryAccent} rounded-full flex items-center justify-center text-4xl text-zinc-200`}
          >
            {icon}
            {fto && <Badge label="FTO" position="bottom-right" />}
            {oic && <Badge label="OIC" position="bottom-left" />}
          </div>
          <div className="flex flex-col items-center text-sm font-semibold text-zinc-300 text-center">
            <div>{title}</div>
            <div className="text-xs">{`${lastname}, ${firstname[0]}`}</div>
            <div
              className={`bg-${secondaryAccent} text-zinc-900 text-xs px-1 mt-1 rounded-xs shadow-md`}
            >
              {badge}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="text-xs font-semibold text-zinc-200">000-000-0000</div>
      </motion.div>
    </motion.div>
  );
}

function Badge({ label, position }) {
  const base =
    "absolute px-1 text-xs font-semibold rounded-xs text-zinc-900 z-10";
  const pos =
    position === "bottom-right"
      ? "bottom-0 right-0 translate-x-1/4 translate-y-1/4"
      : "bottom-0 left-0 -translate-x-1/4 translate-y-1/4";

  return (
    <div
      className={`${base} ${pos} ${
        label === "FTO" ? `bg-${secondaryAccent}` : `bg-${primaryAccent}`
      }`}
    >
      {label}
    </div>
  );
}
