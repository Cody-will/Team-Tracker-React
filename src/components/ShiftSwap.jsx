import { db } from "../firebase";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";

export default function ShiftSwap() {
  const [person, setPerson] = useState(null);
  const [coverDate, setCoverDate] = useState(null);
  const [workDate, setWorkDate] = useState(null);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(null);

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

  useEffect(() => {
    setStep(<StepOne data={data} />);
  }, [data]);

  return (
    <div className="relative h-full w-full justify-center items-center flex">
      <div
        id="panel"
        className="h-3/4 w-3/4 bg-zinc-900/50 shadow-xl/40 rounded-md border border-zinc-700 relative flex flex-col"
      >
        <div className="h-1/10 text-2xl font-semibold text-zinc-200 w-full flex items-center justify-start p-2">
          Shift Swap
        </div>
        {step}
      </div>
    </div>
  );
}

const StepOne = ({ data }) => {
  console.log(data);
  return (
    <div className="relative w-full h-full flex justify-center border border-amber-500 items-center">
      <div className="relative justify-center items-center flex">
        Select person to swap with:
      </div>
      <select className="w-1/10">
        {data.forEach((person) => (
          <option
            key={person.badgeNum}
            value={person.badgeNum}
          >{`${person.lastName}, ${person.firstName[0]} ${person.badgeNum}`}</option>
        ))}
      </select>
    </div>
  );
};

const StepTwo = () => {
  return <></>;
};

const StepThree = () => {
  return <></>;
};
