import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import ToggleSwitch from "../components/ToggleSwitch.js";
import ColorPicker from "../components/ColorPicker.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useUser } from "./context/UserContext.tsx";
import { backgroundOptions } from "../colors.jsx";
import type { UploadTaskSnapshot } from "firebase/storage";
import FileInput from "../components/FileInput.tsx";
import ProgressBar from "../components/ProgressBar.tsx";
import { DataSnapshot } from "firebase/database";
// TODO:
// Finish completing the UI for uploading and changing the users wallpaper
// Note: the user uploading a wallpaper should add it to a list of wallpapers for them, not replace existing
// Complete functions for uploading and changing the users wallpaper in the database under user settings
// Complete the function calling updateUserSettings
// Section around line 150 needs to have the userSettings.primaryAccent section set up for the file input file:bg-color

type UserBackground = {
  name: string;
  src: string;
  path: string;
  uploadedAt: number;
};

type UserSettings = {
  primaryAccent: string;
  secondaryAccent: string;
  bgImage: string;
  backgrounds?: Record<string, UserBackground> | UserBackground;
};

export default function Settings() {
  const {
    updateUserSettings,
    user,
    userSettings,
    uploadPhoto,
    updateUserBackground,
  } = useUser();
  const { currentUser } = useAuth();
  const {
    primaryAccent,
    secondaryAccent,
    bgImage: backgroundImage,
  } = userSettings;
  const [isClicked, setIsClicked] = useState(false); // <- Used for switching to upload view on wallpaper options
  const [selectedPrimary, setSelectedPrimary] = useState(""); // <- Used for storing the new primary color
  const [selectedSecondary, setSelectedSecondary] = useState(""); // <- Used for storing the new secondary color
  const [userBackgrounds, setUserBackgrounds] = useState(); // <- Used for storing the users uploaded backgrounds
  const [primaryColor, setPrimaryColor] = useState(primaryAccent);
  const [secondaryColor, setSecondaryColor] = useState(secondaryAccent);
  const [bgImage, setBgImage] = useState(backgroundImage); // <- Used to display the users current background and store new chosen one
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // <- Used to store the photo being uploaded
  const [uploadPreview, setUploadPreview] = useState<string>(); // <- Used for storing the preview of the uploading image
  const [progress, setProgress] = useState(0);
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  const inputStyle =
    "border-2 border-zinc-900 w-full  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  function onColorChange(accent: "primary" | "secondary") {
    accent === "primary"
      ? setPrimaryColor(selectedPrimary)
      : setSecondaryColor(selectedSecondary);
  }

  // This function will update the users settings in the database under users/uid/settings
  async function updateSettings() {
    const uid = currentUser.uid;
    const settings: UserSettings = {
      primaryAccent: primaryColor,
      secondaryAccent: secondaryColor,
      bgImage: bgImage,
    };
    updateUserSettings(uid, settings);
  }

  console.log(userSettings.backgrounds);

  // This function creates the preview for the uploading image
  function createPreview(file: File): void {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(file);
    setUploadPreview(objectUrl);
  }

  function updateProgress(snapshot: UploadTaskSnapshot): void {
    setProgress(
      Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
    );
  }

  async function handleUpload() {
    if (!isClicked) {
      setIsClicked(true);
    } else {
      const name = nicknameRef.current?.value
        ? nicknameRef.current.value
        : currentUser.uid;
      const uid = currentUser.uid;
      if (!selectedFile) return;
      const { src, path } = await uploadPhoto({
        uid,
        file: selectedFile,
        name,
        type: "backgrounds",
        handleProgress: updateProgress,
      });
      const complete = await updateUserBackground({
        uid,
        type: "backgrounds",
        name,
        src,
        path,
      });
      if (complete) {
        setIsClicked(false);
        setProgress(0);
        setSelectedFile(null);
        setUploadPreview("");
      }
    }
  }

  type DropDownEvent = React.ChangeEvent<HTMLSelectElement>;
  function handleDropDown(event: DropDownEvent) {
    const value = event.target.value;
    if (value === "Select Image") return;
    setBgImage(value);
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
          <motion.div
            layout
            className="flex flex-col gap-4 justify-center items-center border-2 border-zinc-900 rounded-xl p-4"
          >
            <div className="font-semibold text-2xl text-zinc-200">
              Background Image
            </div>
            {!isClicked && (
              <>
                <img src={bgImage} className="max-w-68 bg-white rounded-md" />
                <select
                  className={inputStyle}
                  onChange={(event) => handleDropDown(event)}
                >
                  <option value={bgImage}>Select Image</option>
                  {Object.entries(backgroundOptions).map(
                    ([index, background]) => (
                      <option key={index} value={background.src}>
                        {background.name}
                      </option>
                    )
                  )}
                  {userSettings.backgrounds &&
                    Object.entries(userSettings.backgrounds).map(
                      ([index, bg]) => (
                        <option key={index} value={bg.src}>
                          {bg.name}
                        </option>
                      )
                    )}
                </select>
              </>
            )}
            {isClicked && (
              <>
                <div className="max-w-64">
                  {uploadPreview && <img src={uploadPreview} />}
                </div>
                <FileInput
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  handlePreview={createPreview}
                />
                <input
                  placeholder="Enter a nickname for the photo"
                  ref={nicknameRef}
                  className={inputStyle}
                />
              </>
            )}
            {progress > 0 && (
              <ProgressBar progress={progress} accent={primaryAccent} />
            )}
            <Button
              text={isClicked ? "Upload" : "Add Image"}
              type="button"
              action={handleUpload}
            />
          </motion.div>
        </div>
        <Button text="Save Settings" type="button" action={updateSettings} />
      </motion.div>
    </motion.div>
  );
}
