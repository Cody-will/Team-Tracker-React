
// src/components/OrganizeCard.tsx
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragCancelEvent,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";
import { BsTrash } from "react-icons/bs";

import InfoCard, { InfoCardProps } from "./InfoCard";
import { useCard } from "../pages/context/CardContext";

export default function OrganizeCard() {
  const { info, deleteCard, reorderCard } = useCard(); // InfoCardProps[]
  const [cards, setCards] = useState<InfoCardProps[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<InfoCardProps | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // keep local state in sync with context
  useEffect(() => {
    const sorted = [...info].sort((a, b) => a.order - b.order);
    setCards(sorted);
  }, [info]);

  const ids = cards
    .map((c) => c.uid)
    .filter((id): id is string => typeof id === "string");

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);

    const found = cards.find((c) => c.uid === id) ?? null;
    setActiveCard(found);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId((event.over?.id as string) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);
    setOverId(null);

    if (!over) return;

    // 🔴 Dropped on trash can
    if (over.id === "trash") {
      setCards((prev) => prev.filter((c) => c.uid !== active.id));
      deleteCard(active.id as string);
      return;
    }

    // Normal reordering
    if (active.id === over.id) return;

    setCards((prev) => {
      const oldIndex = prev.findIndex((c) => c.uid === active.id);
      const newIndex = prev.findIndex((c) => c.uid === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(prev, oldIndex, newIndex).map((card, i) => ({
        ...card,
        order: (i + 1) * 10,
      }));
      
      reorderCard(reordered); 
      return reordered;
    });
  }

  function handleDragCancel(_event: DragCancelEvent) {
    setActiveId(null);
    setActiveCard(null);
    setOverId(null);
  }

  return (
    <div className="h-full overflow-hidden overscroll-none flex-col flex w-full">
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="w-full max-w-xl flex-1  mx-auto justify-center flex flex-col">
            {cards.map((card, index) =>
              card.uid ? (
                <SortableStackCard
                  key={card.uid}
                  card={card}
                  index={index}
                  total={cards.length}
                  isGhost={activeId === card.uid}
                />
              ) : null
            )}
          </div>
        </SortableContext>

        {/* 🔴 Trash drop zone at the bottom */}
        <TrashDropZone isActive={!!activeId} isOver={overId === "trash"} />

        {/* 🧊 Drag overlay – floating card that follows the cursor */}
        <DragOverlay>
          {activeCard ? (
            <motion.div
              initial={{ scale: 0.98, opacity: 0.95 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0.9 }}
              className="rounded-md mx-auto justify-center w-full max-w-xl bg-zinc-900 shadow-2xl ring-4 ring-emerald-400/70 h-3/10"
            >
              <InfoCard isConfigure={true} {...activeCard} />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface SortableStackCardProps {
  card: InfoCardProps;
  index: number;
  total: number;
  isGhost: boolean;
}

function SortableStackCard({
  card,
  index,
  total,
  isGhost,
}: SortableStackCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.uid! });

  // simple depth: first = back, last = front
  const baseZ = index * 10;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? baseZ + 5 : baseZ,
  } as React.CSSProperties;

  // negative margin stacks them (your -mt-45)
  const stackOffsetClass = index === 0 ? "" : "-mt-35";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${stackOffsetClass} rounded-md cursor-grab h-[33%] bg-zinc-900 active:cursor-grabbing ${
        isDragging
          ? "shadow-2xl ring-3 ring-emerald-400/80 bg-zinc-950/90"
          : "shadow-md"
      } ${isGhost ? "opacity-0 pointer-events-none" : ""}`}
      {...attributes}
      {...listeners}
    >
      {/* top shadow for separation */}
      {index !== 0 && (
        <div
          className="absolute top-0 left-0 w-full h-4 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0))",
          }}
        />
      )}

      {/* order badge */}
      <div className="absolute top-0 right-0 translate-x-[125%] z-20 font-semibold text-[1rem] px-1.5 py-0.5 rounded-full text-zinc-200">
        {index + 1}
      </div>

      <InfoCard isConfigure={true} {...card} />
    </div>
  );
}

/* ---------------- Trash drop zone ---------------- */

function TrashDropZone({
  isActive,
  isOver,
}: {
  isActive: boolean;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: "trash",
  });

  const hot = isOver;

  return (
    <div className="h-1/10 w-full flex justify-center">
      <motion.div
        ref={setNodeRef}
        initial={false}
        animate={{
          scale: hot ? 1.05 : 1,
          boxShadow: hot
            ? "0 0 30px rgba(248, 113, 113, 0.6)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        className={`flex h-20 w-20 shadow-2xl/40 items-center justify-center rounded-xl border-2 transition-colors duration-150
        ${
          hot
            ? "bg-red-600/25 border-red-400"
            : "bg-red-950/40 border-red-500/70"
        }`}
      >
        <BsTrash
          size={28}
          className={hot ? "text-red-200" : "text-red-500"}
        />
      </motion.div>
    </div>
  );
}

