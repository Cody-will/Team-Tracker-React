import { motion } from "motion/react";
import { BsChevronUp, BsChevronDown, BsTrash, BsList } from "react-icons/bs";

/** @param {data: String, action: Function} */

export default function ListItem({ data, action }) {
  const variants = {
    enter: { width: 0, opacity: 0 },
    center: { width: "100%", opacity: 1 },
    exit: { width: 0, opacity: 0 },
  };

  return (
    <motion.li
      layout
      whileHover={{ scale: 1.1 }}
      className="w-full flex items-center overflow-hidden bg-zinc-900/70 rounded-lg border border-zinc-700 px-2 py-2 justify-center gap-2"
    >
      <div className="flex flex-col gap-1">
        <motion.div className="text-3xl hover:cursor-pointer">
          <BsList />
        </motion.div>
      </div>
      <div className="w-full flex items-center text-lg justify-center ">
        {data}
      </div>
      <motion.div
        onClick={() => action(data)}
        className="flex items-center-justify-center text-2xl text-red-500 hover:cursor-pointer"
      >
        <BsTrash />
      </motion.div>
    </motion.li>
  );
}
