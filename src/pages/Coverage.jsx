import { useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../pages/context/AuthContext";

export default function Coverage() {
  const [text, setText] = useState("");
  const { currentUser } = useAuth();
  const display = () => {
    setText(currentUser.uid);
    console.log(currentUser);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="h-1/2 w-1/2 flex flex-col gap-4 text-lg font-semibold items-center justify-center p-5 bg-zinc-950/30 border rounded-lg border-zinc-800">
        <div className="text-zinc-200 flex items-center justify-center">
          {text}
        </div>
        <Button text="Display User" type="button" action={() => display()} />
      </div>
    </div>
  );
}
