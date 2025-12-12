import type { User } from "../pages/context/UserContext";
import { motion, AnimatePresence } from "motion/react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import type { SignupProp } from "./InfoCard";



export default function NameItem(props: SignupProp) {
  const { primaryAccent } = useSafeSettings();
  const {uid, firstName, lastName, badge} = props;
  console.log(props)
  return (
    <motion.div
      style={{ borderColor: primaryAccent }}
      className="
        flex flex-1 border items-center justify-center
        rounded-md bg-zinc-800/80
        px-2 py-1
        text-xs 2xl:text-xs
        max-w-full
      "
    >
      <span className="truncate">{`${lastName}, ${firstName[0]} #${badge}`}</span>
    </motion.div>
  );
}
