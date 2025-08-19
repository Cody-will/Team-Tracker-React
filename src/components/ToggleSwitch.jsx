import { motion, AnimatePresence } from "motion/react";
import { primaryAccent, primaryAccentHex } from "../colors";

/** @typedef {'sm'|'md'|'lg'} ToggleSize */
/**@param {{ state: boolean, setState: import('react').Dispatch<import('react').SetStateAction<boolean>>, size?: ToggleSize }} props*/

export default function ToggleSwitch({ state, setState, size = "md" }) {
  const off = "#71717a";
  const sizes = {
    sm: { container: "h-6 w-12 p-0.5", knob: "size-5" },
    md: { container: "h-8 w-16 p-1", knob: "size-6" },
    lg: { container: "h-10 w-20 p-1", knob: "size-8" },
  };
  console.log(sizes[size].height);
  return (
    <motion.div
      style={{ justifyContent: state ? "flex-end" : "flex-start" }}
      animate={{ backgroundColor: state ? primaryAccentHex : off }}
      transition={{ type: "tween", duration: 0.3 }}
      className={`h-${sizes[size].container} flex items-center rounded-full`}
      onClick={() => setState(!state)}
    >
      <motion.div
        layout
        className={`${sizes[size].knob} bg-zinc-900 rounded-full`}
      />
    </motion.div>
  );
}
