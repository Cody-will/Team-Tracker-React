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
import type { CardType } from "./CreateInfoCard";
import {useCard} from "../pages/context/CardContext.tsx"
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

export type SignupProp = {uid: string, firstName: string, lastName: string, badge: string};

export type SignUpProps = Record<string, SignupProp>;

export interface InfoCardProps {
  title: string;
  uid?: string;
  props?: React.ReactNode[];
  titleDate?: ScheduleEvent;
  extendedProps?: React.ReactNode[];
  eventType?: EventType;
  signUp?: boolean;
  signUpProps?: SignUpProps;
  range?: number;
  id?: string;
  filter?: Filter;
  isConfigure?: boolean;
  division: "ADC" | "UPD";
  order: number;
  
  cardType: CardType; // we'll use filter === "employee" for Employee cards
}

type UID = string;

/* -------------------------------------------------
 * Public component: decides which variant to render
 * ------------------------------------------------- */
export default function InfoCard(props: InfoCardProps) {
  const { signUp, eventType, range, cardType } = props;

  // 1. Sign-up variant
  if (cardType === "Event Signup Card") {
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
  isConfigure: boolean;
}

function CardFrame({
  id,
  title,
  titleDate,
  headerRight,
  children,
  isConfigure
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
      whileHover={isConfigure ? {scale: 1.05} : {}}
      transition={{ type: "tween", duration: isConfigure ? 0.1 :  0.3 }}
      style={{ borderColor: secondaryAccent }}
      className="relative 2xl:p-2 p-1 rounded-md flex flex-col items-stretch border-2 h-full w-full overflow-hidden bg-zinc-900/80 shadow-lg/30"
    >
      <div className="flex w-full  items-center text-nowrap justify-start lg:text-xs 2xl:gap-2 gap-1 2xl:text-lg 2xl:font-bold font-semibold text-sm text-zinc-200">
        <div className="w-full flex items-center justify-start">{title}</div>
        {titleDate && (
          <div className="flex items-center justify-end w-full font-medium">
            {getDates()}
          </div>
        )}
        {headerRight}
      </div>
      <div className="h-full flex w-full overflow-auto">{children}</div>
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
  isConfigure
}: InfoCardProps) {
  // Always column layout for basic cards
  return (
    <CardFrame id={id} title={title} titleDate={titleDate} isConfigure={isConfigure}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: ".25rem",
        }}
        className="relative p-2 w-full flex-1 overflow-y-scroll"
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
  id,
  filter,
  isConfigure
}: InfoCardProps) {
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


  const cards =
    filter &&
    !notFilterable.includes(filter) &&
    Object.values(users).map(
      (u) =>
        u[convert[filter]] && (
          <FrontCard key={u.uid} person={u} noBadge noFade noFlip />
        )
    );

  return (
    <CardFrame id={id} title={title} titleDate={titleDate} isConfigure={isConfigure}>
      <div className="relative w-full flex flex-1 flex-wrap gap-2 p-1">
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
  isConfigure
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
          key={(e as DayEvent).id}
          coverage={e as DayEvent}
        />
      ) : (
        <InfoItem
          key={(e as any).id}
          event={e as ScheduleEvent}
        />
      )
    );

    setEventItems(items);
  }, [eventType, range, events, isCoverage]);

  return (
    <CardFrame id={id} title={title} titleDate={titleDate} isConfigure={isConfigure}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: twoXlUp ? ".25rem" : ".12rem",
        }}
        className="relative p-2 flex flex-col items-center justify-start gap-[.12rem] 2xl:gap-[.25rem] w-full flex-1 overflow-auto"
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



function SignUpInfoCard({
  title,
  titleDate,
  signUpProps,
  id,
  isConfigure
}: InfoCardProps) {
  const { primaryAccent } = useSafeSettings();
  const { user, data: users } = useUser();
  const [signedUp, setSignedUp] = useState<SignUpProps>({});
  const [count, setCount] = useState(0);
  const {addSignup} = useCard();
 

  useEffect(() => {
    if (!signUpProps) {
      setSignedUp({});
      setCount(0);
      return;
    }
    
    
    setSignedUp(signUpProps);
    const total = Object.values(signUpProps).length;
    setCount(total);
  }, [signUpProps]);

  function handleClick() {
    if (!user) return;
    if (!id) return;
    if (checkIncluded()) return;
    addSignup(id);
  }

  function checkIncluded() {
    if (isConfigure) return true;
    if (!user) return false;
    const contains = Object.values(signedUp).some(u => u.uid === user.uid);
    return contains;
  }

  
  const sup = Object.values(signedUp).length > 0 ? Object.values(signedUp).map(u => <NameItem key={u.uid} {...u} />) : [];

  const headerRight = (
    <>
      <div>
        <div className="w-full text-sm">{`Signed Up: ${count}`}</div>
      </div>
      <div className="flex items-center w-full justify-center gap-2">
        <div className="w-full py-2" />
        <Button
          text="Sign Up"
          disabled={checkIncluded()}
          action={handleClick}
          color={checkIncluded() ? `${primaryAccent}90` : primaryAccent}
        />
      </div>
    </>
  );

  

  return (
    <CardFrame
      id={id}
      title={title}
      titleDate={titleDate}
      headerRight={headerRight}
      isConfigure={isConfigure}
    >
      <motion.div className="relative p-2 flex-1 w-full flex flex-wrap gap-2 overflow-auto">
        {sup}
      </motion.div>
    </CardFrame>
  );
}
