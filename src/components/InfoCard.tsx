import { useState, useEffect, FC } from "react";
import InfoItem from "./InfoItem";
import { useUser } from "../pages/context/UserContext";
import type { ScheduleEvent } from "../pages/context/ScheduleContext";

export interface InfoCardProps {
  title: string;
  props: any[];
  titleDate?: ScheduleEvent;
  column?: boolean;
  extendedProps?: any[];
}

export default function InfoCard({
  title,
  props,
  titleDate,
  column = true,
  extendedProps,
}: InfoCardProps) {
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;

  const startDate = titleDate && titleDate.start;
  const endDate = titleDate && titleDate.end;

  function getDates() {
    if (titleDate) return `${splitDate(startDate)} - ${splitDate(endDate)}`;
  }

  function splitDate(date: string | number | undefined) {
    if (typeof date !== "string") return;
    const sep = date.split("-");
    return `${sep[1]}/${sep[2]}/${sep[0]}`;
  }

  return (
    <div
      style={{ borderColor: secondaryAccent }}
      className="relative p-2 rounded-md flex flex-col justify-center border-2 items-center h-full w-full overflow-hidden bg-zinc-900 shadow-lg/30"
    >
      <div className="flex w-full items-center text-nowrap justify-start gap-2 text-lg font-bold text-zinc-200">
        {title}
        {titleDate && (
          <div className="flex items-center justify-end w-full font-medium">
            {getDates()}
          </div>
        )}
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
