import type { User } from "../pages/context/UserContext";
import { motion, AnimatePresence } from "motion/react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

export type NameItemProps = { user: User };
export default function NameItem({ user }: NameItemProps) {
  const { primaryAccent } = useSafeSettings();
  return (
    <motion.div
      style={{ borderColor: primaryAccent }}
      className="
        flex flex-none border items-center
        rounded-md bg-zinc-800/80
        px-2 py-1
        text-xs 2xl:text-xs
        max-w-full
      "
    >
      <span className="truncate">{`${user.lastName}, ${user.firstName[0]} #${user.badge}`}</span>
    </motion.div>
  );
}
