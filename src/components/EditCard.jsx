import Button from "./Button";
import ToggleSwitch from "./ToggleSwitch";
import { motion } from "motion/react";
import { BsXLg, BsPersonCircle } from "react-icons/bs";
import { primaryAccentHex, secondaryAccentHex, primaryAccent } from "../colors";
import { useState, useRef, useEffect } from "react";

export default function EditCard({
  person,
  selectedPerson,
  setSelectedPerson,
  photo,
  setPhoto,
  isOic,
  setIsOic,
  isFto,
  setIsFto,
  isTrainee,
  setIsTrainee,
  mandate,
  setMandate,
}) {
  const shifts = [
    "Alpha",
    "Bravo",
    "Charlie",
    "Delta",
    `Split: Alpha, Bravo`,
    "Split: Charlie Delta",
    "Unassigned",
  ];

  const fullRanks = {
    maj: "Major",
    lt: "Lieutenant",
    sgt: "Sergeant",
    cpl: "Corporal",
    dep: "Deputy",
    train: "Trainee",
  };

  const containerStyle =
    "relative flex flex-col shrink gap-1 items-start justify-center";
  const formStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";
  // ✅ stable layoutId string
  const layoutKey = `person-${person.badgeNum}`;

  return (
    <motion.div
      layoutId={layoutKey}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "tween" }}
      className="absolute inset-0 bg-zinc-900 text-zinc-200 font-semibold p-4 rounded-md flex justify-start items-start text-left text-sm"
    >
      <motion.button
        whileHover={{ scale: 1.2 }}
        onClick={() => setSelectedPerson(null)}
        className="absolute h-12 w-12 flex items-center justify-center font-bold top-1 right-1 hover:cursor-pointer"
      >
        {<BsXLg size="38" />}
      </motion.button>
      <div className="flex shrink h-full w-2/10 flex-col justify-center items-center gap-2">
        <div className="h-full w-full flex"></div>
        <div
          style={{ borderColor: primaryAccentHex }}
          className={`relative flex shrink items-center justify-center size-40 aspect-square rounded-full border-4`}
        >
          <div className="relative flex shrink items-center justify-center w-full h-full">
            {photo ? (
              <img src={photo} size="160" />
            ) : (
              <BsPersonCircle size="160" />
            )}
          </div>
        </div>
        <span className="flex shrink items-center font-semibold text-zinc-200 text-lg justify-center">
          {person.firstName} {person.lastName}
        </span>
        <UploadButton onFile={photo} photo={photo} setPhoto={setPhoto} />
        <div className="h-full w-full flex items-end gap-4 justify-center">
          <Button text="Save" action={() => {}} />
          <Button text="Deactivate" action={() => {}} />
        </div>
      </div>

      <motion.form
        layout
        className="grid grid-cols-2 gap-4 p-4 auto-rows-min place-content-center items-center justify-center w-1/2 h-full"
      >
        <div className={containerStyle}>
          <label className="text-xl">First Name</label>
          <input
            name="firstName"
            value={person.firstName}
            className={formStyle}
          />
        </div>
        <div className={containerStyle}>
          <label className="text-xl">Last Name</label>
          <input
            name="lastName"
            value={person.lastName}
            className={formStyle}
          />
        </div>
        <div className={containerStyle}>
          <label className="text-xl">Badge Number</label>
          <input
            name="badgeNum"
            value={person.badgeNum}
            className={formStyle}
          />
        </div>
        <div className={containerStyle}>
          <label className="text-xl">Shift</label>
          <select name="shift" value={person.shift} className={formStyle}>
            {shifts.map((shift, index) => (
              <option key={index} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </div>
        <div className={containerStyle}>
          <label className="text-xl">Rank</label>
          <select
            name="rank"
            value={fullRanks[person.rank]}
            className={formStyle}
          >
            {Object.entries(fullRanks).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className={containerStyle}>
          <label className="text-xl">Email</label>
          <input
            name="email"
            value={`${person.firstName[0]}${person.lastName}@pickensgasheriff.com`}
            className={formStyle}
          />
        </div>

        <div className={containerStyle}>
          <label className="text-xl">Division</label>
          <select
            name="division"
            value={person.divison || "ADC"}
            className={formStyle}
          ></select>
        </div>
        <div className="relative flex items-center justify-between gap-2">
          <div className="relative flex flex-col gap-2 items-center justify-center">
            <label className="text-xl">OIC</label>
            <ToggleSwitch state={isOic} setState={setIsOic} />
          </div>
          <div className="relative flex flex-col gap-2 items-center justify-center">
            <label className="text-xl">FTO</label>
            <ToggleSwitch state={isFto} setState={setIsFto} />
          </div>
          <div className="relative flex flex-col gap-2 items-center justify-center">
            <label className="text-xl">Mandate</label>
            <ToggleSwitch state={mandate} setState={setMandate} />
          </div>
          <div className="relative flex flex-col gap-2 items-center justify-center">
            <label className="text-xl">Trainee</label>
            <ToggleSwitch state={isTrainee} setState={setIsTrainee} />
          </div>
        </div>
        {isTrainee && (
          <motion.div
            layout
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={containerStyle}
          >
            <label className="text-xl">Trainer</label>
            <select
              name="trainer"
              value={person.trainer || "Select Trainer"}
              className={formStyle}
            ></select>
          </motion.div>
        )}
        {isTrainee && (
          <motion.div layout className={containerStyle}>
            <label className="text-xl">Phase</label>
            <select
              name="phase"
              value={person.phase || "Select Phase"}
              className={formStyle}
            >
              <option value="">Select Phase</option>
              <option value="phase1">Phase 1</option>
              <option value="phase2">Phase 2</option>
            </select>
          </motion.div>
        )}
      </motion.form>
      <div className="w-1/2 h-full relative flex flex-col gap-4">
        <InfoPanel title="Shift Swap / Coverage" />
        <InfoPanel title="Vacation" />
        <InfoPanel title="Training" />
      </div>
    </motion.div>
  );
}

const UploadButton = ({ onFile, photo, setPhoto, label = "Upload" }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (photo instanceof File) {
      const url = URL.createObjectURL(photo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [photo]);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto?.(file);
    onFile?.(file);

    e.target.value = "";
  };

  const getDisplayName = () => {
    if (!photo) return "";
    if (photo instanceof File) return photo.name;

    try {
      const path = new URL(photo).pathname;
      return decodeURIComponent(path.split("/").pop() || "photo");
    } catch {
      return String(photo);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        className={`relative flex justify-center shadow-lg/50 items-center bg-${primaryAccent} py-2 px-3 rounded-md text-md font-semibold text-zinc-900 hover:cursor-pointer`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => inputRef.current?.click()}
        aria-label="Upload photo"
      >
        {label}
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />

      {photo && (
        <div
          className="w-full text-sm border border-zinc-600 rounded-md py-2 px-3 text-zinc-600 truncate"
          title={getDisplayName()}
        >
          {getDisplayName()}
        </div>
      )}

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected preview"
          className={`h-24 w-24 rounded-full object-cover border-2 border-${primaryAccent}`}
        />
      )}
    </div>
  );
};

const InfoPanel = ({ title, props }) => {
  return (
    <div className="relative p-2 flex h-full w-15/16 rounded-lg border border-zinc-800 shadow-lg/40">
      <div className="text-xl">{title}</div>
    </div>
  );
};
