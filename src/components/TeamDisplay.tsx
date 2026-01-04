import FrontCard from "./FrontCard.tsx";
import Shifts from "./Shifts";
import { useEffect, useState, useRef } from "react";
import { onValue, ref, update } from "firebase/database";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useConfigure } from "../pages/context/configureContext";
import type { User, UserRecord } from "../pages/context/UserContext";
import {
  DndContext,
  useSensor,
  useSensors,
  DragStartEvent,
  PointerSensor,
} from "@dnd-kit/core";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { useUser } from "../pages/context/UserContext";
import PopUp, { ToggleProps, type PopUpProps } from "./PopUp.tsx";
import { useBreakpoint } from "../pages/hooks/useBreakpoint.ts";

export interface TeamDisplayProps {
  team: UserRecord;
}

export interface ConfigItem {
  order: number;
  title: string;
}

export interface ConfigCategory {
  title: string;
  items: Record<string, ConfigItem>;
}

export interface ConfigureData {
  [categoryName: string]: ConfigCategory;
}

export type TempParent = { uid: string; shift: string; container: string };

export default function TeamDisplay({ team }: TeamDisplayProps) {
  const { data: configData } = useConfigure();
  const { data: users, updateAfterDrag } = useUser();
  const shifts = ["Alpha", "Bravo", "Charlie", "Delta"];
  const [dragging, setDragging] = useState(false);
  const [didDrag, setDrag] = useState(false);
  const [notify, setNotify] = useState<PopUpProps | null>(null);
  const [temp, setTemp] = useState<TempParent | null>(null);
  const [rankChoice, setRankChoice] = useState<"oic" | "sgt" | null>(null);
  const rankChoiceRef = useRef<"oic" | "sgt" | null>(null);
  const { lgUp, twoXlUp } = useBreakpoint();
  const toggles: ToggleProps = [
    {
      title: "Sergeant",
      state: rankChoice === "sgt",
      setState: (next) => {
        setRankChoice(next ? "sgt" : null);
      },
    },
    {
      title: "OIC",
      state: rankChoice === "oic",
      setState: (next) => {
        setRankChoice(next ? "oic" : null);
      },
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  useEffect(() => {
    rankChoiceRef.current = rankChoice;
  }, [rankChoice]);

  function closePopUp(result: boolean, tempData: TempParent) {
    const oic = rankChoiceRef.current === "oic";
    const sgt = rankChoiceRef.current === "sgt";

    if (!result) {
      console.log("negative result is firing");
      setTemp(null);
      setRankChoice(null);
      setNotify(null);

      return;
    }

    if (oic) {
      console.log("running oic");
      updateAfterDrag(tempData.uid, "oic", true);
      updateAfterDrag(tempData.uid, "Shifts", tempData.shift);
      setTemp(null);
      setRankChoice(null);
      setNotify(null);

      return;
    }
    if (sgt) {
      updateAfterDrag(tempData.uid, "Ranks", "Sergeant");
      updateAfterDrag(tempData.uid, "Shifts", tempData.shift);
      setTemp(null);
      setRankChoice(null);
      setNotify(null);

      return;
    }
    console.log("This is firing");
    setTemp(null);
    setRankChoice(null);
    setNotify(null);

    return;
  }

  function createPopUp(tempData: TempParent) {
    setTemp(tempData);
    setNotify({
      title: "Oops!",
      message:
        "This container is for Sergeants and OIC only, select which you would like the employee to be, or press cancel if it was an accident.",
      onClose: (result) => closePopUp(result, tempData),
      isConfirm: true,
      trueText: "Confirm",
      falseText: "Cancel",
      location: "top-center",
    });
  }

  async function handleDrop(event: DragEndEvent) {
    const { over, active } = event;
    if (!over) return;
    const user = users[active.id];
    const uid = active.id.toString();
    const shift = over.id.toString().split("-")[0];
    const isSuper = over.id.toString().split("-")[1] === "super";
    const container = over.id.toString().split("-")[1];
    if (user.Shifts != over.id && !isSuper) {
      if (user.Ranks != "Sergeant" && !user.oic) {
        await updateAfterDrag(uid, "Shifts", shift);
      }
      if (user.Ranks === "Sergeant" || user.oic) {
        setTemp({ uid, shift, container });
        await updateAfterDrag(uid, "Shifts", shift);
        await updateAfterDrag(uid, "oic", false);
        await updateAfterDrag(uid, "Ranks", "Deputy");
        setTemp(null);
      }
    }
    if (user.Shifts != over.id && isSuper) {
      if (user.Ranks !== "Sergeant" && !user.oic) {
        const tempData: TempParent = { uid, shift, container };
        createPopUp(tempData);
      }
      if (user.Ranks === "Sergeant" || user.oic) {
        await updateAfterDrag(uid, "Shifts", shift);
      }
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setDragging(true);
    setDrag(true);
  }

  async function handleDragEnd(event: DragEndEvent) {
    await handleDrop(event);
    setDragging(false);

    setTimeout(() => setDrag(false), 0);
  }

  
  const commandStaff = configData
    ? Object.values(team)
        .filter(
          (user) =>
            user.Shifts === "Command Staff" || user.Ranks === "Sheriff"
        )
        .sort(
          (a, b) => getOrder(a.Ranks, configData) - getOrder(b.Ranks, configData)
        )
        .map((user) => (
          <FrontCard
            key={user.uid}
            person={user}
            didDrag={didDrag}
            currShift={user.Shifts}
          />
        ))
    : [];

  function getOrder(rank: string, data: ConfigureData): number {
    const ranks = data.Ranks.items;
    const order = Object.values(ranks).filter((ranks) => ranks.title === rank);
    return order[0].order;
  }
  

  useEffect(() => {
    console.log("Team Display is mounting");
  }, []) 

  return (
    <motion.div className="relative lg:h-full w-full min-h-screen lg:min-h-0 2xl:min-h-0 flex-1 gap-2 lg:gap-2 flex flex-col">
      <AnimatePresence>
        {notify && (
          <PopUp
            title={notify.title}
            message={notify.message}
            onClose={notify.onClose}
            trueText={notify.trueText}
            falseText={notify.falseText}
            location={notify.location}
            isConfirm={notify.isConfirm}
            toggle={toggles}
          />
        )}
      </AnimatePresence>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          id="CommandStaff"
          className="w-full lg:h-1/5 2xl:h-1/6 flex lg:flex-row flex-wrap lg:no-wrap 2xl:gap-2 gap-2"
        >   
         {commandStaff.length > 0 && commandStaff} 
        </motion.div>

        <motion.div
          id="Shifts"
          className="flex-1 w-full max-w-full 2xl:gap-2 overflow-y-auto lg:overflow-visible  2xl:overflow-visible gap-2 lg:gap-1 flex lg:flex-row 2xl:flex-row flex-col"
        >
          {team &&
            configData &&
            shifts.map((shift) => (
              <Shifts
                key={shift}
                shift={shift}
                team={team}
                id={shift}
                temp={temp}
                didDrag={didDrag}
              />
            ))}
        </motion.div>
      </DndContext>
    </motion.div>
  );
}
