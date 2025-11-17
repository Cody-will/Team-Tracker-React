import { useUser } from "../pages/context/UserContext";
import { motion } from "motion/react";
import React, { useRef } from "react";

export interface FileInputProps {
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  handlePreview: (file: File) => void;
  color?: string;
}

export default function FileInput({
  selectedFile,
  setSelectedFile,
  handlePreview,
  color,
}: FileInputProps) {
  const { userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;
  const fileRef = useRef<HTMLInputElement | null>(null);

  // This function handles opening the file input box when the button is pressed
  function handleClick(): void {
    fileRef.current?.click();
  }

  // This function handles when a background image is selcted from the file input
  type FileChange = React.ChangeEvent<HTMLInputElement>;
  function handleOnChange(event: FileChange) {
    const fileList = event.target.files?.[0];
    if (!fileList) return;

    setSelectedFile(fileList);
    handlePreview(fileList);
  }

  return (
    <div className="rounded-lg flex">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleOnChange(event)}
      />
      <motion.button
        className="text-center hover:cursor-pointer text-lg text-zinc-950 font-semibold px-3 py-2 rounded-l-lg"
        style={{ backgroundColor: primaryAccent }}
        whileHover={{ scale: 1.05 }}
        onClick={handleClick}
      >
        Browse...
      </motion.button>
      <input
        style={{ borderColor: color ? color : "#09090b" }}
        className="px-3 py-2 border-2 rounded-r-lg bg-zinc-900 text-zinc-200"
        value={selectedFile ? selectedFile.name : "No file selected"}
        placeholder={selectedFile ? selectedFile.name : "No file selected"}
        disabled
      />
    </div>
  );
}
