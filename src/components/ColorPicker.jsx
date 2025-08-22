import { motion, AnimatePresence } from "motion/react";

export default function ColorPicker({ selectedColor, setSelectedColor }) {
  const colors = [
    "#64748b", // slate-500
    "#71717a", // zinc-500
    "#78716c", // stone-500
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#22c55e", // green-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#0ea5e9", // sky-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#a855f7", // purple-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
  ];

  return (
    <motion.div
      layout
      className="relative grid grid-cols-4 gap-4 flex-wrap text-lg font-semibold text-zinc-200"
    >
      <AnimatePresence>
        {colors.map((color) => (
          <motion.div
            layout
            style={{
              backgroundColor: color,
              borderColor: color === selectedColor ? "white" : "black",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "tween" }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedColor(color)}
            key={color}
            className={`size-32 border rounded-lg`}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
