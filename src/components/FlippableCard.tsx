import React from "react";
import { motion } from "motion/react";

interface FlippableCardProps {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  noFlip: boolean;
}

export default function FlippableCard({
  flipped,
  front,
  back,
  noFlip = false,
}: FlippableCardProps) {
  return (
    <motion.div
      className="relative h-full w-full transform-3d"
      animate={noFlip ? {} : { rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0 backface-hidden"
        style={{ rotateY: 0 }}
      >
        {front}
      </motion.div>

      <motion.div
        className="absolute inset-0 backface-hidden"
        style={{ rotateY: 180 }}
      >
        {back}
      </motion.div>
    </motion.div>
  );
}
