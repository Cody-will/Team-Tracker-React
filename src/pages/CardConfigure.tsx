import { motion } from "motion/react";
import OrganizeCard from "../components/OrganizeCard";
import { useUser } from "../pages/context/UserContext";
import CreateInfoCard from "../components/CreateInfoCard";
import { useSafeSettings } from "./hooks/useSafeSettings";

export default function CardConfigure() {
  const { primaryAccent, secondaryAccent } = useSafeSettings();

  return (
    <motion.div className="lg:h-full min-h-screen 2xl:h-full w-full lg:p-4 p-2 flex justify-center items-center">
      <motion.div
        id="panel"
        style={{ borderColor: `${primaryAccent}95` }}
        className=" border-zinc-800  bg-zinc-950/50 max-w-1/2 lg:max-h-[95%] overflow-scroll lg:min-w-1/2 lg:min-h-3/4 flex justify-center  min-h-dvh w-full p-1 lg:p-2 items-center rounded-lg"
      >
        <CreateInfoCard />
      </motion.div>
    </motion.div>
  );
}
