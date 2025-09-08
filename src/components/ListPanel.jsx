import Button from "./Button";
import { motion, AnimatePresence, Reorder } from "motion/react";
import ListItem from "./ListItem";
import { useState, useEffect } from "react";
import { useConfigure } from "../pages/context/configureContext";

// TODO:
//  Complete the function to reorder the items when dragged
//  Complete the function to remove the items from the database and list
//  Complete a function to sort through the items from the database and place them in the correct order
//  Complete the function to get the nextIndex when adding a new item
//  Finish writing the function for adding a new item to the list

/**
 *
 * @param {{inputStyle: String, name: String, listData: Object}} ListPanel
 * @returns
 */
export default function ListPanel({ inputStyle, name, listData }) {
  const [inputState, setInputState] = useState("");
  const [title, setTitle] = useState(undefined);
  const [items, setItems] = useState(null);
  const { addItem } = useConfigure();
  const [nextIndex, setNextIndex] = useState(10);

  useEffect(() => {
    if (!listData) return;
    listData.title && setTitle(listData.title);
    listData.items && setItems(listData.items);
  }, [listData]);

  /**
   *
   * @param {String} itemToRemove
   */
  function onRemove(itemToRemove) {
    // The code here will need to be able to remove the item from state
    // and the database or just let the item be removed from the database
    // and let the useEffect listening to the incoming data changes take
    // care of removing the item from state
  }

  function getNextIndex() {
    // a function to get the next index for te itemToAdd
    // needs to get the last index then add 10 to it
  }

  /**
   *
   * @param {Event} event
   * @param {String} itemToAdd
   */
  function onCreate(event, itemToAdd) {
    // This function needs to be updated to get the order number
    // and needs to be fixed to except the enter key being pressed
    // from the input
    if (event.type === "click" || event.type === "enter") {
      addItem(title, itemToAdd);
      setInputState("");
    }
  }

  /**
   *
   * @param {Event} event
   * @param {Function} setState
   */
  function handleChange(event, setState) {
    setState(event.target.value);
  }

  /**
   *
   * @param {Object} newOrder
   */
  function onReorder(newOrder) {
    // needs to reorder the items in the list and update them in the database
    // could possibly had a useEffect to listen to the items state and update
    // the database to the new state when the state changes, or a
    // useMemo so it doesnt bogg things down, and use debouce to wait on the reorder
    // in case the item gets dragged across multiple
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
        placeholder={`Create ${title}`}
        onKeyDown={(event) => onCreate(event, inputState)}
      />
      <Button
        text={`Create ${title}`}
        action={(event) => onCreate(event, inputState)}
        type="button"
      />
      {items && (
        <Reorder.Group
          as="ul"
          className="w-full flex flex-col gap-1 items-center justify-center mt-2 pt-2"
          values={items}
          onReorder={onReorder}
        >
          <AnimatePresence>
            {Object.entries(items).map(([id, item]) => (
              <ListItem key={id} data={item} action={onRemove} />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </motion.div>
  );
}
