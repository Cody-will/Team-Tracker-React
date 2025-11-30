import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useState, useRef } from "react";
import ColorPicker from "../components/ColorPicker.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useUser } from "./context/UserContext.tsx";
import { backgroundOptions } from "../colors.jsx";
import type { UploadTaskSnapshot } from "firebase/storage";
import FileInput from "../components/FileInput.tsx";
import ProgressBar from "../components/ProgressBar.tsx";
import { BsArrowRight } from "react-icons/bs";
import { useSafeSettings } from "./hooks/useSafeSettings.ts";

export type Location =
  | "primaryAccent"
  | "secondaryAccent"
  | "bgImage"
  | "vacationAccent"
  | "swapAccent"
  | "coverageAccent"
  | "trainingAccent";

export default function Settings() {
  const { updateUserSettings, user, uploadPhoto, updateUserBackground } =
    useUser();
  const { currentUser } = useAuth();
  const {
    primaryAccent,
    secondaryAccent,
    bgImage: backgroundImage,
    vacationAccent,
    swapAccent,
    trainingAccent,
    coverageAccent,
    backgrounds,
  } = useSafeSettings();
  const [isClicked, setIsClicked] = useState(false); // <- Used for switching to upload view on wallpaper options
  const [selectedPrimary, setSelectedPrimary] = useState(primaryAccent); // <- Used for storing the new primary color
  const [selectedSecondary, setSelectedSecondary] = useState(secondaryAccent); // <- Used for storing the new secondary color
  const [bgImage, setBgImage] = useState(backgroundImage); // <- Used to display the users current background and store new chosen one
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // <- Used to store the photo being uploaded
  const [uploadPreview, setUploadPreview] = useState<string | null>(null); // <- Used for storing the preview of the uploading image
  const [progress, setProgress] = useState(0);
  const [selectedVacation, setSelectedVacation] = useState(vacationAccent);
  const [selectedSwap, setSelectedSwap] = useState(swapAccent);
  const [selectedTraining, setSelectedTraining] = useState(trainingAccent);
  const [selectedCoverage, setSelectedCoverage] = useState(coverageAccent);
  const [next, setnext] = useState(false);
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  const id = "settingsLayout";
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 text-sm 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";

  // This function will update the users settings in the database under users/uid/settings
  async function updateSettings(location: Location, value: string) {
    const uid = currentUser.uid;
    updateUserSettings(uid, location, value);
  }

  // This function creates the preview for the uploading image
  function createPreview(file: File): void {
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
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
        if (uploadPreview) URL.revokeObjectURL(uploadPreview);
        setUploadPreview(null);
        setBgImage(src);
        updateSettings("bgImage", src);
      }
    }
  }

  // This function handles the back button if the user decides not to upload an image
  function handleBack(): void {
    setIsClicked(false);
    setSelectedFile(null);
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
  }

  type DropDownEvent = React.ChangeEvent<HTMLSelectElement>;
  function handleDropDown(event: DropDownEvent) {
    const value = event.target.value;
    if (value === "Select Image") return;
    setBgImage(value);
    updateSettings("bgImage", value);
  }

  return (
    <motion.div className="h-full w-full flex items-center justify-center">
      <LayoutGroup id={id}>
        <motion.div
          layout
          id="panel"
          className="bg-zinc-950/30 overflow-hidden flex flex-col gap-2 2xl:gap-4 p-4 2xl:p-8 justify-center items-center border border-zinc-800 rounded-xl"
        >
          <div className="flex w-full">
            <div className="font-semibold text-zinc-200 text-lg 2xl:text-3xl flex items-start justify-start w-full">
              Settings/Customization
            </div>
            <div className="flex justify-between items-between text-zinc-200 font-medium 2xl:font-semibold">
              <motion.div
                animate={{ rotate: next ? -180 : 0 }}
                transition={{ duration: 0.3, type: "tween" }}
                whileHover={{ scale: 1.2 }}
                onClick={() => setnext((prev) => !prev)}
                className="hover:cursor-pointer"
              >
                <BsArrowRight size={40} />
              </motion.div>
            </div>
          </div>
          <div className="flex gap-8 items-start justify-center">
            <AnimatePresence initial={false} mode="wait">
              {!next && (
                <motion.div
                  key="first"
                  layoutId={id}
                  initial={{ x: next ? 1200 : -1200, filter: "blur(15px)" }}
                  animate={{ x: 0, filter: "none" }}
                  exit={{ x: next ? 1200 : -1200, filter: "blur(15px)" }}
                  transition={{ duration: 0.3, type: "tween" }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
                    <div className="font-semibold text-lg 2xl:text-2xl text-zinc-200">
                      Primary Accent
                    </div>
                    <ColorPicker
                      selectedColor={selectedPrimary}
                      setSelectedColor={setSelectedPrimary}
                    />
                    <Button
                      text="Choose Primary"
                      type="button"
                      color={primaryAccent}
                      action={() => {
                        updateSettings("primaryAccent", selectedPrimary);
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
                    <div className="font-semibold text-lg 2xl:text-2xl text-zinc-200">
                      Secondary Accent
                    </div>
                    <ColorPicker
                      selectedColor={selectedSecondary}
                      setSelectedColor={setSelectedSecondary}
                    />
                    <Button
                      text="Choose Secondary"
                      type="button"
                      color={secondaryAccent}
                      action={() => {
                        updateSettings("secondaryAccent", selectedSecondary);
                      }}
                    />
                  </div>

                  <motion.div
                    layout
                    className="flex flex-col gap-4 justify-center items-center border-2 border-zinc-900 rounded-xl p-4"
                  >
                    <div className="font-semibold text-lg 2xl:text-2xl text-zinc-200">
                      Background Image
                    </div>
                    <AnimatePresence>
                      {!isClicked && (
                        <motion.div className="flex flex-col justify-center items-center gap-4">
                          <img
                            src={bgImage}
                            style={{
                              borderWidth: "4px",
                              borderColor: secondaryAccent,
                            }}
                            className="max-w-68 bg-white rounded-md"
                          />
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
                            {backgrounds &&
                              Object.entries(backgrounds).map(([index, bg]) => (
                                <option key={index} value={bg.src}>
                                  {bg.name}
                                </option>
                              ))}
                          </select>
                        </motion.div>
                      )}
                      {isClicked && (
                        <motion.div
                          initial={{ x: 100 }}
                          animate={{ x: 0 }}
                          exit={{ x: -100 }}
                          className="flex flex-col items-center justify-center gap-4"
                        >
                          <div className="w-64">
                            {uploadPreview ? (
                              <img src={uploadPreview} />
                            ) : (
                              <div className="w-full border border-zinc-950 text-zinc-200 text-center h-32 flex items-center justify-center rounded-lg">
                                No image selected
                              </div>
                            )}
                          </div>
                          <FileInput
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            handlePreview={createPreview}
                          />
                          <input
                            placeholder="Enter a nickname for the photo"
                            ref={nicknameRef}
                            style={{}}
                            className={inputStyle}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {progress > 0 && (
                      <ProgressBar
                        progress={progress}
                        accent={secondaryAccent}
                      />
                    )}
                    <Button
                      text={isClicked ? "Upload" : "Add Image"}
                      type="button"
                      action={handleUpload}
                    />
                    {isClicked && (
                      <Button text="Back" type="button" action={handleBack} />
                    )}
                  </motion.div>
                </motion.div>
              )}
              {next && (
                <motion.div
                  key="second"
                  layoutId={id}
                  initial={{ x: next ? 1200 : -1200, filter: "blur(15px)" }}
                  animate={{ x: 0, filter: "none" }}
                  exit={{ x: next ? 1200 : -1200, filter: "blur(15px)" }}
                  transition={{ duration: 0.3, type: "tween" }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
                    <div className="font-semibold text-lg 2xl:text-2xl text-zinc-200">
                      Vacation Color
                    </div>
                    <ColorPicker
                      selectedColor={selectedVacation}
                      setSelectedColor={setSelectedVacation}
                    />
                    <Button
                      text="Choose Vacation"
                      type="button"
                      color={vacationAccent}
                      action={() => {
                        updateSettings("vacationAccent", selectedVacation);
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
                    <div className="font-semibold text-lg 2xl:text-2xl text-zinc-200">
                      Training Accent
                    </div>
                    <ColorPicker
                      selectedColor={selectedTraining}
                      setSelectedColor={setSelectedTraining}
                    />
                    <Button
                      text="Choose Training"
                      type="button"
                      color={trainingAccent}
                      action={() => {
                        updateSettings("trainingAccent", selectedTraining);
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
                    <div className="font-semibold text-lg 2xl:text-2xl text-zinc-200">
                      Swap Color
                    </div>
                    <ColorPicker
                      selectedColor={selectedSwap}
                      setSelectedColor={setSelectedSwap}
                    />
                    <Button
                      text="Choose Swap"
                      type="button"
                      color={swapAccent}
                      action={() => {
                        updateSettings("swapAccent", selectedSwap);
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4 border-2 border-zinc-900 rounded-xl p-4">
                    <div className="font-semibold text-lg 2xl:text-2xl text-zinc-200">
                      Coverage Color
                    </div>
                    <ColorPicker
                      selectedColor={selectedCoverage}
                      setSelectedColor={setSelectedCoverage}
                    />
                    <Button
                      text="Choose Coverage"
                      type="button"
                      color={coverageAccent}
                      action={() => {
                        updateSettings("coverageAccent", selectedCoverage);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </LayoutGroup>
    </motion.div>
  );
}
