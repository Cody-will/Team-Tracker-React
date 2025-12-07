import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import type { DayEvent, ScheduleEvent } from "../pages/context/ScheduleContext";
import { useBreakpoint } from "../pages/hooks/useBreakpoint";
import type { EventType } from "../pages/context/ScheduleContext";
import { getAllRange } from "../helpers/schedulehelper";
import { useState, useEffect } from "react";
import InfoItem from "./InfoItem";
import { useSchedule } from "../pages/context/ScheduleContext";
import Button from "./Button";
import { useUser } from "../pages/context/UserContext";
import { motion } from "motion/react";
import NameItem from "./NameItem";
import FrontCard from "./FrontCard";

export type Filter =
  | "oic"
  | "fto"
  | "mandate"
  | "isMandated"
  | "ftoList"
  | "jailSchool"
  | "SpecialRoles"
  | "sick"
  | "medical"
  | "pit"
  | "speed"
  | "rifle";

export interface InfoCardProps {
  title: string;
  uid?: string;
  props?: React.ReactNode[];
  titleDate?: ScheduleEvent;
  column?: boolean; // kept for backwards compat, but not needed for most variants now
  extendedProps?: React.ReactNode[];
  eventType?: EventType;
  signUp?: boolean;
  signUpProps?: UID[];
  range?: number;
  id?: string;
  filter?: Filter;
  cardType: string; // we'll use filter === "employee" for Employee cards
}

type UID = string;

/* -------------------------------------------------
 * Public component: decides which variant to render
 * ------------------------------------------------- */
export default function InfoCard(props: InfoCardProps) {
  const { signUp, eventType, range, cardType } = props;
  console.log(cardType);

  // 1. Sign-up variant
  if (cardType === "Sign Up Card") {
    return <SignUpInfoCard {...props} />;
  }

  // 2. Schedule variant (has eventType + range)
  if (
    cardType === "Schedule Card" &&
    eventType &&
    range !== undefined &&
    range !== null
  ) {
    return <ScheduleInfoCard {...props} />;
  }

  // 3. Employee card variant
  if (cardType === "Employee Card") {
    return <EmployeeInfoCard {...props} />;
  }

  // 4. Basic variant (simple column layout)
  return <BasicInfoCard {...props} />;
}

/* -----------------------------------------
 * Shared frame: title, border, header, etc.
 * ----------------------------------------- */

interface CardFrameProps {
  id?: string;
  title: string;
  titleDate?: ScheduleEvent;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

function CardFrame({
  id,
  title,
  titleDate,
  headerRight,
  children,
}: CardFrameProps) {
  const { secondaryAccent } = useSafeSettings();

  function splitDate(date: string | number | undefined) {
    if (typeof date !== "string") return;
    const sep = date.split("-");
    return `${sep[1]}/${sep[2]}/${sep[0]}`;
  }

  function getDates() {
    if (!titleDate) return "";
    const start = titleDate.start;
    const end = titleDate.end;
    return `${splitDate(start)} - ${splitDate(end)}`;
  }

  return (
    <motion.div
      layoutId={id}
      transition={{ type: "tween", duration: 0.3 }}
      style={{ borderColor: secondaryAccent }}
      className="relative 2xl:p-2 p-1 rounded-md flex flex-col items-stretch border-2 h-full w-full overflow-hidden bg-zinc-900 shadow-lg/30"
    >
      <div className="flex w-full items-center text-nowrap justify-start 2xl:gap-2 gap-1 2xl:text-lg 2xl:font-bold font-semibold text-sm text-zinc-200">
        <div className="w-full flex items-center justify-start">{title}</div>
        {titleDate && (
          <div className="flex items-center justify-end w-full font-medium">
            {getDates()}
          </div>
        )}
        {headerRight}
      </div>

      {children}
    </motion.div>
  );
}

/* -----------------------------------------
 * Variant 1: Basic card
 * → simple vertical (column) layout
 * ----------------------------------------- */

function BasicInfoCard({
  title,
  titleDate,
  props,
  extendedProps,
  id,
}: InfoCardProps) {
  // Always column layout for basic cards
  return (
    <CardFrame id={id} title={title} titleDate={titleDate}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: ".25rem",
          overflow: "auto",
        }}
        className="relative p-2 w-full flex-1"
      >
        {props && props}
        {extendedProps && extendedProps}
      </div>
    </CardFrame>
  );
}

/* -----------------------------------------
 * Variant 1.5: Employee card
 * → the one that uses row / grid layout logic
 * ----------------------------------------- */

function EmployeeInfoCard({
  title,
  titleDate,
  props,
  extendedProps,
  id,
  filter,
}: InfoCardProps) {
  const { twoXlUp } = useBreakpoint();
  const { data: users } = useUser();
  const notFilterable = ["", "Select Filter"];
  const filterable = [
    "OIC",
    "FTO",
    "Trainee",
    "PIT",
    "Rifle",
    "Mandate",
    "Madated",
    "Jail School",
    "Special Roles",
    "Sick",
    "Medical",
    "FTO List",
  ];
  const convert = {
    OIC: "oic",
    FTO: "fto",
    Trainee: "trainee",
    PIT: "pit",
    Rifle: "rifle",
    Mandate: "mandate",
    Mandated: "isMandated",
    "Jail School": "jailSchool",
    "Special Roles": "SpecialRoles",
    Sick: "sick",
    Medical: "medical",
    "FTO List": "ftoList",
  };

  const newFilter = filter && filterable.includes(filter) && convert[filter];

  const cards =
    filter &&
    !notFilterable.includes(filter) &&
    Object.values(users).map(
      (u) =>
        u[convert[filter]] && (
          <FrontCard key={u.uid} person={u} noBadge noFade noFlip />
        )
    );

  function getLayout(): React.CSSProperties {
    if (cards && cards.length > 2) {
      // Grid layout when there are lots of items
      return {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        placeItems: "center",
        gap: twoXlUp ? ".5rem" : ".25rem",
      };
    }
    // Row layout for 1–2 items
    return {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: twoXlUp ? ".5rem" : ".25rem",
    };
  }

  return (
    <CardFrame id={id} title={title} titleDate={titleDate}>
      <div
        style={{ ...getLayout(), overflow: "hidden" }}
        className="relative p-2 w-full flex-1"
      >
        {cards && cards}
      </div>
    </CardFrame>
  );
}

/* -----------------------------------------
 * Variant 2: Schedule card (event list by range + type)
 * → always column layout
 * ----------------------------------------- */

function ScheduleInfoCard({
  title,
  titleDate,
  eventType,
  range,
  id,
}: InfoCardProps) {
  const { twoXlUp } = useBreakpoint();
  const { events } = useSchedule();
  const [eventItems, setEventItems] = useState<React.ReactNode[]>([]);

  const isCoverage = eventType === "Coverage";

  useEffect(() => {
    if (!eventType || !events || range == null) {
      setEventItems([]);
      return;
    }

    const result = getAllRange(eventType, range, events) ?? [];
    const items = result.map((e) =>
      isCoverage ? (
        <InfoItem
          key={(e as DayEvent).id ?? (e as any).originUID}
          coverage={e as DayEvent}
        />
      ) : (
        <InfoItem
          key={(e as ScheduleEvent).originUID ?? (e as any).id}
          event={e as ScheduleEvent}
        />
      )
    );

    setEventItems(items);
  }, [eventType, range, events, isCoverage]);

  return (
    <CardFrame id={id} title={title} titleDate={titleDate}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: twoXlUp ? ".25rem" : ".12rem",
          overflow: "auto",
        }}
        className="relative p-2 w-full flex-1"
      >
        {eventItems}
      </div>
    </CardFrame>
  );
}

/* -----------------------------------------
 * Variant 3: Sign-up card (names + count + button)
 * → custom flex-wrap layout for NameItems
 * ----------------------------------------- */

interface SignUpInfoCardProps extends InfoCardProps {
  signUpProps?: UID[];
}

function SignUpInfoCard({
  title,
  titleDate,
  signUpProps,
  id,
}: SignUpInfoCardProps) {
  const { primaryAccent } = useSafeSettings();
  const { user, data: users } = useUser();
  const [signedUp, setSignedUp] = useState<UID[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!signUpProps) {
      setSignedUp([]);
      setCount(0);
      return;
    }
    setSignedUp(signUpProps);
    setCount(signUpProps.length);
  }, [signUpProps]);

  useEffect(() => {
    setCount(signedUp.length);
  }, [signedUp]);

  function handleClick() {
    if (!user) return;
    if (signedUp.includes(user.uid)) return;
    setSignedUp((prev) => [...prev, user.uid]);
  }

  function checkIncluded() {
    if (!user) return false;
    return signedUp.includes(user.uid);
  }

  const headerRight = (
    <>
      <div>
        <div className="w-full text-sm">{`Signed Up: ${count}`}</div>
      </div>
      <div className="flex items-center w-full justify-center gap-2">
        <div className="w-full" />
        <Button
          text="Sign Up"
          disabled={checkIncluded()}
          action={handleClick}
          color={checkIncluded() ? `${primaryAccent}90` : primaryAccent}
        />
      </div>
    </>
  );

  const sup =
    signedUp && users
      ? signedUp.map((u) => <NameItem key={u} user={users[u]} />)
      : [];

  return (
    <CardFrame
      id={id}
      title={title}
      titleDate={titleDate}
      headerRight={headerRight}
    >
      <motion.div className="relative p-2 flex-1 w-full flex flex-wrap content-start gap-2 overflow-auto">
        {sup}
      </motion.div>
    </CardFrame>
  );
}
