import { useMemo } from "react";
import { useUser } from "../pages/context/UserContext";

export type Position =
  | "bottom"
  | "bottom-right"
  | "bottom-left"
  | "top"
  | "left"
  | "right";

export interface BadgeProps {
  title: string;
  color?: string;
  position?: Position;
  absolute?: boolean;
  anchorSize?: number;
  styles?: string;
  fontSize?: number;
}

export default function ProfileBadge({
  title,
  color,
  position = "bottom",
  absolute = false,
  anchorSize = 128,
  styles,
  fontSize = 12,
}: BadgeProps): React.ReactElement {
  const { userSettings } = useUser();
  const { secondaryAccent } = userSettings;
  if (title === "D/S") color = secondaryAccent;
  if (typeof title === "number") color = secondaryAccent;

  const { posStyle, fontScaleStyle } = useMemo(
    () => getPositionAndScale(position, anchorSize, absolute, fontSize),
    [position, anchorSize, absolute]
  );

  return (
    <div
      style={{
        position: absolute ? "absolute" : "relative",
        zIndex: absolute ? 50 : 10,
        backgroundColor: color,
        ...posStyle,
        ...fontScaleStyle,
      }}
      className={`${styles && styles} ${
        !styles && "font-semibold"
      } rounded-sm flex items-center justify-center text-center text-zinc-900 whitespace-nowrap`}
    >
      {title}
    </div>
  );
}

function getPositionAndScale(
  position: Position,
  anchorSize: number,
  absolute: boolean,
  fontSize: number
) {
  const diameter = anchorSize;
  const r = diameter / 2;
  const cx = r;
  const cy = r * 0.9;

  let angleDeg = 90; // default bottom
  switch (position) {
    case "bottom":
      angleDeg = 90;
      break;
    case "bottom-right":
      angleDeg = 45;
      break;
    case "bottom-left":
      angleDeg = 135;
      break;
    case "right":
      angleDeg = 0;
      break;
    case "left":
      angleDeg = 180;
      break;
    case "top":
      angleDeg = 270;
      break;
    default:
      angleDeg = 90;
  }

  const rad = (angleDeg * Math.PI) / 180;

  // 🔥 use a slightly smaller radius when on top so it sits just under the border
  const effectiveRadius = position === "top" ? r * 0.8 : r; // tweak 0.85 up/down to taste

  const x = cx + effectiveRadius * Math.cos(rad);
  const y = cy + effectiveRadius * Math.sin(rad);

  const posStyle = absolute
    ? {
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      }
    : {};

  const baseDiameter = 128;
  const scale = diameter / baseDiameter;

  const fontScaleStyle: React.CSSProperties = {
    fontSize: `${fontSize * scale}px`,
    paddingInline: `${3 * scale}px`,
    paddingBlock: `${0.5 * scale}px`,
    borderRadius: `${4 * scale}px`,
  };

  return absolute ? { posStyle, fontScaleStyle } : {};
}
