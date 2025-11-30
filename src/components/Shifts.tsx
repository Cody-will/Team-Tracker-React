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
import { useSchedule } from "../pages/context/ScheduleContext";
import { isWorking } from "../helpers/schedulehelper.ts";
import { useSafeSettings } from "../pages/hooks/useSafeSettings.ts";
import { useBreakpoint } from "../pages/hooks/useBreakoint.ts";

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
  const { data: users, userSettings } = useUser();
  const { events, coverage } = useSchedule();
  const { primaryAccent } = useSafeSettings();
  const isCurrent = isCurrentShift(shift as ShiftName);
  const { twoXlUp } = useBreakpoint();

  const shadow = twoXlUp
    ? `0px 0px 5px 5px ${primaryAccent}`
    : `0px 0px 5px 2px ${primaryAccent}`;

  const { setNodeRef: teamRef, isOver: teamIsOver } = useDroppable({
    id: `${id}-team`,
  });
  const { setNodeRef: superRef, isOver: superIsOver } = useDroppable({
    id: `${id}-super`,
  });

  const overStyle = { outline: `4px solid #10b981` };

  function isSuper(user?: User): boolean {
    if (!user) return false;
    if (user.oic) return true;
    if (user.Ranks === "Sergeant") return true;
    return false;
  }

  return (
    <motion.div
      layout
      style={{
        borderColor: isCurrent ? primaryAccent : "#27272a",
        boxShadow: isCurrent ? shadow : "none",
      }}
      className="flex flex-col h-full w-full bg-zinc-950/50 border-2 rounded-lg 2xl:rounded-xl"
    >
      <motion.div className="flex items-center justify-center text-zinc-200 text-lg bg-zinc-950/60 rounded-t-md 2xl:rounded-t-lg p-1 font-semibold">
        {shift}
      </motion.div>

      {/* ── Supervisors (Sergeant / OIC) ─────────────────────────── */}
      <motion.div
        ref={superRef}
        style={superIsOver ? overStyle : {}}
        className="h-1/3 w-full border-b-2 rounded-md border-zinc-950 flex items-center justify-center 2xl:gap-2 2xl:p-2 p-1.5 gap-1"
      >
        {Object.values(team)
          .filter((user) => {
            const superFlag = isSuper(user);
            const isHomeShift = user.Shifts === shift;

            if (!temp) {
              if (!superFlag) return false;

              // Is this supervisor being replaced by ANOTHER supervisor today on this shift?
              const replacedBySuper = Object.values(users).some((other) => {
                if (!isSuper(other)) return false;
                if (other.uid === user.uid) return false;

                const { isWorking: otherWorksHere, workingFor } = isWorking(
                  other.uid,
                  shift as ShiftName,
                  events,
                  coverage,
                  users
                );

                // other is working here, for this user, and both are supervisors
                return (
                  otherWorksHere &&
                  workingFor === user.uid &&
                  isSuper(user) &&
                  isSuper(other)
                );
              });

              if (replacedBySuper) {
                // Off supervisor fully replaced by another supervisor -> hide them here
                return false;
              }

              // Home-shift supervisor: always show (even if off; you'll fade them in FrontCard)
              if (isHomeShift) {
                return true;
              }

              // Non-home supervisor: show here if they're working this shift
              // AND they're covering a supervisor
              const { isWorking: worksHere, workingFor } = isWorking(
                user.uid,
                shift as ShiftName,
                events,
                coverage,
                users
              );
              if (!worksHere) return false;

              const owner = workingFor ? users[workingFor] : undefined;
              return !!owner && isSuper(owner);
            }

            // While a temp move is in progress, only show the temp user here
            if (temp.uid === user.uid) {
              return temp.shift === shift && temp.container === "super";
            }

            // Everyone else, same as non-temp logic
            if (!superFlag) return false;

            const { isWorking: worksHere, workingFor } = isWorking(
              user.uid,
              shift as ShiftName,
              events,
              coverage,
              users
            );
            const owner = workingFor ? users[workingFor] : undefined;

            if (isHomeShift) {
              const replacedBySuper = Object.values(users).some((other) => {
                if (!isSuper(other)) return false;
                if (other.uid === user.uid) return false;

                const { isWorking: otherWorksHere, workingFor } = isWorking(
                  other.uid,
                  shift as ShiftName,
                  events,
                  coverage,
                  users
                );

                return (
                  otherWorksHere &&
                  workingFor === user.uid &&
                  isSuper(user) &&
                  isSuper(other)
                );
              });

              if (replacedBySuper) return false;
              return true;
            }

            if (!worksHere) return false;
            return !!owner && isSuper(owner);
          })
          .sort(
            (a, b) =>
              getOrder(a.Ranks, configData) - getOrder(b.Ranks, configData)
          )
          .map((user) => (
            <FrontCard
              key={user.uid}
              person={user}
              didDrag={didDrag}
              currShift={shift}
              isCurrentShift={isCurrent}
            />
          ))}
      </motion.div>

      {/* ── Team (non-supervisors + supervisors covering team slots) ─── */}
      <motion.div
        ref={teamRef}
        style={teamIsOver ? overStyle : {}}
        className="h-full w-full grid grid-cols-2 rounded-md place-items-start 2xl:gap-2 2xl:p-2 p-1.5 gap-1"
      >
        {Object.values(team)
          .filter((user) => {
            const superFlag = isSuper(user);
            const isHomeShift = user.Shifts === shift;

            const { isWorking: worksHere, workingFor } = isWorking(
              user.uid,
              shift as ShiftName,
              events,
              coverage,
              users
            );
            const owner = workingFor ? users[workingFor] : undefined;

            if (!temp) {
              // Supervisors in team container:
              // - If they're covering a supervisor → stay in supervisor container, NOT here
              // - If they're covering a regular → show in team
              if (superFlag) {
                if (!worksHere) return false;
                if (owner && isSuper(owner)) return false; // sup→sup goes in supervisor
                return true; // sup→regular goes in team
              }

              // Regulars:
              if (isHomeShift) {
                // Home-shift regular always shows (off logic handled in the card)
                return true;
              }

              // Non-home regular: show if they're working this shift (coverage/swap)
              return worksHere;
            }

            // Temp drag override: only show temp user in target container
            if (temp.uid === user.uid) {
              return temp.shift === shift && temp.container === "team";
            }

            // Everyone else, same as non-temp
            if (superFlag) {
              if (!worksHere) return false;
              if (owner && isSuper(owner)) return false;
              return true;
            }

            if (isHomeShift) return true;
            return worksHere;
          })
          .sort(
            (a, b) =>
              getOrder(a.Ranks, configData) - getOrder(b.Ranks, configData)
          )
          .map((user) => (
            <FrontCard
              key={
                user.Shifts !== shift
                  ? `${user.uid}-${shift}-working`
                  : user.uid
              }
              person={user}
              didDrag={didDrag}
              currShift={shift}
              isCurrentShift={isCurrent}
            />
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
