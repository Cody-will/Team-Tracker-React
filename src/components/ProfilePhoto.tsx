import { useUser } from "../pages/context/UserContext";
import type { User } from "../pages/context/UserContext";
import { motion } from "motion/react";
import { BsPersonCircle } from "react-icons/bs";
import ProfileBadge from "./ProfileBadge";
import type { Position } from "./ProfileBadge";
import { useMemo } from "react";

interface ProfileProps {
  user: User;
  size?: number;
  badge?: boolean;
  borderColor?: string;
}

const optionKeys = ["fto", "oic", "pit", "speed", "rifle", "trainee"] as const;
type BadgeKey = (typeof optionKeys)[number];

export default function ProfilePhoto({
  user,
  size = 32,
  badge = false,
  borderColor,
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
      layout
      style={{ height: px, width: px }}
      className="relative flex items-center justify-center text-zinc-200"
    >
      <motion.div
        layout
        className="relative rounded-full flex h-full w-full justify-center items-center"
      >
        {user.photo ? (
          <img
            src={user.photo.src}
            style={{ borderColor: border }}
            className="w-full h-full border-4 rounded-full aspect-square"
          />
        ) : (
          <BsPersonCircle
            size={px} // make icon match container
            style={{ borderColor: border }}
            className="border-4 h-full w-full rounded-full"
          />
        )}
        {badge && (
          <div className="absolute inset-0 w-full h-full rounded-full">
            {badges}
          </div>
        )}
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
