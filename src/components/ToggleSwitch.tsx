import { motion } from "motion/react";
import * as React from "react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

type ToggleSize = "xs" | "sm" | "md" | "lg";

interface ToggleSwitchProps {
  state: Boolean;
  setState:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((next: boolean) => void);
  size?: ToggleSize;
  off?: string;
  text?: { isOn: string; isOff: string };
}

export default function ToggleSwitch({
  state,
  setState,
  size = "md",
  off = "#71717a",
  text,
}: ToggleSwitchProps) {
  const sizes = {
    xs: { container: "h-4 w-8 p-0.5", knob: "size-3" },
    sm: { container: "h-6 w-12 p-0.5", knob: "size-5" },
    md: { container: "h-8 w-16 p-1", knob: "size-6" },
    lg: { container: "h-10 w-20 p-1", knob: "size-8" },
  } as const satisfies Record<ToggleSize, { container: string; knob: string }>;
  const { primaryAccent } = useSafeSettings();

  return (
    <motion.div
      style={{ justifyContent: state ? "flex-end" : "flex-start" }}
      animate={{ backgroundColor: state ? primaryAccent : off }}
      transition={{ type: "tween", duration: 0.3 }}
      className={`h-${sizes[size].container} relative flex items-center hover:cursor-pointer overflow-hidden rounded-full`}
      onClick={() => setState(!state)}
    >
      {text && (
        <motion.div
          layout
          transition={{ type: "spring", duration: 0.3 }}
          style={{ justifyContent: state ? "flex-start" : "flex-end" }}
          className="absolute w-full h-full text-[.6rem] font-medium text-zinc-950 p-1.5 z-0 flex items-center"
        >
          {state ? text.isOn : text.isOff}
        </motion.div>
      )}
      <motion.div
        layout
        className={`${sizes[size].knob} bg-zinc-900 z-10 rounded-full`}
      />
    </motion.div>
  );
}
