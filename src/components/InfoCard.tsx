import { useState, useEffect, FC } from "react";
import InfoItem from "./InfoItem";
import { useUser } from "../pages/context/UserContext";

export interface InfoCardProps {
  title: string;
  props: any[];
  column?: boolean;
  extendedProps?: any[];
}

export default function InfoCard({
  title,
  props,
  column = true,
  extendedProps,
}: InfoCardProps) {
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;

  return (
    <div
      style={{ borderColor: secondaryAccent }}
      className="relative p-2 rounded-md flex flex-col justify-center border-2 items-center h-full w-full overflow-hidden bg-zinc-900 shadow-lg/30"
    >
      <div className="flex w-full items-center justify-start text-lg font-bold text-zinc-200">
        {title}
      </div>
      <div
        style={{
          flexDirection: column ? "column" : "row",
          justifyContent: column ? "flex-start" : "center",
        }}
        className={`relative flex gap-1 items-center p-2 w-full h-full`}
      >
        {props}
        {extendedProps && extendedProps}
      </div>
    </div>
  );
}
