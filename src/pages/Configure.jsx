import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Button from "../components/Button";
import ListPanel from "../components/ListPanel.tsx";
import { useConfigure } from "./context/configureContext.jsx";

export default function Configure() {
  const [loading, setLoading] = useState(true);
  const { data, addPanel } = useConfigure();
  const [isPressed, setIsPressed] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [panelData, setPanelData] = useState(null);

  // Handles changing the input for the create new panel input
  const handleChange = (event, setState) => {
    setState(event.target.value);
  };

  // Initializes the state in the reducer function with data from the configure section of the database.
  useEffect(() => {
    data && setLoading(false);
    data && setPanelData(data);
  }, [data]);

  useEffect(() => {
    error != "" && console.error(error);
  }, [error]);

  // Styling for all inputs to keep consistent styling
  const inputStyle =
    "border-2 border-zinc-900  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  // Handles creating the new list panel by adding a new child under the configure section of the database
  const handleAddNew = async () => {
    if (!isPressed) return setIsPressed(true);
    const name = newTitle.trim();
    if (!name) return setIsPressed(false);
    try {
      setSaving(true);
      await addPanel(newTitle);
      setNewTitle("");
      setIsPressed(false);
    } catch (error) {
      setError(error.message || "Failed to Add");
    } finally {
      setSaving(false);
    }
  };

  const handleEnter = (event) => {
    event.key === "Enter" && handleAddNew();
  };

  return (
    <div className="h-full w-full flex p-4 justify-center items-center">
      <motion.div
        layout
        id="panel"
        className="bg-zinc-950/30 rounded-lg border border-zinc-800 text-zinc-200 font-semibold flex flex-col p-4 gap-4"
      >
        <div className="flex gap-4 justify-center items-center w-full">
          <div className="flex w-full justify-start items-center text-3xl">
            Configure
          </div>
          <div className="w-full flex justify-center items-center">
            <AnimatePresence>
              {isPressed && (
                <motion.input
                  layout
                  initial={{ width: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "tween" }}
                  className={inputStyle}
                  placeholder="Enter Title"
                  value={newTitle}
                  onKeyDown={(event) => handleEnter(event)}
                  onChange={(event) => handleChange(event, setNewTitle)}
                />
              )}
            </AnimatePresence>
          </div>
          <div className="w-full">
            <Button
              text={isPressed ? "Save Panel" : "Add New Panel"}
              action={handleAddNew}
              disabled={saving}
            />
          </div>
        </div>
        <div className="flex max-w-screen max-h-[80vh] justify-evenly items-start gap-4 flex-wrap overflow-x-scroll">
          {panelData &&
            Object.entries(panelData).map(([panelKey, panel]) => (
              <ListPanel
                key={panelKey}
                name={panel?.title ?? panelKey}
                listData={panel}
                inputStyle={inputStyle}
              />
            ))}
        </div>
      </motion.div>
    </div>
  );
}
