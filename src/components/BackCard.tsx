// src/components/BackCard.tsx
import type { User } from "../pages/context/UserContext";
import { useState, useEffect } from "react";
import { useUser } from "../pages/context/UserContext";
import { motion } from "motion/react";
import ToggleSwitch from "./ToggleSwitch";
import { calculateSickExpires } from "../helpers/sickHelper";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

export interface BackCardProps {
  user: User;
}

export default function BackCard({ user }: BackCardProps) {
  const [isSick, setSick] = useState(user.sick ?? false);
  const [isMedical, setMedical] = useState(user.medical ?? false);
  const { userSettings, updateAfterDrag, user: currUser } = useUser();
  const { secondaryAccent } = useSafeSettings();

  useEffect(() => {
    // user.sick here is already "fixed" by UserContext
    setSick(user.sick ?? false);
  }, [user.sick]);

  const handleSickToggle = (next: boolean) => {
    setSick(next);

    if (!next) {
      updateAfterDrag(user.uid, "sick", false);
      updateAfterDrag(user.uid, "sickExpires", null);
      return;
    }

    const expiresAt = calculateSickExpires(user);
    updateAfterDrag(user.uid, "sick", true);
    updateAfterDrag(user.uid, "sickExpires", expiresAt);
  };

  const handleMedicalToggle = (next: boolean) => {
    setMedical(next);
    updateAfterDrag(user.uid, "medical", next);
  };

  const stopClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  function permission() {
    if (!currUser) return;
    return currUser.Role === "Admin" || currUser.oic;
  }

  return (
    <motion.div
      layout
      style={{ borderColor: secondaryAccent }}
      className="flex items-center justify-center flex-col h-full w-full p-4 bg-zinc-900 rounded-lg border text-zinc-200"
    >
      <div className="text-md lg:text-xs 2xl:text-md text-nowrap font-semibold">{`${user.firstName} ${user.lastName}`}</div>

      {user.phone && user.phone.length >= 10 && (
        <div className="font-semibold text-xs lg:font-medium 2xl:font-semibold">
          {`(${user.phone.slice(0, 3)}) ${user.phone.slice(
            3,
            6
          )} - ${user.phone.slice(6, 10)}`}
        </div>
      )}
      {user.secondPhone && user.secondPhone.length >= 10 && (
        <div className="font-semibold text-xs lg:font-medium 2xl:font-semibold">
          {`(${user.secondPhone.slice(0, 3)}) ${user.secondPhone.slice(
            3,
            6
          )} - ${user.secondPhone.slice(6, 10)}`}
        </div>
      )}

      <div
        className="flex items-center justify-evenly gap-2"
        onClick={stopClick}
      >
        {" "}
        {permission() && (
          <>
            <motion.div className="flex items-center flex-col justify-center">
              <div className="text-xs font-normal 2xl:font-medium">Sick</div>
              <ToggleSwitch
                state={isSick}
                setState={handleSickToggle}
                size="xs"
              />
            </motion.div>

            <motion.div className="flex items-center justify-center flex-col">
              <div className="text-xs font-bormal 2xl:font-medium">Medical</div>
              <ToggleSwitch
                state={isMedical}
                setState={handleMedicalToggle}
                size="xs"
              />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
