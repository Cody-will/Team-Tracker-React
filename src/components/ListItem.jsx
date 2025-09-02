import { motion, Reorder, useDragControls } from "motion/react";
import { BsChevronUp, BsChevronDown, BsTrash, BsList } from "react-icons/bs";
import { SlControlStart } from "react-icons/sl";
import { useState } from "react";

/** @param {data: String, action: Function} */

export default function ListItem({ data, action }) {
  const controls = useDragControls();
  const [grabbed, setGrabbed] = useState(false);
  const variants = {
    enter: { width: 0, opacity: 0 },
    center: { width: "100%", opacity: 1 },
    exit: { width: 0, opacity: 0 },
  };

  return (
    <Reorder.Item
      as="li"
      value={data}
      dragListeners={false}
      useDragControls={controls}
      initial={{ opacity: 0, height: 0, width: 0 }}
      animate={{ opacity: 1, height: "100%", width: "100%" }}
      exit={{ opacity: 0, x: 50 }}
      className="w-full flex items-center overflow-hidden bg-zinc-900/70 rounded-lg border border-zinc-700 px-2 py-2 justify-center gap-2"
    >
      <div className="flex flex-col gap-1">
        <motion.div
          style={{ width: "100%", cursor: grabbed ? "grabbing" : "grab" }}
          onMouseDown={() => setGrabbed(true)}
          onMouseUp={() => setGrabbed(false)}
          className="reorder-handle text-3xl"
          onPointerDown={(e) => controls.start(e)}
        >
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
    </Reorder.Item>
  );
}
