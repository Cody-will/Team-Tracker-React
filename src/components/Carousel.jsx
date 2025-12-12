import InfoCard from "./InfoCard";
import { BsChevronCompactRight, BsChevronCompactLeft } from "react-icons/bs";
import { useState, useEffect } from "react";
import { getMandate } from "../teamSorting";
import { AnimatePresence, motion, wrap } from "motion/react";
import FrontCard from "./FrontCard";
import InfoItem from "./InfoItem";
import { getAllNext30OfType, getAllRange } from "../helpers/schedulehelper";
import { useSchedule } from "../pages/context/ScheduleContext";
import { useBreakpoint } from "../pages/hooks/useBreakpoint";
import { useUser } from "../pages/context/UserContext";

export default function Carousel({ team }) {
  const [data, setData] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const { events, coverage } = useSchedule();
  const { lgUp, twoXlUp } = useBreakpoint();
  const { view } = useUser();

  const itemsPerPage = 3;

  useEffect(() => {
    if (team) setData(Object.values(team));
  }, [team]);

  useEffect(() => {
    if (!data.length) return;

    const mandate = getMandate(data);
    const mandateCards = mandate.map((person) => (
      <FrontCard
        key={person.badgeNum}
        person={person}
        noFlip
        noFade
        noBadge
        photoSize={16}
      />
    ));

    const medicalCards = Object.values(team)
      .filter((u) => u.medical)
      .map((user) => (
        <FrontCard
          key={`${user.badge}${user.uid}`}
          person={user}
          noFlip
          noFade
          noBadge
        />
      ));

    const vacation = getAllRange("Vacation", 30, events).map((e) => (
      <InfoItem key={e.id} event={e} />
    ));
    const training = getAllRange("Training", 30, events).map((e) => (
      <InfoItem key={e.id} event={e} />
    ));

    const range = getAllRange("Range", 30, events).map((e) => (
      <InfoItem key={e.id} event={e} />
    ));

    const cover = getAllRange("Coverage", 30, coverage).map((e) => (
      <InfoItem key={e.id} coverage={e} />
    ));

    const trainees = Object.values(team)
      .filter((u) => u.trainee)
      .map(
        (user) =>
          user.trainee && (
            <FrontCard key={user.uid} person={user} noFlip noFade noBadge />
          )
      );

    const jailSchool = Object.values(team)
      .filter((u) => u.jailSchool)
      .map(
        (user) =>
          user.jailSchool && (
            <FrontCard
              key={`${user.uid}-jailSchool`}
              person={user}
              noFlip
              noFade
              noBadge
            />
          )
      );

    const ftoCards = Object.values(team)
      .filter((u) => u.ftoList)
      .map(
        (user) =>
          user.ftoList && (
            <FrontCard
              key={`${user.uid}-ftoList`}
              person={user}
              noFlip
              noFade
              noBadge
            />
          )
      );

    const allUPD = [
      {
        key: "trainee-card",
        title: "Trainee's",
        filter: "Trainee",
        column: false,
        cardType: "Employee Card",
      },
      { key: "vacaton-card", title: "Vacation", props: vacation, column: true },
      { key: "cover-card", title: "Coverage", props: cover, column: true },
      {
        key: "medical-user",
        title: "Medical",
        column: false,
        cardType: "Employee Card",
        filter: "Medical",
      },

      {
        key: "training-card",
        title: "Training",
        props: training,
        column: true,
      },
    ];

    const allADC = [
      {
        key: "mandate-cards",
        title: "Mandate",
        column: false,
        cardType: "Employee Card",
        filter: "Mandate",
      },
      {
        key: "medical-user",
        title: "Medical",
        column: false,
        cardType: "Employee Card",
        filter: "Medical",
      },
      { key: "vacaton-card", title: "Vacation", props: vacation, column: true },
      {
        key: "training-card",
        title: "Training",
        props: training,
        column: true,
      },
      { key: "cover-card", title: "Coverage", props: cover, column: true },
      { key: "range-card", title: "Range", props: range, column: true },
      {
        key: "trainee-card",
        title: "Trainee's",
        column: false,
        cardType: "Employee Card",
        filter: "Trainee",
      },
      {
        key: "JailSchool-card",
        title: "Jail School",
        props: jailSchool,
        titleDate: events.find((e) => e.eventType === "Jail-School"),
        column: false,
        cardType: "Employee Card",
        filter: "Jail School",
      },
      {
        key: "ftoList-card",
        title: "FTO List",
        column: false,
        cardType: "Employee Card",
        filter: "FTO List",
      },
    ];

    const cards = view === "ADC" ? allADC : allUPD;

    setCardData(cards);
  }, [data, events, coverage, view]);

  const totalPages = Math.ceil(cardData.length / itemsPerPage);

  const paginate = (newDirection) => {
    const newPage = wrap(0, totalPages, page + newDirection);
    setDirection(newDirection);
    setPage(newPage);
  };

  const paginatedCards = cardData.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      position: "absolute",
    }),
  };

  return (
    <div className="relative flex lg:gap-2 justify-center items-center w-full h-full  overflow-hidden">
      {lgUp ? (
        <>
          <motion.button
            className="text-zinc-200 py-2 px-1"
            onClick={() => paginate(-1)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <BsChevronCompactLeft size="40" />
          </motion.button>

          <div className="relative w-full h-full flex justify-center items-center">
            <AnimatePresence custom={direction} mode="wait" initial={false}>
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="flex gap-2 w-full h-full justify-center items-center"
              >
                {paginatedCards.map((card) => (
                  <InfoCard
                    key={card.key}
                    title={card.title}
                    filter={card.filter ?? ""}
                    props={card.props}
                    titleDate={card.titleDate}
                    column={card.column}
                    cardType={card.cardType ?? "Schedule Card"}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.button
            className="text-zinc-200 py-2 px-1"
            onClick={() => paginate(1)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <BsChevronCompactRight size="40" />
          </motion.button>
        </>
      ) : (
        <motion.div className="w-full h-full flex flex-col gap-4">
          {cardData.map((card) => (
            <InfoCard
              key={card.key}
              title={card.title}
              props={card.props}
              filter={card.filter ?? ""}
              titleDate={card.titleDate}
              column={card.column}
              cardType={card.cardType ?? "Schedule Card"}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
