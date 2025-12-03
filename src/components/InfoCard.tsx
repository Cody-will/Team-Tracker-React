import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import type { ScheduleEvent } from "../pages/context/ScheduleContext";
import { useBreakpoint } from "../pages/hooks/useBreakpoint";

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
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const { twoXlUp } = useBreakpoint();

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

  function getLayout(): React.CSSProperties {
    if (column) {
      return {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: twoXlUp ? ".25rem" : ".12rem",
      };
    }
    if (props.length > 2) {
      return {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        placeItems: "center",
        gap: twoXlUp ? ".5rem" : ".25rem",
      };
    }
    return {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: twoXlUp ? ".5rem" : ".25rem",
    };
  }

  return (
    <div
      style={{ borderColor: secondaryAccent }}
      className="relative 2xl:p-2 p-1 rounded-md flex flex-col justify-center border-2 items-center h-full w-full overflow-hidden bg-zinc-900 shadow-lg/30"
    >
      <div className="flex w-full items-center text-nowrap justify-start 2xl:gap-2 gap-1 2xl:text-lg 2xl:font-bold font-semibold text-sm text-zinc-200">
        {title}
        {titleDate && (
          <div className="flex items-center justify-end w-full font-medium">
            {getDates()}
          </div>
        )}
      </div>
      <div
        style={{ ...getLayout(), overflow: column ? "auto" : "hidden" }}
        className={`relative p-2 w-full  h-full`}
      >
        {props}
        {extendedProps && extendedProps}
      </div>
    </div>
  );
}
