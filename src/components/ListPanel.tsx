import Button from "./Button";
import { motion, AnimatePresence, Reorder } from "motion/react";
import ListItem from "./ListItem";
import { useState, useEffect } from "react";
import { useConfigure } from "../pages/context/configureContext";
import { BsTrash } from "react-icons/bs";

export type Item = { title: string; order: number };

export type ListData = {
  title: string;
  items: Record<string, Item>;
};

export interface ListPanelProps {
  inputStyle: string;
  name: string;
  listData: ListData;
}

export default function ListPanel({
  inputStyle,
  name,
  listData,
}: ListPanelProps) {
  const [inputState, setInputState] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [items, setItems] = useState<ListItem[] | undefined>();
  const { addItem, updateList, removePanel, removeItem } = useConfigure();
  const noDelete = ["Shifts", "Ranks", "Divisions", "Role"];

  // This useEffect is what first gets and checks the data,
  // listens for when the data changes in the database,
  // and updates the item data accordingly.
  type ListItem = [id: string, title: string, order: number];
  useEffect(() => {
    if (!listData) return;
    setTitle(listData?.title ?? "");
    if (listData.items) {
      const listItems: ListItem[] = Object.entries(listData.items).map(
        ([key, item]) => [key, (item as Item).title, (item as Item).order]
      );
      setItems(sortList(listItems));
    }
  }, [listData]);

  // This function sorts the list before it gets stored in state
  // so when it goes to the ReorderGroup, it's already in order
  function sortList(items: ListItem[]): ListItem[] {
    return items.sort((a, b) => a[2] - b[2]);
  }

  // This function changes the order property of the data based on
  // the index it is in the list after the item has been dropped
  function changeOrder(listItems: ListItem[]): ListItem[] {
    const start: number = 10;
    const step: number = 10;
    return listItems.map(
      ([id, title], idx) => [id, title, start + idx * step] as ListItem
    );
  }

  // Gets the next index to add create the order number for the new item in the list
  function getNextIndex(): number {
    const orders = listData.items
      ? Object.values(listData.items).map((items) => items.order)
      : 0;
    return orders === 0 ? 0 : Math.max(...orders);
  }

  //This is the function to add the item to the list based on the button being pressed
  type ClickEvent = React.MouseEvent<HTMLButtonElement>;
  function onClickCreate(event: ClickEvent, itemToAdd: string): void {
    if (event.type === "click") {
      const order = getNextIndex() + 10;
      addItem(title, itemToAdd, order);
      setInputState("");
    }
  }

  // This is the function to add the item to the list based on the enter button being pressed
  type KeyEvent = React.KeyboardEvent<HTMLInputElement>;
  function onEnterCreate(event: KeyEvent, itemToAdd: string): void {
    if (event.key === "Enter") {
      const order = getNextIndex() + 10;
      addItem(title, itemToAdd, order);
      setInputState("");
    }
  }

  // This function handles updating the input box when the user types
  type SetState = React.Dispatch<React.SetStateAction<any>>;
  type TypeEvent = React.ChangeEvent<HTMLInputElement>;
  function handleChange(event: TypeEvent, setState: SetState) {
    setState(event.target.value);
  }

  // This function sets the state to the newOrder when the item
  // is dragged but not dropped
  function onReorder(newOrder: ListItem[]) {
    setItems(newOrder);
  }

  // This function handles writing the newly ordered list to the db
  // when the list item is dropped, and changes the state to the new items
  function afterReorder() {
    const newOrder = items ? changeOrder(items) : undefined;
    updateList(name, newOrder);
    setItems(newOrder);
  }

  // I think this one is self explanatory, it removes the panel.
  function onPanelRemove(): void {
    removePanel(name.replace(/ /g, "-"));
  }

  // Also another self explanatory, it removes the list item
  function onRemoveItem(itemIdToRemove: string): void {
    removeItem(name, itemIdToRemove);
  }

  return (
    <motion.div
      layout
      className="flex flex-col border border-zinc-700 rounded-md 2xl:rounded-lg gap-2 justify-start items-center p-2 2xl:p-4"
    >
      <div className="flex w-full text-md items-center justify-center">
        <div className="w-full"></div>
        <div className="w-full 2xl:text-xl text-nowrap flex items-center jusitfy-center ">
          <div className="w-full flex items-center justify-center">{title}</div>
        </div>
        <motion.div className="text-red-500 w-full text-xl 2xl:text-2xl flex items-center justify-end">
          {!noDelete.includes(title) && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => onPanelRemove()}
              className="hover:cursor-pointer text-red-500"
            >
              {<BsTrash />}
            </motion.div>
          )}
        </motion.div>
      </div>
      <input
        className={inputStyle}
        name={name}
        type="text"
        value={inputState}
        onChange={(event) => handleChange(event, setInputState)}
        placeholder={`Create ${title}`}
        onKeyDown={(event: KeyEvent) => onEnterCreate(event, inputState)}
      />
      <Button
        text={`Create ${title}`}
        action={(event: ClickEvent) => onClickCreate(event, inputState)}
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
            {items.map((item) => (
              <ListItem
                key={item[0]}
                data={item}
                onRemove={onRemoveItem}
                onDragEnd={afterReorder}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </motion.div>
  );
}
