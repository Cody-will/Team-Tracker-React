import { motion } from "motion/react";
import React, { useRef } from "react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import { useBreakpoint } from "../pages/hooks/useBreakpoint";

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
  const { primaryAccent, secondaryAccent } = useSafeSettings();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { twoXlUp } = useBreakpoint();

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
        className="text-center hover:cursor-pointer 2xl:text-lg text-sm text-zinc-950 font-semibold 2xl:px-3 2xl:py-2 px-1.5 py-1 2xl:rounded-l-lg rounded-l-md"
        style={{ backgroundColor: primaryAccent }}
        whileHover={{ scale: 1.05 }}
        onClick={handleClick}
      >
        Browse...
      </motion.button>
      <input
        style={{ borderColor: color ? color : "#09090b" }}
        className="2xl:px-3 2xl:py-2 px-1.5 py-1 border-2 2xl:rounded-r-lg rounded-r-md text-sm  bg-zinc-900 text-zinc-200"
        value={selectedFile ? selectedFile.name : "No file selected"}
        placeholder={selectedFile ? selectedFile.name : "No file selected"}
        disabled
      />
    </div>
  );
}
