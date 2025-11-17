import { motion } from "framer-motion";
import { primaryAccentHex, secondaryAccentHex } from "../colors";
import { BsPersonCircle } from "react-icons/bs";
import { useState } from "react";
import { useUser } from "../pages/context/UserContext";

/** @param {firstName: String, lastName: String, title: String, badge: String, oic: Boolean, fto: Boolean, icon: Object} props */

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
          style={{ borderColor: primaryAccentHex }}
          className={`h-14 w-14 relative border-2 text-zinc-200 rounded-full flex items-center justify-center text-4xl`}
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
            style={{ borderColor: primaryAccentHex }}
            className={`h-14 w-14 relative border-2 rounded-full flex items-center justify-center text-4xl text-zinc-200`}
          >
            {icon}
            {fto && <Badge label="FTO" position="bottom-right" />}
            {oic && <Badge label="OIC" position="bottom-left" />}
          </div>
          <div className="flex flex-col items-center text-sm font-semibold text-zinc-300 text-center">
            <div>{title}</div>
            <div className="text-xs">{`${lastname}, ${firstname[0]}`}</div>
            <div
              style={{ backgroundColor: secondaryAccentHex }}
              className={`text-zinc-900 text-xs px-1 mt-1 rounded-xs shadow-md`}
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
      style={{
        backgroundColor:
          label === "FTO" ? secondaryAccentHex : primaryAccentHex,
      }}
      className={`${base} ${pos}`}
    >
      {label}
    </div>
  );
}

export function NewCard({ person }) {
  const [hovered, setHovered] = useState(false);
  const { userSettings } = useUser();
  const { secondaryAccent } = userSettings;

  const fullRanks = {
    maj: "Major",
    lt: "Lieutenant",
    sgt: "Sergeant",
    cpl: "Corporal",
    dep: "Deputy Sheriff 1",
    trainee: "Trainee",
  };
  return (
    <motion.div
      whileHover={{ scale: 1.05, zIndex: 60 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ layout: { type: "tween", duration: 0.3 } }}
      style={{ borderColor: secondaryAccent }}
      className="w-full h-full p-2 gap-1 flex items-center rounded-lg border justify-center text-zinc-200 text-sm font-semibold bg-zinc-900"
    >
      <motion.div
        layout
        transition={{ layout: { type: "tween", duration: 0.3 } }}
        className="aspect-square size-14 flex items-center justify-center rounded-full border-2 border-sky-500"
      >
        {<BsPersonCircle size={96} />}
      </motion.div>
      <div className="flex flex-col gap-1 font-mediums justify-center items-center">
        <div className="">{`${person.lastName}, ${person.firstName[0]}`}</div>

        <div className="flex items-center justify-center px-1.5 py-0.2 text-sm rounded-xs bg-orange-500 text-zinc-950">
          {person.badgeNum}
        </div>
        <div className="">{fullRanks[person.title]}</div>
        {hovered && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className=""
          >
            {person.phone ? person.phone : "000-000-0000"}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
