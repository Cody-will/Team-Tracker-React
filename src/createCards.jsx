import Card from "./components/Card";
import UpperCard from "./components/UpperCard";
import { BsPersonCircle } from "react-icons/bs";

export function createCards(team) {
  const cards = [];
  team.forEach((person) => cards.push(makeCard(person)));
  return cards;
}

function makeCard(person) {
  const fullRank = {
    sgt: "Sergeant",
    dep: "Deputy",
    cpl: "Corpral",
    trainee: "Trainee",
  };
  return (
    <Card
      key={person.badgeNum}
      firstname={person.firstName}
      lastname={person.lastName}
      badge={person.badgeNum}
      title={fullRank[person.title]}
      oic={person.oic}
      fto={person.fto}
      icon={person.photo || <BsPersonCircle size="80" />}
    />
  );
}

export function createUpper(upperSupervisors) {
  const upperCards = [];
  upperSupervisors.forEach(
    (person) => person.rank === "maj" && upperCards.push(makeUpper(person))
  );
  upperSupervisors.forEach(
    (person) => person.rank === "lt" && upperCards.push(makeUpper(person))
  );
  return upperCards;
}

export function createLgCard(team) {
  const lgCards = [];
  team.forEach((person) => lgCards.push(makeUpper(person)));
  return lgCards;
}

function makeUpper(person) {
  const fullRank = {
    maj: "Major",
    lt: "Lieutenant",
    sgt: "Sergeant",
    dep: "Deputy",
  };
  return (
    <UpperCard
      key={person.badgeNum}
      firstname={person.firstName}
      lastname={person.lastName}
      badge={person.badgeNum}
      title={fullRank[person.title]}
      icon={person.photo || <BsPersonCircle size="80" />}
    />
  );
}
