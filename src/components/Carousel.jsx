import InfoCard from "./InfoCard";
import { BsChevronCompactRight, BsChevronCompactLeft } from "react-icons/bs";
import { useState, useEffect } from "react";
import { getMandate } from "../teamSorting";
import { AnimatePresence, motion, wrap } from "motion/react";
import FrontCard from "./FrontCard";
import InfoItem from "./InfoItem";

export default function Carousel({ team }) {
  const [data, setData] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const itemsPerPage = 3;

  useEffect(() => {
    if (team) setData(Object.values(team));
  }, [team]);

  useEffect(() => {
    if (!data.length) return;

    const mandate = getMandate(data);
    const mandateCards = mandate.map((person) => (
      <FrontCard key={person.badgeNum} person={person} />
    ));

    const all = [
      {
        key: "mandate-cards",
        title: "Mandate",
        props: mandateCards,
        column: false,
      },
      { key: "extra-1", title: "Extra 1" },
      { key: "extra-2", title: "Extra 2" },
      { key: "extra-3", title: "Extra 3" },
      { key: "extra-4", title: "Extra 4" },
      { key: "extra-5", title: "Extra 5" },
      { key: "extra-6", title: "Extra 6" },
      { key: "extra-7", title: "Extra 7" },
      { key: "extra-8", title: "Extra 8" },
    ];

    setCardData(all);
  }, [data]);

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
    <div className="relative flex gap-2 justify-center items-center w-full h-full overflow-hidden">
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
                props={card.props}
                column={card.column}
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
    </div>
  );
}
