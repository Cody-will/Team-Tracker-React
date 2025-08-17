import { BsPersonCircle, BsXLg } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileBadge } from "./ProfileBadge";

import {
  findSupervisors,
  findUpperSupervisors,
  getShift,
  getUnassigned,
} from "../teamSorting";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { onValue, ref, set } from "firebase/database";
import { primaryAccent, secondaryAccent } from "../colors.js";

export default function TeamManagement() {
  const [data, setData] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Alpha");
  const tabs = ["Alpha", "Bravo", "Charlie", "Delta", "Unassigned"];
  const [shift, setShift] = useState([]);
  const [shiftSuper, setShiftSuper] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    const teamData = ref(db, "team");

    const unsubscribe = onValue(
      teamData,
      (snapshot) => {
        setData(snapshot.exists() ? Object.values(snapshot.val()) : null);
        console.log(snapshot.exists());
      },
      (error) => {
        console.log(error);
      }
    );

    return () => unsubscribe();
  }, []);

  const sortTeam = useEffect(() => {
    if (!data) return;
    const teamData =
      selectedTab != "Unassigned"
        ? getShift(data, selectedTab.toLowerCase())
        : getUnassigned(data, tabs);
    setShift(teamData);
    selectedTab != "Unassigned"
      ? setShiftSuper(findSupervisors(teamData))
      : setShiftSuper(findUpperSupervisors(data));
  }, [data, selectedTab]);

  return (
    <div className="relative flex flex-col flex-shrink flex-grow gap-2 items-center p-4 justify-center w-full h-full">
      {
        <Panel
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          supervisors={shiftSuper}
          team={shift}
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
        />
      }
    </div>
  );
}

const Panel = ({
  tabs,
  selectedTab,
  setSelectedTab,
  supervisors,
  team,
  selectedPerson,
  setSelectedPerson,
}) => {
  return (
    <motion.div className="relative flex gap-2 flex-col h-full w-full p-4">
      <motion.div
        id="panel"
        className="relative w-full h-1/12 flex bg-zinc-900/50 rounded-md border border-zinc-700 drop-shadow-xl/50"
      >
        <ul className="relative flex items-center justify-around cursor-pointer overflow-hidden p-1 w-full h-full">
          {tabs.map((tab) => (
            <li
              key={tab}
              className="relative flex justify-center items-center text-center w-full h-full text-lg"
              onClick={() => setSelectedTab(tab)}
            >
              {tab === selectedTab && (
                <motion.div
                  layoutId="underline"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
                  className={`absolute top-0 left-0 w-full -z-1 h-full rounded-md bg-${primaryAccent}`}
                ></motion.div>
              )}
              <motion.span
                animate={{ color: tab === selectedTab ? "#09090b" : "#e4e4e7" }}
                transition={{
                  duration: 0.3,
                  ease: [0.43, 0.13, 0.23, 0.96],
                  delay: 0.1,
                }}
              >
                {tab}
              </motion.span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        id="panel"
        className=" relative flex flex-col w-full h-11/12 bg-zinc-900/50 rounded-md border border-zinc-700 drop-shadow-xl/50"
      >
        {selectedTab === "Unassigned" ? (
          <>
            <SupervisorPanel
              title="Large and in Charge"
              cards={supervisors.map((sup) => (
                <PanelCard
                  key={sup.badgeNum}
                  person={sup}
                  selectedPerson={selectedPerson}
                  setSelectedPerson={setSelectedPerson}
                />
              ))}
            />
            <TeamPanel
              title="Unassigned"
              cards={team
                .filter(
                  (person) =>
                    !supervisors.some((sup) => sup.badgeNum === person.badgeNum)
                )
                .map((person) => (
                  <PanelCard
                    key={person.badgeNum}
                    person={person}
                    selectedPerson={selectedPerson}
                    setSelectedPerson={setSelectedPerson}
                  />
                ))}
            />
          </>
        ) : (
          <>
            <SupervisorPanel
              title="Supervisors"
              cards={supervisors.map((sup) => (
                <PanelCard
                  key={sup.badgeNum}
                  person={sup}
                  selectedPerson={selectedPerson}
                  setSelectedPerson={setSelectedPerson}
                />
              ))}
            />
            <TeamPanel
              title="Team"
              cards={team
                .filter(
                  (person) =>
                    !supervisors.some((s) => s.badgeNum === person.badgeNum)
                )
                .map((person) => (
                  <PanelCard
                    key={person.badgeNum}
                    person={person}
                    selectedPerson={selectedPerson}
                    setSelectedPerson={setSelectedPerson}
                  />
                ))}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const PanelCard = ({ person, selectedPerson, setSelectedPerson }) => {
  const [isOic, setIsOic] = useState(person.oic);
  const [isFto, setIsFto] = useState(person.fto);
  const [photo, setPhoto] = useState(person.photo || null);
  const [mandate, setMandate] = useState(person.mandate);
  const [isTrainee, setIsTrainee] = useState(person.trainee);
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

  const superRanks = {
    maj: "Maj",
    lt: "Lt",
    sgt: "Sgt",
    cpl: "Cpl",
  };

  const containerStyle =
    "relative flex flex-col shrink gap-1 items-start justify-center";
  const formStyle = `text-l w-full flex shrink border border-zinc-700 rounded-sm px-2 py-2 focus:ring-2 focus:ring-${primaryAccent} focus:shadow-[0_0_10px_2px_rgba(3,105,161,0.7)] focus:outline-none`;

  const isSelected = selectedPerson?.badgeNum === person.badgeNum;

  const handleClick = () => {
    setSelectedPerson(!selectedPerson && person);
  };

  return (
    <AnimatePresence>
      <motion.div
        layout
        onClick={!isSelected ? handleClick : undefined}
        whileHover={
          isSelected
            ? undefined
            : { scale: 1.05, transition: { duration: 0.05 } }
        }
        className={`flex flex-col rounded-xl drop-shadow-lg/50 bg-zinc-900 text-zinc-200 ${
          isSelected
            ? "w-full h-full z-10 p-6 absolute top-0 left-0"
            : "w-full h-full items-center cursor-pointer justify-center p-2 relative"
        }`}
      >
        <div className="relative flex justify-center items-center">
          <div
            className={`relative rounded-full border-2 border-${primaryAccent} aspect-square flex justify-center items-center`}
          >
            {person.photo ? (
              person.photo
            ) : (
              <BsPersonCircle size={isSelected ? "160" : "100"} />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 mt-2 text-sm font-semibold">
          <div>{`${person.firstName} ${person.lastName}`}</div>
          <div
            className={`bg-${secondaryAccent} text-zinc-950 px-1 py-0.5 rounded-xs`}
          >
            {person.badgeNum}
          </div>
          <div>{fullRanks[person.title]}</div>
          <div>{person.number || `000-000-0000`}</div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, duration: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-900 p-4 rounded-md flex justify-start items-start text-left text-sm"
          >
            <motion.button
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedPerson(null)}
              className="absolute h-12 w-12 flex items-center justify-center font-bold top-1 right-1 hover:cursor-pointer"
            >
              {<BsXLg size="32" />}
            </motion.button>
            <div className="flex shrink h-full w-2/10 flex-col justify-center items-center gap-2">
              <div className="h-full w-full flex"></div>
              <div
                className={`relative flex shrink items-center justify-center size-40 aspect-square rounded-full border-4 border-${primaryAccent}`}
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
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-8 py-2 shadow-lg/40 rounded-md bg-${primaryAccent} text-xl text-zinc-900`}
                >
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-3 py-2 shadow-lg/40 hover:cursor-pointer rounded-md bg-${primaryAccent} text-xl text-zinc-900`}
                >
                  Deactivate
                </motion.button>
              </div>
            </div>

            <form className="grid grid-cols-2 gap-4 p-4 auto-rows-min place-content-center items-center justify-center w-1/2 h-full">
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
                  <ToggleSwitch
                    value="oic"
                    isData={isOic}
                    setIsData={setIsOic}
                  />
                </div>
                <div className="relative flex flex-col gap-2 items-center justify-center">
                  <label className="text-xl">FTO</label>
                  <ToggleSwitch
                    value="fto"
                    isData={isFto}
                    setIsData={setIsFto}
                  />
                </div>
                <div className="relative flex flex-col gap-2 items-center justify-center">
                  <label className="text-xl">Mandate</label>
                  <ToggleSwitch
                    value="mandate"
                    isData={mandate}
                    setIsData={setMandate}
                  />
                </div>
                <div className="relative flex flex-col gap-2 items-center justify-center">
                  <label className="text-xl">Trainee</label>
                  <ToggleSwitch
                    value="trainee"
                    isData={isTrainee}
                    setIsData={setIsTrainee}
                  />
                </div>
              </div>
              {isTrainee && (
                <motion.div
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
                <div className={containerStyle}>
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
                </div>
              )}
            </form>
            <div className="w-1/2 h-full relative flex flex-col gap-4">
              <InfoPanel title="Shift Swap / Coverage" />
              <InfoPanel title="Vacation" />
              <InfoPanel title="Training" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const SupervisorPanel = ({ title, cards }) => {
  return (
    <motion.div className="flex flex-col items-center justify-center mb-2 w-full h-2/5">
      <div className="flex items-center justify-start h-1/10 w-full text-lg p-4 font-semibold text-zinc-200">
        {title}
      </div>
      <div className="flex items-center p-2 gap-2 justify-evenly w-full h-full">
        {cards}
      </div>
    </motion.div>
  );
};

const TeamPanel = ({ title, cards }) => {
  return (
    <motion.div className="flex flex-col w-full h-3/5">
      <div className="w-full h-1/10 relative p-4 border-t border-zinc-700 flex items-center justify-start text-lg font-semibold text-zinc-200">
        {title}
      </div>
      <div className="flex p-4 gap-4 items-center justify-evenly w-full h-full">
        {cards}
      </div>
    </motion.div>
  );
};

const ToggleSwitch = ({ value, isData, setIsData }) => {
  const toggleIsData = () => {
    setIsData(!isData);
  };

  return (
    <motion.div
      layout="position"
      className={`relative flex items-center border hover:cursor-pointer p-0.5 border-${primaryAccent}  ${
        isData ? `${primaryAccent} justify-end` : "bg-zinc-300 justify-start"
      } h-6 w-12 rounded-xl`}
      onClick={toggleIsData}
    >
      <motion.div
        layout
        className="size-5 bg-zinc-800 rounded-full"
        transition={{ layout: { type: "spring", bounce: 0.5, duration: 0.5 } }}
      />
    </motion.div>
  );
};

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
