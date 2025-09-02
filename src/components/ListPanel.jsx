import Button from "./Button";
import { motion, AnimatePresence, Reorder } from "motion/react";
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
    console.log(event.key);
    if (event) {
      if (event.key === "Enter") {
        setData((prev) => [...prev, itemToAdd]);
        setInputState("");
      } else if (event.type === "click") {
        setData((prev) => [...prev, itemToAdd]);
        setInputState("");
      } else {
        return;
      }
    }
  }

  function handleChange(event, setState) {
    setState(event.target.value);
  }

  return (
    <motion.div
      layout
      className="flex flex-col border border-zinc-700 rounded-lg gap-2 justify-start items-center p-4"
    >
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
      <Reorder.Group
        as="ul"
        className="w-full flex flex-col gap-1 items-center justify-center mt-2 pt-2"
        values={data}
        onReorder={setData}
      >
        <AnimatePresence>
          {data.map((itemData) => (
            <ListItem key={itemData} data={itemData} action={onRemove} />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </motion.div>
  );
}
