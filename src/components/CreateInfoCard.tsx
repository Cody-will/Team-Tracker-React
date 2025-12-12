import Button from "./Button.jsx";
import { motion, LayoutGroup, AnimatePresence } from "motion/react";
import InfoCard, { Filter, InfoCardProps } from "./InfoCard";
import { useUser } from "../pages/context/UserContext";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import type { SignupProp } from "./InfoCard";
import {
  DayEvent,
  EventType,
  ScheduleEvent,
  useSchedule,
} from "../pages/context/ScheduleContext";
import InfoItem from "./InfoItem";
import { useEffect, useMemo, useState } from "react";
import { useCard } from "../pages/context/CardContext.tsx";

type AllEvents = ScheduleEvent | DayEvent;
export type CardType = "Schedule Card" | "Employee Card" | "Event Signup Card";
interface TextDict {
  [key: string]: string;
}

const EVENT_TYPES_UI = [
  "Vacation",
  "Shift-Swap",
  "Training",
  "coverage",
] as const;

const FIX_TEXT: TextDict = {
  Vacation: "Vacation",
  "Shift-Swap": "Shift Swap",
  Training: "Training",
  coverage: "Coverage",
};

const CARD_OPTIONS: CardType[] = [
  "Schedule Card",
  "Employee Card",
  "Event Signup Card",
];

const FILTERABLE = [
  "OIC",
  "FTO",
  "Trainee",
  "PIT",
  "Rifle",
  "Mandate",
  "Mandated",
  "Jail School",
  "Special Roles",
  "Sick",
  "Medical",
  "FTO List",
];

const EXCLUDED = ["", "Select Card Type"];

export default function CreateInfoCard() {
  const [selectedCard, setSelected] = useState<CardType | "">("");
  const [title, setTitle] = useState("");
  const [range, setRange] = useState(15);
  const [eventType, setEventType] = useState<EventType | undefined>(undefined);
  const [filter, setFilter] = useState<Filter | "">("");
  const [selectOption, setOption] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  const { primaryAccent } = useSafeSettings();
  const { user, view } = useUser();
  const { info, addCard } = useCard();

  const options = CARD_OPTIONS;
  const baseId = "card-selector";
  const isSelected = options.includes(selectedCard as CardType);
  const hasSelection =
    isSelected && !EXCLUDED.includes(selectedCard as CardType);

  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 text-md 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_10px_2px_var(--accent)]";

  useEffect(() => {
    const id = requestAnimationFrame(() => setShowExamples(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!options.includes(selectedCard as CardType)) {
      setRange(15);
      setTitle("");
      setEventDate("");
      setEventType(undefined);
      setFilter("");
      setOption("");
    }
  }, [selectedCard, options]);

  function requirements(card: CardType | ""): boolean {
    switch (card) {
      case "Schedule Card":
        return !!title && !!eventType && range > 0;
      case "Employee Card":
        return !!title && !!filter;
      case "Event Signup Card":
        return !!title && !!selectOption;
      default:
        return false;
    }
  }

  function handleCreate() {
    if (!user || !view) return;
    if (!requirements(selectedCard)) return;
    if (!selectedCard) return;

    const division = user.Divisions;
    const order = info.length > 0 ? info[info.length - 1].order + 10 : 10;

    const scheduleCardProp: InfoCardProps = {
      title,
      cardType: "Schedule Card",
      range,
      eventType,
      division,
      order,
    };

    const employeeCardProp: InfoCardProps = {
      title,
      cardType: "Employee Card",
      filter,
      division,
      order,
    };

    const eventSignupProps: InfoCardProps = {
      title,
      cardType: "Event Signup Card",
      division,
      order,
    };

    const getValues: Record<CardType, InfoCardProps> = {
      "Schedule Card": scheduleCardProp,
      "Employee Card": employeeCardProp,
      "Event Signup Card": eventSignupProps,
    };

    addCard(getValues[selectedCard]);
    setSelected("");
  }

  return (
    <LayoutGroup id={baseId}>
      <motion.div className="text-zinc-200 flex flex-col w-full flex-1 items-center justify-center gap-2">
        <motion.div
          layout="position"
          transition={{ type: "tween", duration: 0.3 }}
          animate={
            !EXCLUDED.includes(selectedCard)
              ? { justifyContent: "center", alignItems: "center" }
              : {}
          }
          className="flex flex-col p-4 gap-3 w-full lg:w-1/3 h-full"
        >
          <motion.select
            layout="position"
            value={selectedCard}
            onChange={(e) => setSelected(e.target.value as CardType | "")}
            className={inputStyle}
          >
            <option value="">Select Card Type</option>
            {options.map((t, i) => (
              <option key={`${t}${i}`} value={t}>
                {t}
              </option>
            ))}
          </motion.select>

          {!EXCLUDED.includes(selectedCard) && (
            <input
              className={inputStyle}
              placeholder="Card Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}

          <AnimatePresence mode="wait">
            {selectedCard === "Schedule Card" && (
              <motion.div
                key="schedule-controls"
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-center gap-2"
              >
                <select
                  className={inputStyle}
                  value={eventType ?? ""}
                  onChange={(e) =>
                    setEventType(
                      e.target.value === ""
                        ? undefined
                        : (e.target.value as EventType)
                    )
                  }
                >
                  <option value="">Select Event Type</option>
                  {EVENT_TYPES_UI.map((e, i) => (
                    <option key={`${e}1${i}`} value={e}>
                      {FIX_TEXT[e]}
                    </option>
                  ))}
                </select>

                <select
                  className={inputStyle}
                  value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {selectedCard === "Employee Card" && (
              <motion.div
                key="employee-controls"
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-start justify-center gap-4"
              >
                <select
                  className={inputStyle}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as Filter)}
                >
                  <option value={""}>Select Filter</option>
                  {FILTERABLE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {selectedCard === "Event Signup Card" && (
              <motion.div
                key="signup-controls"
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-start justify-center gap-2"
              >
                <motion.select
                  layout="position"
                  value={selectOption}
                  onChange={(e) => setOption(e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Select Option</option>
                  <option value="withDate">Event Date</option>
                  <option value="count">Count of Total Signed Up</option>
                </motion.select>

                <AnimatePresence initial={false}>
                  {selectOption === "withDate" && (
                    <motion.input
                      key="event-date-input"
                      layout="position"
                      type="date"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={inputStyle}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout="position"
            animate={
              hasSelection
                ? {
                    height: "35%",
                    justifyContent: "center",
                    alignItems: "center",
                    flexGrow: 0,
                  }
                : { flexGrow: 1 }
            }
            transition={{ type: "tween", duration: 0.3 }}
            className="w-full flex"
          >
            <AnimatePresence mode="wait">
              {!hasSelection && (
                <motion.div
                  key="examples"
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full"
                >
                  {showExamples ? <ExampleCards baseId={baseId} /> : null}
                </motion.div>
              )}

              {hasSelection && (
                <motion.div
                  key="chosen"
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2 w-full h-full"
                >
                  <CreateChosen
                    id={baseId}
                    title={title}
                    eventType={eventType}
                    range={range}
                    cardType={selectedCard as CardType}
                    filter={filter as Filter}
                    order={0}
                    division={user?.Divisions}
                  />
                  <Button
                    text="Create Card"
                    action={() => handleCreate()}
                    disabled={!requirements(selectedCard)}
                    color={
                      requirements(selectedCard)
                        ? primaryAccent
                        : `${primaryAccent}90`
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

type TotalEvents = [
  { id: string; events: ScheduleEvent[] | DayEvent[]; color: string }
];

type ExampleProps = { baseId: string };

function ExampleCards({ baseId }: ExampleProps) {
  const { allEvents } = useSchedule();
  const { data, view } = useUser();

  const exampleProps = useMemo(() => {
    return Object.fromEntries(
      Object.entries(data)
        .slice(0, 13)
        .map(([key, val]) => [
          key,
          {
            uid: val.uid,
            firstName: val.firstName,
            lastName: val.lastName,
            badge: val.badge,
          } satisfies SignupProp,
        ])
    );
  }, [data]);

  const foundEvents = useMemo(() => {
    const included = ["vacation", "shift-swap", "training"];
    const list = (allEvents as TotalEvents) ?? ([] as unknown as TotalEvents);
    return (
      list.find((e) => included.includes(e.id) && e.events.length >= 5)
        ?.events ?? []
    );
  }, [allEvents]);

  const infoItems = useMemo(() => {
    const events = (foundEvents as ScheduleEvent[]) ?? [];
    return events.slice(0, 5).map((e) => {
      const key =
        (e as any).id ??
        `${(e as any).originUID ?? "o"}-${(e as any).start ?? ""}-${
          (e as any).end ?? ""
        }-${(e as any).eventType ?? ""}`;
      return <InfoItem key={key} event={e} />;
    });
  }, [foundEvents]);

  return (
    <motion.div className="flex flex-col gap-2 h-full w-full">
      <div className="w-full h-full">
        <InfoCard
          id={`${baseId}-employee`}
          title="Employee Card"
          filter="OIC"
          cardType="Employee Card"
          division={view ? view : "ADC"}
          order={10}
        />
      </div>

      <div className="w-full h-full">
        {foundEvents && (
          <InfoCard
            id={`${baseId}-schedule`}
            title="Date Card"
            props={infoItems}
            range={30}
            cardType="Schedule Card"
            order={10}
            division={view ? view : "ADC"}
          />
        )}
      </div>

      <div className="w-full h-full">
        <InfoCard
          id={`${baseId}-signup`}
          title={"Sign Up Card"}
          signUpProps={exampleProps}
          signUp={true}
          cardType="Event Signup Card"
          order={10}
          division={view ? view : "ADC"}
        />
      </div>
    </motion.div>
  );
}

interface CreateChosenProps extends InfoCardProps {
  cardType: CardType;
  filter: Filter;
}

function CreateChosen({
  title,
  props,
  signUpProps,
  id,
  eventType,
  cardType,
  range,
  filter,
}: CreateChosenProps) {
  function getCard() {
    if (cardType === "Employee Card") {
      return (
        <InfoCard
          id={`${id}-employee`}
          title={title || "Employee Card"}
          props={props}
          filter={filter}
          cardType="Employee Card"
        />
      );
    } else if (cardType === "Event Signup Card") {
      return (
        <InfoCard
          id={`${id}-signup`}
          title={title || "Event Signup Card"}
          signUp
          signUpProps={signUpProps}
          cardType="Event Signup Card"
        />
      );
    } else if (cardType === "Schedule Card") {
      return (
        <InfoCard
          id={`${id}-schedule`}
          title={title || "Schedule Card"}
          range={range ?? 0}
          eventType={eventType}
          cardType="Schedule Card"
        />
      );
    } else {
      return null;
    }
  }

  return (
    <motion.div layout="position" className="w-full h-full">
      {getCard()}
    </motion.div>
  );
}
