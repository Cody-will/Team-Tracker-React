import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Button from "./Button";
import { useUser } from "../pages/context/UserContext";

export interface PopUpProps {
  open: boolean;
  onClose?: (result: boolean) => void;
  location: "top-center" | "bottom-right" | "bottom-left";
  title: string;
  message: string;
  isConfirm?: boolean;
  trueText?: string;
  falseText?: string;
  timer?: number;
}

export default function PopUp(props: PopUpProps) {
  const {
    open,
    onClose,
    location,
    title,
    message,
    isConfirm,
    trueText,
    falseText,
    timer = 5,
  } = props;
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
  const position = getLocation(location);
  const [time, setTime] = useState<number>(timer);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isConfirm && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
    }
    return () => clearInterval(interval);
  }, []);

  function getLocation(location: string) {
    switch (location) {
      case "top-center":
        return "top-2 left-1/2";
      case "bottom-right":
        return "bottom-2 right-2";
      case "bottom-left":
        return "bottom-2 left-2";
      default:
        return "top-2 left-1/2";
    }
  }

  return (
    <motion.div
      id="panel"
      className={`absolute ${position} transform -translate-x-2/3 bg-zinc-900/90 rounded-lg text-zinc-200 border-zinc-700 flex flex-col items-center justify-center gap-4 z-50 px-8 py-4`}
    >
      <div className="text-3xl font-semibold">{title}</div>
      <div className="text-xl">{time}</div>
      {isConfirm && (
        <div className="flex gap-4">
          <Button
            text={trueText ?? "Confirm"}
            action={onClose ? () => onClose(true) : () => {}}
            color={primaryAccent}
          />
          <Button
            text={falseText ?? "Cancel"}
            action={onClose ? () => onClose(false) : () => {}}
            color={secondaryAccent}
          />
        </div>
      )}

      {!isConfirm && (
        <div
          className="absolute bottom-0 h-1 w-full"
          aria-valuemin={0}
          aria-valuemax={100}
          aia-valuenow={time}
        >
          <motion.div
            className=" rounded-sm h-full bg-sky-500"
            style={{ width: `${time / timer}%` }}
          ></motion.div>
        </div>
      )}
    </motion.div>
  );
}
