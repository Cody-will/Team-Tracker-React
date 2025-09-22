import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import ToggleSwitch from "../components/ToggleSwitch.js";
import ColorPicker from "../components/ColorPicker.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useUser } from "./context/UserContext.tsx";
import { primaryAccentHex, secondaryAccentHex } from "../colors.jsx";

// TODO:
// Finish completing the UI for uploading and changing the users wallpaper
// Note: the user uploading a wallpaper should add it to a list of wallpapers for them, not replace existing
// Complete functions for uploading and changing the users wallpaper in the database under user settings
// Complete the function calling updateUserSettings

export default function Settings() {
  const [primaryColor, setPrimaryColor] = useState(primaryAccentHex);
  const [secondaryColor, setSecondaryColor] = useState(secondaryAccentHex);
  const [bgImage, setBgImage] = useState("");
  const [selectedPrimary, setSelectedPrimary] = useState("");
  const [selectedSecondary, setSelectedSecondary] = useState("");
  const { currentUser } = useAuth();
  const { updateUserSettings } = useUser();
  const inputStyle =
    "border-2 border-zinc-900 w-full  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  type UserSettings = {
    primaryAccent: string;
    secondaryAccent: string;
    bgImage: string;
  };

  function onColorChange(accent: "primary" | "secondary") {
    accent === "primary"
      ? setPrimaryColor(selectedPrimary)
      : setSecondaryColor(selectedSecondary);

    // This function will also need a database call to update the users color preference in users/uid/settings
  }

  async function updateSettings() {
    const uid = currentUser.uid;
    const settings: UserSettings = {
      primaryAccent: primaryColor,
      secondaryAccent: secondaryColor,
      bgImage,
    };
    updateUserSettings(uid, settings);
  }

  return (
    <motion.div className="h-full w-full flex items-center justify-center">
      <motion.div
        layout
        id="panel"
        className="bg-zinc-950/30 overflow-hidden flex flex-col gap-4 p-8 justify-center items-center border border-zinc-800 rounded-xl"
      >
        <div className="font-semibold text-zinc-200 text-3xl flex items-start justify-start w-full">
          Settings/Customization
        </div>
        <div className="flex gap-8 items-start justify-center">
          <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
            <div className="font-semibold text-2xl text-zinc-200">
              Primary Accent
            </div>
            <ColorPicker
              selectedColor={selectedPrimary}
              setSelectedColor={setSelectedPrimary}
            />
            <Button
              text="Choose Primary"
              type="button"
              color={primaryColor}
              action={() => {
                onColorChange("primary");
              }}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
            <div className="font-semibold text-2xl text-zinc-200">
              Secondary Accent
            </div>
            <ColorPicker
              selectedColor={selectedSecondary}
              setSelectedColor={setSelectedSecondary}
            />
            <Button
              text="Choose Secondary"
              type="button"
              color={secondaryColor}
              action={() => {
                onColorChange("secondary");
              }}
            />
          </div>
          <div className="flex flex-col gap-4 justify-center items-center border-2 border-zinc-900 rounded-xl p-4">
            <div className="font-semibold text-2xl text-zinc-200">
              Background Image
            </div>
            <img src={"../assets/background.svg"} className="" />
            <select className={inputStyle}>
              <option value="">Select Image</option>
            </select>
            <Button text="Upload" type="button" action={() => {}} />
          </div>
        </div>
        <Button text="Save Settings" type="button" action={() => {}} />
      </motion.div>
    </motion.div>
  );
}
