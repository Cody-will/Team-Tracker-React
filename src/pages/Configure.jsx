import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Button from "../components/Button";
import ListPanel from "../components/ListPanel.tsx";
import { useConfigure } from "./context/configureContext.jsx";
import { primaryAccent } from "../colors.jsx";
import { useSafeSettings } from "./hooks/useSafeSettings.ts";


export default function Configure() {
  const [loading, setLoading] = useState(true);
  const { data, addPanel } = useConfigure();
  const [isPressed, setIsPressed] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [panelData, setPanelData] = useState(null);
  const {primaryAccent} = useSafeSettings();

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
    "border-2 border-zinc-800 w-full text-zinc-200 text-sm 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";

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
    <div className="h-full w-full flex p-2 2xl:p-4 justify-center items-center">
      <motion.div
        layout
        id="panel"
        style={{borderColor: `${primaryAccent}E6`}}
        className=" rounded-lg border text-zinc-200 font-semibold flex flex-col p-2 2xl:p-4 gap-4"
      >
        <div className="flex gap-2 2xl:gap-4 justify-center items-center w-full">
          <div className="flex w-full justify-start items-center text-2xl 2xl:text-3xl">
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
        <div className="flex max-w-screen max-h-[80vh] justify-evenly items-start gap-2 2xl:gap-4 flex-wrap overflow-x-scroll">
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
