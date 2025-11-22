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

export interface NewCardProps {
  person: User;
  didDrag: boolean;
}

export default function FrontCard({ person, didDrag }: NewCardProps) {
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const id = person.uid;
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;

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

  // Your existing front card content (unchanged styling)
  const front = (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ layout: { type: "tween", duration: 0.3 } }}
      style={{
        borderColor: hovered ? primaryAccent : secondaryAccent,
        opacity: person.sick || person.medical ? 0.6 : 1,
      }}
      className="h-full w-full p-2 gap-1 flex border items-center rounded-lg justify-center text-zinc-200 text-sm font-semibold bg-zinc-900"
    >
      <motion.div
        layout={isDragging ? false : true}
        transition={{
          layout: isDragging ? {} : { type: "tween", duration: 0.3 },
        }}
      >
        <ProfilePhoto
          user={person}
          size={20}
          badge={!flipped}
          borderSize="md"
          badgeStyle="font-semibold"
          badgeFontSize={18}
          isDragging={isDragging}
        />
      </motion.div>

      <div className="flex flex-col gap-1 font-mediums justify-center items-center">
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
      style={{ ...dragStyle, cursor: flipped ? "pointer" : dragStyle.cursor }}
      {...(flipped ? {} : listeners)}
      {...(flipped ? {} : attributes)}
      onClick={handleCardClick}
      className="h-full w-full"
    >
      <FlippableCard flipped={flipped} front={front} back={back} />
    </motion.div>
  );
}
