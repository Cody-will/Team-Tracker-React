import { motion } from "motion/react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

/** @param {{ text: String, action: function, type?: button, disabled?: Boolean, color?: String, styles?: String, fontSize?: String, reference?: any }} props */

export default function Button({
  text,
  action,
  type,
  disabled = false,
  color,
  styles,
  fontSize,
  reference,
}) {
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  return (
    <motion.button
      disabled={disabled}
      type={type || "button"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ backgroundColor: color ? color : primaryAccent }}
      transition={{ type: "tween", duration: 0.2 }}
      className={`relative w-full whitespace-nowrap flex items-center justify-center text-center hover:cursor-pointer text-zinc-900 ${
        fontSize ? fontSize : "2xl:text-lg text-md"
      } font-semibold 2xl:rounded-lg rounded-md shadow-lg/40 2xl:px-3 2xl:py-2 px-1.5 py-1 ${styles}`}
      onClick={action ? (event) => action(event) : () => {}}
    >
      {text}
    </motion.button>
  );
}
