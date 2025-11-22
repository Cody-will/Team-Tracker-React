import { BsPersonCircle } from "react-icons/bs";
import { findSupervisors, getShift } from "../teamSorting";
import FrontCard from "./FrontCard.tsx";
import { motion } from "motion/react";
import type { User } from "../pages/context/UserContext";
import { useDroppable } from "@dnd-kit/core";
import BlankCard from "./BackCard.tsx";
import { type ConfigureData, type TempParent } from "./TeamDisplay.tsx";
import { useConfigure } from "../pages/context/configureContext.jsx";
import { isCurrentShift, type ShiftName } from "../helpers/shiftHelper.ts";
import { useUser } from "../pages/context/UserContext";

export interface ShiftBoxProps {
  shift: string;
  team: Record<string, User>;
  id: string;
  temp: TempParent | null;
  didDrag: boolean;
}

export default function Shifts({
  shift,
  team,
  id,
  temp,
  didDrag,
}: ShiftBoxProps) {
  const { data: configData } = useConfigure();
  const { userSettings } = useUser();
  const { primaryAccent } = userSettings;
  const isCurrent = isCurrentShift(shift as ShiftName);
  const { setNodeRef: teamRef, isOver: teamIsOver } = useDroppable({
    id: `${id}-team`,
  });
  const { setNodeRef: superRef, isOver: superIsOver } = useDroppable({
    id: `${id}-super`,
  });
  const overStyle = { outline: `4px solid #10b981` };

  function isSuper(user: User): boolean {
    if (user.oic) return true;
    if (user.Ranks === "Sergeant") return true;
    return false;
  }

  console.log(isCurrent);

  return (
    <motion.div
      layout
      style={{
        borderColor: isCurrent ? primaryAccent : "#27272a",
        boxShadow: isCurrent ? `0px 0px 5px 5px ${primaryAccent}` : "none",
      }}
      className="flex flex-col h-full w-full bg-zinc-950/50 border-2  rounded-xl overflow-hidden"
    >
      <motion.div className="flex items-center justify-center text-zinc-200 text-lg bg-zinc-950/60 rounded-t-sm p-1 font-semibold">
        {shift}
      </motion.div>
      <motion.div
        ref={superRef}
        style={superIsOver ? overStyle : {}}
        className="h-1/3 w-full border-b-2 rounded-md border-zinc-950 flex items-center justify-center gap-2 p-2"
      >
        {Object.values(team)
          .filter((user) => {
            if (!temp) {
              return isSuper(user) && user.Shifts === shift;
            }
            if (temp.uid === user.uid) {
              return temp.shift === shift && temp.container === "super";
            }
            return isSuper(user) && user.Shifts === shift;
          })
          .sort(
            (a, b) =>
              getOrder(a.Ranks, configData) - getOrder(b.Ranks, configData)
          )
          .map((user) => (
            <FrontCard key={user.uid} person={user} didDrag={didDrag} />
          ))}
      </motion.div>
      <motion.div
        ref={teamRef}
        style={teamIsOver ? overStyle : {}}
        className="h-full w-full grid grid-cols-2 rounded-md place-items-start gap-2 p-2"
      >
        {Object.values(team)
          .filter((user) => {
            if (!temp) {
              return !isSuper(user) && user.Shifts === shift;
            }

            if (temp.uid === user.uid) {
              return temp.shift === shift && temp.container === "team";
            }

            return !isSuper(user) && user.Shifts === shift;
          })
          .sort(
            (a, b) =>
              getOrder(a.Ranks, configData) - getOrder(b.Ranks, configData)
          )
          .map((user) => (
            <FrontCard key={user.uid} person={user} didDrag={didDrag} />
          ))}
      </motion.div>
    </motion.div>
  );
}

function getOrder(rank: string, data: ConfigureData): number {
  const ranks = data.Ranks.items;
  const order = Object.values(ranks).filter((ranks) => ranks.title === rank);
  return order[0].order;
}
