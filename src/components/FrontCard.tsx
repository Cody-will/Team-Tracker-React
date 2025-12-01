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
import { useBreakpoint } from "../pages/hooks/useBreakpoint";
import type { BorderSize } from "./ProfilePhoto";

export interface NewCardProps {
  person: User;
  didDrag: boolean;
  currShift: string;
  noFlip?: boolean;
  noFade?: boolean;
  noBadge?: boolean;
  photoSize?: number;
  isCurrentShift?: boolean;
}

type Sizing = {
  newPhotoSize: number;
  bannerText: number;
  photoBorder: BorderSize;
  badgeFont: number;
};

export default function FrontCard({
  person,
  didDrag,
  currShift,
  noFlip = false,
  noFade = false,
  noBadge = false,
  photoSize = 18,
  isCurrentShift = false,
}: NewCardProps) {
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const { events, coverage } = useSchedule();
  const { isOff: offToday, type: offReason } = isOff(person.uid, events);
  const { lgUp, twoXlUp } = useBreakpoint();

  const { data: users } = useUser();
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const { isWorking: covering, reason: coveringReason } = isWorking(
    person.uid,
    currShift as ShiftName,
    events,
    coverage,
    users
  );

  const { newPhotoSize, bannerText, photoBorder, badgeFont } = getSizing();
  const isCovering = person.Shifts !== currShift && covering;
  if (isCovering) noFlip = true;

  function getSizing(): Sizing {
    if (twoXlUp) {
      return {
        newPhotoSize: photoSize,
        bannerText: 12,
        photoBorder: "md",
        badgeFont: 18,
      };
    }
    if (lgUp) {
      return {
        newPhotoSize: 12,
        bannerText: 10,
        photoBorder: "sm",
        badgeFont: 16,
      };
    }
    return {
      newPhotoSize: 10,
      bannerText: 8,
      photoBorder: "sm",
      badgeFont: 14,
    };
  }

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

  // --- NEW LOGIC (YOUR OLD FUNCTION LEFT THE SAME) ---
  function checkOff() {
    return person.sick || offToday || person.medical;
  }

  // FADE CONDITIONS:
  // - Medical always fades (unless noFade)
  // - Sick/off fade only when this is the current shift
  const shouldFade =
    !noFade &&
    (person.medical || (isCurrentShift && (person.sick || offToday)));

  // SIDE BANNER for sick/off:
  const showOffBanner =
    person.medical || (isCurrentShift && !noFade && (person.sick || offToday));

  function getOffReason() {
    return person.medical
      ? { value: person.medical, reason: "Medical" }
      : { value: person.sick, reason: "Sick" };
  }

  // ----------------------------------------------

  const front = (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ layout: { type: "tween", duration: 0.3 } }}
      style={{
        borderColor: hovered && !noFlip ? primaryAccent : secondaryAccent,
        backgroundColor: shouldFade ? `#18181b85` : "#18181b",
        opacity: isDragging ? 0.8 : 1,
      }}
      className="relative lg:h-full h-auto 2xl:h-full  p-2 2xl:gap-1 gap-0.5 flex border items-center rounded-md lg:rounded-lg justify-center text-zinc-200 text-sm font-semibold bg-zinc-900"
    >
      {showOffBanner && !noFlip && (
        <div
          style={{ backgroundColor: primaryAccent }}
          className="absolute inset-y-0 left-0 2xl:w-5 w-3 rounded-l-lg flex items-center justify-center"
        >
          <span className="2xl:text-[12px] text-[8px] font-semibold text-zinc-900 [writing-mode:vertical-rl] rotate-180 tracking-[0.15em]">
            {getOffReason().value
              ? getOffReason().reason
              : offReason?.replaceAll("-", " ")}
          </span>
        </div>
      )}

      {isCovering && !noFade && (
        <div
          style={{ backgroundColor: primaryAccent }}
          className="absolute inset-y-0 left-0 2xl:w-5 w-2 rounded-l-lg flex items-center justify-center"
        >
          <span
            style={{ fontSize: bannerText }}
            className="2xl:text-[12px] text-[8px] font-semibold text-zinc-900 [writing-mode:vertical-rl] rotate-180 tracking-[0.15em]"
          >
            {coveringReason?.replaceAll("-", " ")}
          </span>
        </div>
      )}

      <motion.div
        style={{ opacity: shouldFade ? 0.7 : 1 }}
        layout={isDragging ? false : true}
        transition={{
          layout: isDragging ? {} : { type: "tween", duration: 0.3 },
        }}
      >
        <ProfilePhoto
          user={person}
          size={newPhotoSize}
          badge={noFlip ? !noBadge : !flipped}
          borderSize={photoBorder}
          badgeStyle="font-semibold"
          badgeFontSize={badgeFont}
          isDragging={isDragging}
        />
      </motion.div>

      <div
        style={{ opacity: shouldFade ? 0.7 : 1 }}
        className="flex flex-col gap-1 2xl:text-[16px] 2xl:font-medium justify-center items-center text-xs font-medium text-nowrap"
      >
        <div>{`${person.lastName}, ${person.firstName[0]}`}</div>

        <div
          style={{ backgroundColor: secondaryAccent }}
          className="flex items-center justify-center 2xl:px-1 2xl:py-0.5 2xl:text-sm rounded-xs text-zinc-950 text-[.5rem] lg:text-xs px-0.5 py-0"
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
          : {
              ...dragStyle,
              cursor: flipped ? "pointer" : dragStyle.cursor,
              touchAction: "none",
            }
      }
      {...(flipped || noFlip ? {} : listeners)}
      {...(flipped || noFlip ? {} : attributes)}
      onClick={handleCardClick}
      className="lg:h-full h-auto w-full "
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
