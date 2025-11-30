import { motion, Reorder, useDragControls } from "motion/react";
import { BsTrash, BsList } from "react-icons/bs";
import { useState } from "react";

/** @param {data: Object, action: Function, onDragend: Function} */

export default function ListItem({ data, onRemove, onDragEnd }) {
  const controls = useDragControls();
  const [grabbed, setGrabbed] = useState(false);
  const [id, title, order] = data;

  return (
    <Reorder.Item
      as="li"
      value={data}
      dragListeners={false}
      useDragControls={controls}
      onDragEnd={() => onDragEnd()}
      initial={{ opacity: 0, height: 0, width: 0 }}
      animate={{ opacity: 1, height: "100%", width: "100%" }}
      exit={{ opacity: 0, x: 50 }}
      className="w-full flex items-center overflow-hidden bg-zinc-900/70 rounded-md 2xl:rounded-lg border border-zinc-700 p-1 2xl:px-2 2xl:py-2 justify-center gap-1 2xl:gap-2"
    >
      <div className="flex flex-col gap-1">
        <motion.div
          style={{ width: "100%", cursor: grabbed ? "grabbing" : "grab" }}
          onMouseDown={() => setGrabbed(true)}
          onMouseUp={() => setGrabbed(false)}
          className="reorder-handle text-2xl 2xl:text-3xl"
          onPointerDown={(e) => controls.start(e)}
        >
          <BsList />
        </motion.div>
      </div>
      <div className="w-full flex items-center text-md 2xl:text-lg justify-center ">
        {title}
      </div>
      <motion.div
        onClick={() => onRemove(id)}
        className="flex items-center-justify-center text-lg 2xl:text-2xl text-red-500 hover:cursor-pointer"
      >
        <BsTrash />
      </motion.div>
    </Reorder.Item>
  );
}
