import Card from "./Card";
import { BsPersonCircle } from "react-icons/bs";
import { findSupervisors, getShift } from "../teamSorting";
import { createCards } from "../createCards";

// Used to create each shift and the team on the shift, starts with supervisors then generates everyone else
export default function Shifts({ shift, team }) {
  const currentShift = getShift(team, shift);
  const supervisors = findSupervisors(currentShift);
  const supervisorCards = createCards(supervisors);
  const teamOnly = currentShift.filter(
    (person) => !supervisors.some((s) => s.badgeNum === person.badgeNum)
  );
  const teamCards = createCards(teamOnly);
  const capShift = shift.charAt(0).toUpperCase() + shift.slice(1);

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950/50 border border-zinc-950 rounded-md">
      <div className="relative flex justify-center items-center bg-zinc-900 text-zinc-300 text-shadow-sm text-lg font-bold rounded-t-sm">
        {capShift}
      </div>
      <div
        id="supervisors"
        className="relative flex flex-col w-full h-full border-b-1 border-zinc-950"
      >
        <div className="relative w-full bg-zinc-900 text-zinc-300 font-bold text-md p-1 shadow-lg/40">
          Supervisors
        </div>
        <div className="relative w-full flex justify-around gap-1 p-2">
          {supervisorCards}
        </div>
      </div>
      <div
        id="team"
        className="relative flex justify-center items-center p-2 flex-wrap gap-2"
      >
        {teamCards}
      </div>
    </div>
  );
}
