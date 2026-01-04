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
import {useCard} from "../pages/context/CardContext.tsx";


export default function Carousel({ team }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const { events, coverage } = useSchedule();
  const { lgUp, twoXlUp } = useBreakpoint();
  const {info: cards} = useCard();
  
  useEffect(() => {
    console.log("Carousel is mounting");
  }, [])

  const itemsPerPage = 3;
  
  const totalPages = Math.ceil(cards.length / itemsPerPage);

  const paginate = (newDirection) => {
    const newPage = wrap(0, totalPages, page + newDirection);
    setDirection(newDirection);
    setPage(newPage);
  };

  const paginatedCards = cards.slice(
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
                  <InfoCard key={card.key} {...card}/>
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
          {cards.map((card) => (
            <InfoCard key={card.key} {...card} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
