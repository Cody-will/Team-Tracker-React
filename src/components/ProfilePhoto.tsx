import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import type { User } from "../pages/context/UserContext";
import { AnimatePresence, motion } from "motion/react";
import { BsPersonCircle } from "react-icons/bs";
import ProfileBadge from "./ProfileBadge";
import type { Position } from "./ProfileBadge";
import { useMemo } from "react";

export type BorderSize = "sm" | "md" | "lg";

interface ProfileProps {
  user: User;
  size?: number;
  badge?: boolean;
  borderColor?: string;
  borderSize: BorderSize;
  badgeStyle?: string;
  badgeFontSize?: number;
  isDragging?: boolean;
}

const optionKeys = [
  "trainee",
  "oic",
  "fto",
  "pit",
  "speed",
  "rifle",
  "isMandated",
] as const;
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
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const px = size * 4; // your scaling
  const isUpd = user.Divisions === "UPD";

  function getShort(title: string) {
    switch (title) {
      case "speed":
        return "SPD";
      case "rifle":
        return "RFL";
      case "trainee":
        return "TRN";
      default:
        return title;
    }
  }

  const badges = useMemo(
    () =>
      optionKeys
        .filter((option) =>
          option === "isMandated" && isUpd
            ? false
            : Boolean(user[option as BadgeKey])
        )
        .map((option, index) => (
          <ProfileBadge
            key={`${option}-${user.badge}`}
            title={
              option === "isMandated" && user.Divisions === "ADC"
                ? "D/S"
                : getShort(option).toUpperCase()
            }
            color={index % 2 === 0 ? primaryAccent : secondaryAccent}
            position={option === "isMandated" ? "top" : getPosition(index)}
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
      user.isMandated,
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
              {isUpd && (
                <ProfileBadge
                  key={`${"upd"}-${user.badge}`}
                  title={user.car.toString()}
                  color={secondaryAccent}
                  position={"top"}
                  absolute
                  anchorSize={px}
                  styles={badgeStyle}
                  fontSize={badgeFontSize}
                />
              )}
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
      return "bottom-left";
    case 2:
      return "left";
    case 3:
      return "top-left";
    case 4:
      return "bottom-right";
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
