import { useMemo } from "react";

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
}

export default function ProfileBadge({
  title,
  color,
  position = "bottom",
  absolute = false,
  anchorSize = 128,
  styles,
}: BadgeProps): React.ReactElement {
  const { posStyle, fontScaleStyle } = useMemo(
    () => getPositionAndScale(position, anchorSize, absolute),
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
        !styles && "font-medium"
      } rounded-sm flex items-center justify-center text-center text-zinc-900 whitespace-nowrap`}
    >
      {title}
    </div>
  );
}

function getPositionAndScale(
  position: Position,
  anchorSize: number,
  absolute: boolean
) {
  // Base everything on the circle radius.
  const diameter = anchorSize;
  const r = diameter / 2;
  const cx = r;
  const cy = r * 0.9;

  // choose angle on the circle for each position
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
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  const posStyle = absolute
    ? {
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)", // center of badge sits on that point
      }
    : {};

  // Scale font and padding relative to some base diameter (e.g. 128px)
  const baseDiameter = 128;
  const scale = diameter / baseDiameter;

  const fontScaleStyle: React.CSSProperties = {
    fontSize: `${12 * scale}px`,
    paddingInline: `${3 * scale}px`,
    paddingBlock: `${0.5 * scale}px`,
    borderRadius: `${4 * scale}px`,
  };

  return absolute ? { posStyle, fontScaleStyle } : {};
}
