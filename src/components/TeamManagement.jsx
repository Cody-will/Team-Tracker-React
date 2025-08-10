import { BsPersonCircle, BsXLg } from "react-icons/bs";
import { motion } from "motion/react";

import {
  findSupervisors,
  findUpperSupervisors,
  getMandate,
  getShift,
  getUnassigned,
} from "../teamSorting";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { onValue, ref, set } from "firebase/database";
import { createCards, createLgCard, createUpper } from "../createCards";

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
    <motion.div className="relative flex gap-2 flex-col h-7/8 w-7/8">
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
                  className="absolute top-0 left-0 w-full -z-1 h-full rounded-md bg-sky-500"
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

  const fullRanks = {
    maj: "Major",
    lt: "Lieutenant",
    sgt: "Sergeant",
    cpl: "Corporal",
    dep: "Deputy",
    train: "Trainee",
  };

  const containerStyle =
    "relative flex flex-col gap-1 w-1/2 items-start justify-center";
  const formStyle =
    "text-l w-full border border-zinc-600 rounded-sm px-2 py-2 focus:ring-1 focus:ring-sky-500 focus:shadow-[0_0_10px_2px_rgba(3,105,161,0.7)] focus:outline-none";

  const isSelected = selectedPerson?.badgeNum === person.badgeNum;

  const handleClick = () => {
    setSelectedPerson(!selectedPerson && person);
  };

  return (
    <motion.div
      layout
      onClick={!isSelected ? handleClick : undefined}
      whileHover={
        isSelected ? undefined : { scale: 1.05, transition: { duration: 0.05 } }
      }
      className={`flex flex-col rounded-md drop-shadow-lg/50 bg-zinc-900 text-zinc-200 ${
        isSelected
          ? "w-full h-full z-10 p-6 absolute top-0 left-0"
          : "w-full h-full items-center cursor-pointer justify-center p-2 relative"
      }`}
    >
      <div className="flex justify-center items-center">
        <div className="rounded-full border-2 border-sky-500 aspect-square flex justify-center items-center overflow-hidden">
          {person.photo ? (
            person.photo
          ) : (
            <BsPersonCircle size={isSelected ? "160" : "100"} />
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 mt-2 text-sm font-semibold">
        <div>{`${person.firstName} ${person.lastName}`}</div>
        <div className="bg-gradient-to-br from-amber-600 to-amber-500 text-zinc-950 px-1 py-0.5 rounded-xs">
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
          <motion.div
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedPerson(null)}
            className="absolute h-8 w-8 flex items-center justify-center font-bold top-1 right-1 hover:cursor-pointer"
          >
            {<BsXLg size="24" />}
          </motion.div>
          <div className="flex h-full w-2/10 flex-col justify-center items-center gap-2">
            <div className="flex items-center justify-center size-40 aspect-square rounded-full border-4 border-sky-500">
              <div className="flex items-center justify-center w-full h-full">
                {photo ? (
                  <img src={photo} size="160" />
                ) : (
                  <BsPersonCircle size="160" />
                )}
              </div>
            </div>
            <span className="flex items-center font-semibold text-zinc-200 text-lg justify-center">
              {person.firstName} {person.lastName}
            </span>
            <UploadButton onFile={photo} photo={photo} setPhoto={setPhoto} />
          </div>

          <form className="flex flex-col flex-wrap gap-2 items-center justify-center w-1/2 h-full">
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
              <select
                name="shift"
                value={person.shift}
                className={formStyle}
              ></select>
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
              <label className="text-xl">Password</label>
              <input
                type="password"
                name="password"
                value={person.password || "lsdnlsndfln"}
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
            <div className="relative flex w-1/2 items-center justify-between gap-4">
              <div className="relative flex flex-col gap-2 items-center justify-center">
                <label className="text-xl">OIC</label>
                <ToggleSwitch value="oic" isData={isOic} setIsData={setIsOic} />
              </div>
              <div className="relative flex flex-col gap-2 items-center justify-center">
                <label className="text-xl">FTO</label>
                <ToggleSwitch value="fto" isData={isFto} setIsData={setIsFto} />
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
          <div className="w-1/2 h-full"></div>
        </motion.div>
      )}
    </motion.div>
  );
};

const SupervisorPanel = ({ title, cards }) => {
  return (
    <motion.div className="flex flex-col items-center justify-center mb-2 w-full h-1/3">
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
    <motion.div className="flex flex-col w-full h-2/3">
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
    <div
      className={`relative flex items-center border hover:cursor-pointer p-0.5 border-sky-500  ${
        isData ? "bg-sky-500" : "bg-zinc-300"
      } h-6 w-12 rounded-xl`}
    >
      <motion.div
        className="size-5 bg-zinc-800 rounded-full"
        onClick={toggleIsData}
        animate={{ x: isData ? 22 : 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.3 }}
      />
    </div>
  );
};

const UploadButton = ({ onFile, photo, setPhoto, label = "Upload" }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Create a preview if `photo` is a File; clean up URL object
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

    // hand the file to parent state and optional callback
    setPhoto?.(file);
    onFile?.(file);

    // allow selecting the same file again later
    e.target.value = "";
  };

  const getDisplayName = () => {
    if (!photo) return "";
    if (photo instanceof File) return photo.name;
    // assume string/URL
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
        className="relative flex justify-center items-center bg-sky-500 py-2 px-3 rounded-md text-md text-zinc-900 hover:cursor-pointer"
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

      {/* Filename (truncated if long) */}
      {photo && (
        <div
          className="w-full text-sm border border-zinc-600 rounded-md py-2 px-3 text-zinc-600 truncate"
          title={getDisplayName()}
        >
          {getDisplayName()}
        </div>
      )}

      {/* Optional tiny preview bubble when a File is selected */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected preview"
          className="h-24 w-24 rounded-full object-cover border-2 border-sky-500"
        />
      )}
    </div>
  );
};
