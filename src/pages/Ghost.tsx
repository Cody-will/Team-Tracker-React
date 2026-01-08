import {useState, useEffect} from "react";
import {useUser} from "./context/UserContext.tsx";
import {useSafeSettings} from "./hooks/useSafeSettings.ts"
import FrontCard from "../components/FrontCard.tsx"
export default function Ghost() {
  const {user, allUsers: users} = useUser();
  const [ghostUsers, setGhostUsers] = useState([]);
  const {primaryAccent} = useSafeSettings();
  
  useEffect(() => {
    const ghosts = Object.values(users).filter(u => u.Divisions == "Ghost");
    setGhostUsers(ghosts);
  }, [users])

  return (
    <div className="h-full w-full flex p-4">
      <div id="panel" className="flex flex-wrap rounded-lg p-4 gap-2 flex-1 border" style={{borderColor: `${primaryAccent}E6` }}>
        {ghostUsers && ghostUsers.map(u => <FrontCard key={u.uid} person={u} />)}
      </div>
    </div>
  )






}
