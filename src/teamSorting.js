
export function getShift(team, shift) {
  return Object.values(team).filter((person) => Array.isArray(person.shift) ? person.shift.some(s=> s === shift) : person.shift === shift && (!person.mandate));
}

export function findSupervisors(teamObj) {
  const team = Object.values(teamObj);
  const supervisors = [];
  team.forEach(
    (person) => person.rank === "sgt" && supervisors.push(person)
  );
  team.forEach(
    (person) => person.rank === "oic" && supervisors.push(person)
  );
  return supervisors;
}

export function findUpperSupervisors(teamObj) {
  return Object.values(teamObj).filter((person) => person.shift === "all");
}

export function getMandate(teamObj) {
  return Object.values(teamObj).filter((person) => person.mandate);
}

export function getUnassigned(teamObj, shifts) {
  return Object.values(teamObj).filter(
(person) =>
  !Array.isArray(person.shift) &&
  !shifts.some((shift) => shift.toLowerCase() === person.shift.toLowerCase())
  );
}
