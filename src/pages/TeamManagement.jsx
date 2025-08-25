import { BsPersonCircle, BsXLg } from "react-icons/bs";
import { motion, AnimatePresence } from "motion/react";
import { ProfileBadge } from "../components/ProfileBadge";
import ToggleSwitch from "../components/ToggleSwitch";
import EditCard from "../components/EditCard";

import {
  findSupervisors,
  findUpperSupervisors,
  getShift,
  getUnassigned,
} from "../teamSorting";
import { useEffect, useState, useRef } from "react";
import {
  primaryAccent,
  primaryAccentHex,
  secondaryAccent,
  secondaryAccentHex,
} from "../colors";
import { useOutletContext } from "react-router-dom";
import Button from "../components/Button";

export default function TeamManagement() {
  const { data, loading } = useOutletContext();
  const [selectedTab, setSelectedTab] = useState("Alpha");
  const tabs = ["Alpha", "Bravo", "Charlie", "Delta", "Unassigned"];
  const [shift, setShift] = useState([]);
  const [shiftSuper, setShiftSuper] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

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
        className="relative w-full h-1/12 flex bg-zinc-950/30 rounded-md border border-zinc-800 drop-shadow-xl/50"
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
                  style={{ backgroundColor: primaryAccentHex }}
                  className={`absolute top-0 left-0 w-full -z-1 h-full rounded-md`}
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
        className=" relative flex flex-col w-full h-11/12 bg-zinc-950/30 rounded-md border border-zinc-800 drop-shadow-xl/50"
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

  const isSelected = selectedPerson?.badgeNum === person.badgeNum;

  const handleClick = () => {
    setSelectedPerson(!selectedPerson && person);
  };

  return (
    <div className="w-full h-full">
      <motion.div
        layoutId={!isSelected ? `person-${person.badgeNum}` : undefined}
        onClick={!isSelected ? handleClick : undefined}
        whileHover={
          isSelected
            ? undefined
            : { scale: 1.05, transition: { duration: 0.05 } }
        }
        className={`flex flex-col rounded-xl drop-shadow-lg/50 bg-zinc-900 text-zinc-200
          w-full h-full items-center justify-center p-2 relative ${
            isSelected ? "invisible" : "cursor-pointer"
          }`}
      >
        <div className="relative flex justify-center items-center">
          <motion.div
            style={{ borderColor: primaryAccentHex }}
            className={`relative rounded-full border-2 aspect-square flex justify-center items-center`}
          >
            {person.photo ? (
              person.photo
            ) : (
              <BsPersonCircle size={isSelected ? "160" : "100"} />
            )}
          </motion.div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 mt-2 text-sm font-semibold">
          <div>{`${person.firstName} ${person.lastName}`}</div>
          <motion.div
            style={{ backgroundColor: secondaryAccentHex }}
            className={`text-zinc-950 px-1 py-0.5 rounded-xs`}
          >
            {person.badgeNum}
          </motion.div>
          <div>{fullRanks[person.title]}</div>
          <div>{person.number || `000-000-0000`}</div>
        </div>
      </motion.div>

      {/* Overlay absolutely positioned; the overlay holds the layoutId while selected */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="overlay"
            layoutId={`person-${person.badgeNum}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute inset-0 z-50"
          >
            <EditCard
              person={person}
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              photo={photo}
              setPhoto={setPhoto}
              isOic={isOic}
              setIsOic={setIsOic}
              isFto={isFto}
              setIsFto={setIsFto}
              isTrainee={isTrainee}
              setIsTrainee={setIsTrainee}
              mandate={mandate}
              setMandate={setMandate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
    <motion.div className=" flex flex-col w-full h-3/5">
      <div className="w-full h-1/10 relative p-4 border-t border-zinc-700 flex items-center justify-start text-lg font-semibold text-zinc-200">
        {title}
      </div>
      <div className="flex p-4 gap-4 items-center justify-evenly w-full h-full">
        {cards}
      </div>
    </motion.div>
  );
};
