import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import ToggleSwitch from "../components/ToggleSwitch.jsx";
import ColorPicker from "../components/ColorPicker.jsx";
import Button from "../components/Button.jsx";

export default function Settings() {
  const [color, setColor] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [state, setState] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const changeColor = () => {
    setColor(selectedColor);
  };

  const openColor = () => {
    setIsVisible(!isVisible);
  };

  return (
    <motion.div className="h-full w-full flex items-center justify-center">
      <motion.div
        layout
        id="panel"
        className="bg-zinc-950/50 overflow-hidden flex flex-col gap-4 p-4 justify-center items-center border border-zinc-700 rounded-xl"
      >
        {isVisible && (
          <ColorPicker
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        )}
        <Button
          text={isVisible ? "Change Color" : "Open Colors"}
          action={isVisible ? changeColor : openColor}
          color={color}
        />
      </motion.div>
    </motion.div>
  );
}
