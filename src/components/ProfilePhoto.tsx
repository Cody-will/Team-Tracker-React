import { useUser } from "../pages/context/UserContext";
import type { User } from "../pages/context/UserContext";
import { AnimatePresence, motion } from "motion/react";
import { BsPersonCircle } from "react-icons/bs";
import ProfileBadge from "./ProfileBadge";
import type { Position } from "./ProfileBadge";
import { useMemo } from "react";

interface ProfileProps {
  user: User;
  size?: number;
  badge?: boolean;
  borderColor?: string;
  borderSize: "sm" | "md" | "lg";
  badgeStyle?: string;
  badgeFontSize?: number;
  isDragging?: boolean;
}

const optionKeys = ["fto", "oic", "pit", "speed", "rifle", "trainee"] as const;
type BadgeKey = (typeof optionKeys)[number];

export default function ProfilePhoto({
  user,
  size = 32,
  badge = false,
  borderColor,
  borderSize = "md",
  badgeStyle,
  badgeFontSize,
  isDragging = false,
}: ProfileProps) {
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
  const px = size * 4; // your scaling

  const badges = useMemo(
    () =>
      optionKeys
        .filter((option) => Boolean(user[option as BadgeKey]))
        .map((option, index) => (
          <ProfileBadge
            key={`${option}-${user.badge}`}
            title={option.toUpperCase()}
            color={index % 2 === 0 ? primaryAccent : secondaryAccent}
            position={getPosition(index)}
            absolute
            anchorSize={px}
            styles={badgeStyle}
            fontSize={badgeFontSize}
          />
        )),
    [
      user.fto,
      user.oic,
      user.pit,
      user.speed,
      user.rifle,
      user.trainee,
      user.badge,
      primaryAccent,
      secondaryAccent,
    ]
  );

  const border = borderColor ?? secondaryAccent;

  return (
    <motion.div
      layout={!isDragging}
      style={{ height: px, width: px }}
      className="relative flex items-center justify-center text-zinc-200"
    >
      <motion.div
        layout={!isDragging}
        className="relative rounded-full flex h-full w-full justify-center items-center"
      >
        {user.photo ? (
          <img
            src={user.photo.src}
            style={{
              borderColor: border,
              borderWidth: `${getBorder(borderSize)}px`,
            }}
            className="w-full h-full rounded-full aspect-square"
          />
        ) : (
          <BsPersonCircle
            size={px} // make icon match container
            style={{
              borderColor: border,
              borderWidth: borderSize === "lg" ? "4px" : "2px",
            }}
            className=" h-full w-full rounded-full"
          />
        )}
        <AnimatePresence initial={false}>
          {badge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute inset-0 w-full h-full rounded-full"
            >
              {badges}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function getPosition(num: number): Position {
  switch (num) {
    case 0:
      return "bottom";
    case 1:
      return "bottom-right";
    case 2:
      return "bottom-left";
    case 3:
      return "right";
    case 4:
      return "left";
    default:
      return "bottom";
  }
}

function getBorder(size: string): number {
  switch (size) {
    case "sm":
      return 2;
    case "md":
      return 3;
    case "lg":
      return 4;
    default:
      return 3;
  }
}
