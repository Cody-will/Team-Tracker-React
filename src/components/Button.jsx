import { motion } from "framer-motion";
import { primaryAccent, secondaryAccent } from "../colors.js";

export default function Button({ text, action }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "tween", duration: 0.2 }}
      className={`relative w-full flex items-center justify-center text-center text-zinc-900 text-lg font-semibold bg-${primaryAccent} rounded-lg shadow-lg/40 px-5 py-3`}
      onClick={() => action()}
    >
      {text}
    </motion.button>
  );
}
