// src/components/FrontCard.tsx
import { motion } from "motion/react";
import { useState } from "react";
import { useUser } from "../pages/context/UserContext";
import ProfilePhoto from "./ProfilePhoto";
import { useDraggable } from "@dnd-kit/core";
import type { User } from "../pages/context/UserContext";
import { CSS } from "@dnd-kit/utilities";
import FlippableCard from "./FlippableCard";
import BackCard from "./BackCard";
import { useSchedule } from "../pages/context/ScheduleContext";
import { isOff, isWorking, type ShiftName } from "../helpers/schedulehelper";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

export interface NewCardProps {
  person: User;
  didDrag: boolean;
  currShift: string;
  noFlip?: boolean;
  noFade?: boolean;
}

export default function FrontCard({
  person,
  didDrag,
  currShift,
  noFlip = false,
  noFade = false,
}: NewCardProps) {
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const { events, coverage } = useSchedule();
  const { isOff: offToday, type: offReason } = isOff(person.uid, events);

  const { data: users } = useUser();
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const { isWorking: covering, reason: coveringReason } = isWorking(
    person.uid,
    currShift as ShiftName,
    events,
    coverage,
    users
  );
  const isCovering = person.Shifts !== currShift && covering;
  if (isCovering) noFlip = true;
  const id = isCovering ? `${person.uid}-${person.badge}-covering` : person.uid;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const dragStyle: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleCardClick = () => {
    if (didDrag) return;
    setFlipped((prev) => !prev);
  };

  function checkOff() {
    return person.sick || offToday || person.medical;
  }

  // Your existing front card content (unchanged styling)
  const front = (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ layout: { type: "tween", duration: 0.3 } }}
      style={{
        borderColor: hovered && !noFlip ? primaryAccent : secondaryAccent,
        backgroundColor: checkOff() ? `#18181b85` : "#18181b",
        opacity: isDragging ? 0.8 : 1,
      }}
      className="relative h-full w-full p-2 gap-1 flex border items-center rounded-lg justify-center text-zinc-200 text-sm font-semibold bg-zinc-900"
    >
      {(offToday || (person.sick && !noFade)) && (
        <div
          style={{ backgroundColor: primaryAccent }}
          className="absolute inset-y-0 left-0 w-5 rounded-l-lg flex items-center justify-center"
        >
          <span className="text-[12px] font-semibold text-zinc-900 [writing-mode:vertical-rl] rotate-180 tracking-[0.15em]">
            {person.sick ? "Sick" : offReason?.replaceAll("-", " ")}
          </span>
        </div>
      )}
      {isCovering && !noFade && (
        <div
          style={{ backgroundColor: primaryAccent }}
          className="absolute inset-y-0 left-0 w-5 rounded-l-lg flex items-center justify-center"
        >
          <span className="text-[12px] font-semibold text-zinc-900 [writing-mode:vertical-rl] rotate-180 tracking-[0.15em]">
            {coveringReason?.replaceAll("-", " ")}
          </span>
        </div>
      )}
      <motion.div
        style={{ opacity: checkOff() && !noFade ? 0.7 : 1 }}
        layout={isDragging ? false : true}
        transition={{
          layout: isDragging ? {} : { type: "tween", duration: 0.3 },
        }}
      >
        <ProfilePhoto
          user={person}
          size={20}
          badge={noFlip ? true : !flipped}
          borderSize="md"
          badgeStyle="font-semibold"
          badgeFontSize={18}
          isDragging={isDragging}
        />
      </motion.div>

      <div
        style={{ opacity: checkOff() && !noFade ? 0.7 : 1 }}
        className="flex flex-col gap-1 font-mediums justify-center items-center"
      >
        <div>{`${person.lastName}, ${person.firstName[0]}`}</div>

        <div
          style={{ backgroundColor: secondaryAccent }}
          className="flex items-center justify-center px-1.5 py-0.2 text-sm rounded-xs text-zinc-950"
        >
          {person.badge}
        </div>

        <div>{person.Ranks}</div>
      </div>
    </motion.div>
  );

  const back = <BackCard user={person} />;

  return (
    <motion.div
      ref={setNodeRef}
      style={
        noFlip
          ? {}
          : { ...dragStyle, cursor: flipped ? "pointer" : dragStyle.cursor }
      }
      {...(flipped || noFlip ? {} : listeners)}
      {...(flipped || noFlip ? {} : attributes)}
      onClick={handleCardClick}
      className="h-full w-full"
    >
      <FlippableCard
        flipped={flipped}
        front={front}
        back={back}
        noFlip={noFlip}
      />
    </motion.div>
  );
}
