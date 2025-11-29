import { useState, useEffect, SetStateAction } from "react";
import { motion } from "motion/react";
import Button from "./Button";
import ToggleSwitch from "./ToggleSwitch";
import type { TempParent } from "./TeamDisplay";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

export type Location = "top-center" | "bottom-right" | "bottom-left";

export type Toggle = {
  title: string;
  state: boolean;
  setState: React.Dispatch<SetStateAction<boolean>>;
};

export type ToggleProps = Toggle[];

export interface PopUpProps {
  open?: boolean;
  onClose: (result: boolean, tempData?: TempParent) => void;
  location: Location;
  title: string;
  message: string;
  isConfirm?: boolean;
  trueText?: string;
  falseText?: string;
  timer?: number;
  toggle?: ToggleProps;
  tempData?: TempParent;
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
    toggle,
    tempData,
  } = props;
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const position = getLocation(location);
  const [time, setTime] = useState<number>(timer);

  console.log(timer);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isConfirm && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => (prev <= -1 ? timer : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConfirm, onClose]);

  useEffect(() => {
    if (!isConfirm && time === -1) {
      onClose(false);
    }
  }, [time]);

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
      initial={{ y: location === "top-center" ? -200 : 200 }}
      animate={{ y: 0 }}
      exit={{ y: location === "top-center" ? -200 : 200 }}
      transition={{ duration: 0.2 }}
      className={`fixed ${position} transform -translate-x-1/2 bg-zinc-900/90 rounded-lg text-zinc-200 border-zinc-700 flex flex-col items-center justify-center gap-4 z-50 px-6 py-2`}
    >
      <div className="text-2xl font-semibold">{title}</div>
      <div
        className="text-lg flex items-center justify-center text-center"
        style={{ paddingBottom: !isConfirm ? "4px" : "0px" }}
      >
        {message}
      </div>
      {toggle && (
        <div className="flex w-full items-center justify-evenly">
          {toggle.map((item) => (
            <ToggleBundle
              key={item.title}
              title={item.title}
              state={item.state}
              setState={item.setState}
            />
          ))}
        </div>
      )}
      {isConfirm && (
        <div className="flex w-full gap-4">
          <Button
            text={trueText ?? "Confirm"}
            action={onClose ? () => onClose(true, tempData) : () => {}}
            color={primaryAccent}
          />
          <Button
            text={falseText ?? "Cancel"}
            action={onClose ? () => onClose(false, tempData) : () => {}}
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
            className=" rounded-sm h-full"
            style={{ backgroundColor: secondaryAccent }}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: Math.max(0, time / timer) }}
            transition={{ duration: 0.95, ease: "linear" }}
          ></motion.div>
        </div>
      )}
    </motion.div>
  );
}

function ToggleBundle(props: Toggle) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="text-zinc-200 flex items-center justify-center text-lg">
        {props.title}
      </div>
      <ToggleSwitch
        key={`toggle-${props.title}`}
        state={props.state}
        setState={props.setState}
      />
    </div>
  );
}
