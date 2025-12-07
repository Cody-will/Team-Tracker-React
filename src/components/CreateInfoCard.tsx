import { motion, LayoutGroup } from "motion/react";
import InfoCard, { Filter, InfoCardProps } from "./InfoCard";
import { useUser } from "../pages/context/UserContext";
import FrontCard from "./FrontCard";
import {
  DayEvent,
  EventType,
  ScheduleEvent,
  useSchedule,
} from "../pages/context/ScheduleContext";
import InfoItem from "./InfoItem";
import { useState, useEffect } from "react";

type AllEvents = ScheduleEvent | DayEvent;
type CardType = "Schedule Card" | "Employee Card" | "Event Signup Card";
interface TextDict {
  [key: string]: string;
}

export default function CreateInfoCard() {
  const [selectedCard, setSelected] = useState<CardType | "">("");
  const [title, setTitle] = useState("");
  const [range, setRange] = useState(15);
  const [eventType, setEventType] = useState<EventType | undefined>(undefined);
  const [filter, setFilter] = useState("");
  const [selectOption, setoption] = useState("");
  const [eventDate, setEventDate] = useState("");
  const eventTypes = ["Vacation", "Shift-Swap", "Training", "coverage"];
  const filterable = [
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
    "Jail School",
  ];
  const fixText: TextDict = {
    Vacation: "Vacation",
    "Shift-Swap": "Shift Swap",
    Training: "Training",
    coverage: "Coverage",
  };
  const options: CardType[] = [
    "Schedule Card",
    "Employee Card",
    "Event Signup Card",
  ];
  const baseId = "card-selector";
  const exclude = ["", "Select Card Type"];
  const isSelected = options.includes(selectedCard as CardType);

  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 text-md 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_10px_2px_var(--accent)]";

  useEffect(() => {
    if (!options.includes(selectedCard as CardType)) {
      setRange(15);
      setTitle("");
      setEventDate("");
      setEventType(undefined);
      setFilter("");
      setoption("");
    }
  }, [selectedCard]);

  return (
    <LayoutGroup id={baseId}>
      <motion.div
        layout
        className="text-zinc-200 flex flex-col items-center justify-center gap-8 w-full h-dvh2 2xl:h-full lg:h-full"
      >
        <div className="text-2xl w-full pl-2 pt-2 font-semibold">
          Create Cards
        </div>

        <motion.div className="flex flex-col p-6 items-center gap-4 justify-center w-3/4 h-full">
          <motion.select
            value={selectedCard}
            onChange={(e) => setSelected(e.target.value as CardType | "")}
            className={inputStyle}
          >
            <option value="">Select Card Type</option>
            {options.map((title, i) => (
              <option key={`${title}${i}`} value={title}>
                {title}
              </option>
            ))}
          </motion.select>

          {selectedCard === "Schedule Card" && (
            <div className="w-full h-full flex items-center justify-center gap-4">
              <input
                className={inputStyle}
                placeholder="Card Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
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
                {eventTypes.map((e, i) => (
                  <option key={`${e}1${i}`} value={e}>
                    {fixText[e]}
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
            </div>
          )}
          {selectedCard === "Employee Card" && (
            <div className="w-full h-full flex items-center justify-center gap-4">
              <select
                className={inputStyle}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value={""}>Select Filter</option>
                {filterable.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedCard == "Event Signup Card" && (
            <motion.select
              value={selectOption}
              onChange={(e) => setoption(e.target.value)}
              className={inputStyle}
            >
              <option value="withDate">Event Date</option>
              <option value="count">Count of Total Signed Up</option>
            </motion.select>
          )}
          {selectOption === "withDate" && (
            <motion.input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputStyle}
            />
          )}

          {/* Cards area */}
          <motion.div className="w-full h-full">
            {!isSelected && <ExampleCards baseId={baseId} />}
            {isSelected && !exclude.includes(selectedCard) && (
              <CreateChosen
                id={baseId}
                title={title}
                eventType={eventType}
                range={range}
                cardType={selectedCard as CardType}
                filter={filter as Filter}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

/* ------------------------ Example cards ------------------------ */

type TotalEvents = [
  { id: string; events: ScheduleEvent[] | DayEvent[]; color: string }
];

function getEventsForExample(events: TotalEvents, include: string[]) {
  if (!events) return;
  return (
    events.find((e) => include.includes(e.id) && e.events.length >= 5)
      ?.events ?? []
  );
}

type ExampleProps = { baseId: string };

function ExampleCards({ baseId }: ExampleProps) {
  const { events, allEvents } = useSchedule();
  const { user, data } = useUser();
  const included = ["vacation", "shift-swap", "training"];

  const cardProps: InfoCardProps = {
    title: "Event Name",
    signUpProps: Object.values(data)
      .slice(0, 13)
      .map((u) => u.uid),
    signUp: true,
    cardType: "Employee Card",
  };

  const foundEvents = getEventsForExample(
    allEvents as TotalEvents,
    included
  ) as ScheduleEvent[];

  const infoItems =
    foundEvents
      ?.slice(0, 5)
      .map((e) => <InfoItem key={e.originUID} event={e} />) ?? [];

  return (
    <motion.div layout className="grid grid-rows-3 gap-4 h-full w-full">
      {/* Employee example */}
      <div className="w-full h-full">
        <InfoCard
          id={`${baseId}-employee`}
          title="Employee Card"
          props={user ? [<FrontCard person={user} noFade noFlip />] : []}
          cardType="Employee Card"
        />
      </div>

      {/* Schedule example */}
      <div className="w-full h-full">
        {foundEvents && (
          <InfoCard
            id={`${baseId}-schedule`}
            title="Date Card"
            props={infoItems}
            range={30}
            cardType="Schedule Card"
          />
        )}
      </div>

      {/* Signup example */}
      <div className="w-full h-full">
        <InfoCard
          id={`${baseId}-signup`}
          title={cardProps.title}
          signUpProps={cardProps.signUpProps}
          signUp={cardProps.signUp}
          cardType="Sign Up Card"
        />
      </div>
    </motion.div>
  );
}

/* ------------------------ Chosen card ------------------------ */

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
  const { user } = useUser();
  const { events } = useSchedule();

  const eventTypes = ["vacation", "shift-swap", "training", "coverage"];

  function getEvents() {
    if (!user) return;
    if (typeof eventType !== "string") return;
    if (!eventTypes.includes(eventType)) return;
    return events.filter((e) => e.eventType === eventType);
  }

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
          cardType="Sign Up Card"
        />
      );
    } else if (cardType === "Schedule Card") {
      return (
        <InfoCard
          id={`${id}-schedule`}
          title={title || "Schedule Card"}
          column
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
    <motion.div layout className="w-full h-full">
      {getCard()}
    </motion.div>
  );
}
