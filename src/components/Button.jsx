import { motion } from "motion/react";
import { primaryAccent, secondaryAccent, primaryAccentHex } from "../colors";

/** @param {{ text: String, action: function, type: button:type, disabled: Boolean, color: String, styles: String }} props */

export default function Button({
  text,
  action,
  type,
  disabled = false,
  color,
  styles,
}) {
  return (
    <motion.button
      disabled={disabled}
      type={type || "button"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ backgroundColor: color ? color : primaryAccentHex }}
      transition={{ type: "tween", duration: 0.2 }}
      className={`relative w-full flex items-center justify-center text-center text-zinc-900 text-lg font-semibold rounded-lg shadow-lg/40 px-3 py-2 ${styles}`}
      onClick={action ? (event) => action(event) : () => {}}
    >
      {text}
    </motion.button>
  );
}
