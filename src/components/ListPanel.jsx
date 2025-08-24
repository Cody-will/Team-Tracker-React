import Button from "./Button";
import { motion, AnimatePresence } from "motion/react";
import ListItem from "./ListItem";

export default function ListPanel({
  title,
  inputStyle,
  name,
  inputState,
  setInputState,
  buttonText,
  placeHolder,
  data,
  setData,
}) {
  function onRemove(itemToRemove) {
    setData((prev) => prev.filter((item) => item !== itemToRemove));
  }

  function onCreate(event, itemToAdd) {
    if (event) {
      if (event.key !== "Enter") {
        return;
      } else {
        setData((prev) => [...prev, itemToAdd]);
        setInputState("");
      }
    }
    setData((prev) => [...prev, itemToAdd]);
    setInputState("");
  }

  function handleChange(event, setState) {
    setState(event.target.value);
  }

  return (
    <div className="flex flex-col border border-zinc-700 rounded-lg gap-2 justify-center items-center p-4">
      <div className="text-xl">{title}</div>
      <input
        className={inputStyle}
        name={name}
        type="text"
        value={inputState}
        onChange={(event) => handleChange(event, setInputState)}
        placeHolder={placeHolder}
        onKeyDown={(event) => onCreate(event, inputState)}
      />
      <Button
        text={buttonText}
        action={(event) => onCreate(event, inputState)}
        type="button"
      />
      <motion.ul
        layout
        className="w-full flex flex-col gap-1 items-center justify-center mt-2 pt-2"
      >
        <AnimatePresence mode="sync" initial={false}>
          {data.map((itemData, index) => (
            <ListItem key={index} data={itemData} action={onRemove} />
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
