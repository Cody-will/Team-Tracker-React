import { motion } from "motion/react";
import { useUser } from "../pages/context/UserContext";

/** @param {{ text: String, action: function, type?: button, disabled?: Boolean, color?: String, styles?: String, fontSize?: String }} props */

export default function Button({
  text,
  action,
  type,
  disabled = false,
  color,
  styles,
  fontSize,
}) {
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
  return (
    <motion.button
      disabled={disabled}
      type={type || "button"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ backgroundColor: color ? color : primaryAccent }}
      transition={{ type: "tween", duration: 0.2 }}
      className={`relative w-full whitespace-nowrap flex items-center justify-center text-center hover:cursor-pointer text-zinc-900 ${
        fontSize ? fontSize : "text-lg"
      } font-semibold rounded-lg shadow-lg/40 px-3 py-2 ${styles}`}
      onClick={action ? (event) => action(event) : () => {}}
    >
      {text}
    </motion.button>
  );
}
