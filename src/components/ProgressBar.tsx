import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

type ProgressBarProps = {
  progress: number;
  label?: string;
  height?: number;
  accent: string;
};

export default function ProgressBar({
  progress,
  label = "Upload progress",
  height = 10,
  accent,
}: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className="w-full rounded-md bg-zinc-800 overflow-hidden"
      style={{ height }}
    >
      <motion.div
        className="h-full"
        initial={{ width: "0%" }}
        animate={{ width: `${clamped}%` }}
        transition={
          shouldReduceMotion
            ? { duration: 0 } // no animation for reduced motion
            : { type: "tween", ease: "easeOut", duration: 0.25 }
        }
        style={{ background: accent }}
      />
    </div>
  );
}
