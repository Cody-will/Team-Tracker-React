
import { motion, AnimatePresence } from "motion/react";
import { useSafeSettings } from "./hooks/useSafeSettings";
import { BsArrowLeft } from "react-icons/bs";
import { useState, lazy, Suspense } from "react";

const loadOrganizeCard = () => import("../components/OrganizeCard.tsx");
const loadCreateInfoCard = () => import("../components/CreateInfoCard.tsx");

const OrganizeCard = lazy(loadOrganizeCard);
const CreateInfoCard = lazy(loadCreateInfoCard);

export default function CardConfigure() {
  const { primaryAccent } = useSafeSettings();
  const [page, setPage] = useState(0);
  const isStart = page === 0;

  const preloadCreate = () => void loadCreateInfoCard();
  const preloadOrganize = () => void loadOrganizeCard();

  return (
    <motion.div className="lg:h-full h-screen min-h-screen 2xl:h-dvh w-full lg:p-4 p-2 flex">
      <motion.div
        id="panel"
        style={{ borderColor: `${primaryAccent}E6` }}
        className=" border-zinc-800 flex-col  bg-zinc-950/50 w-full flex-1 overflow-scroll lg:overflow-hidden lg:overscroll-none flex p-1 lg:p-2 rounded-lg"
      >
        <motion.div className="flex items-center gap-4">
          <motion.div style={{ opacity: isStart ? 0 : 1 }} className="flex w-full items-center gap-4 ">
            <motion.div
              onMouseEnter={preloadCreate}
              onFocus={preloadCreate}
              onClick={() => setPage(0)}
              whileHover={{ scale: 1.1 }}
              className="hover:cursor-pointer"
            >
              <BsArrowLeft size={48} />
            </motion.div>
            <motion.div className="text-zinc-200 text-lg font-semibold">Create Cards</motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isStart ? (
              <motion.div
                key="create-title"
                className="text-xl font-semibold w-full flex justify-center items-center text-zinc-200"
                initial={{ x: "-100%", filter: "blur(15px)" }}
                animate={{ x: 0, filter: "none" }}
                exit={{ x: "-100%", filter: "blur(15px)" }}
              >
                Create Cards
              </motion.div>
            ) : (
              <motion.div
                key="organize-title"
                className=" text-xl font-semibold w-full flex justify-center items-center text-zinc-200"
                initial={{ x: "100%", filter: "blue(15px)" }}
                animate={{ x: 0, filter: "none" }}
                exit={{ x: "100%", filter: "blur(15px)" }}
              >
                Organize Cards
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div style={{ opacity: !isStart ? 0 : 1 }} className="flex w-full justify-end items-center gap-4 ">
            <motion.div className="text-zinc-200 text-lg font-semibold">{"Organize Card"}</motion.div>
            <motion.div
              onMouseEnter={preloadOrganize}
              onFocus={preloadOrganize}
              onClick={() => setPage(1)}
              style={{ rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              className="hover:cursor-pointer"
            >
              <BsArrowLeft size={48} />
            </motion.div>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {page === 0 ? (
            <motion.div
              key="create-page"
              initial={{ x: "-100%", filter: "blur(15px)" }}
              animate={{ x: 0, filter: "none" }}
              exit={{ x: "-100%", filter: "blur(15px)" }}
              className="w-full flex-1"
              onMouseEnter={preloadCreate}
            >
              <Suspense fallback={false}>
                <CreateInfoCard />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="organize-page"
              initial={{ x: "100%", filter: "blur(15px)" }}
              animate={{ x: 0, filter: "none" }}
              exit={{ x: "100%", filter: "blur(15px)" }}
              className="w-full flex-1"
              onMouseEnter={preloadOrganize}
            >
              <Suspense fallback={false}>
                <OrganizeCard />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

