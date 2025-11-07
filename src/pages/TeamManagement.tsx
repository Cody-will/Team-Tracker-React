import { BsPersonCircle } from "react-icons/bs";
import { motion, AnimatePresence } from "motion/react";
import EditCard from "../components/EditCard";
import { useUser } from "./context/UserContext";
import { useConfigure } from "./context/configureContext";
import type { Item } from "../components/ListPanel";
import { useEffect, useMemo, useState } from "react";

type TabDef = { id: string; title: string };

export default function TeamManagement() {
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [tabs, setTabs] = useState<TabDef[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // config = data returned by ConfigureProvider (where Shifts/Ranks live)
  const { data: config } = useConfigure() as { data: any };
  // users = Record<uid, User> from your UserProvider
  const { data: users, userSettings } = useUser();
  const { primaryAccent, secondaryAccent } = userSettings;

  // Build tabs from configure.Shifts.items (ordered)
  useEffect(() => {
    const record: Record<string, Item> | undefined = config?.Shifts?.items;
    if (!record || typeof record !== "object") {
      setTabs([]);
      setSelectedTab("");
      return;
    }

    const orderedTabs: TabDef[] = Object.entries(record)
      .map(([id, it]) => ({
        id,
        title: (it?.title ?? "").trim(),
        order: it?.order ?? 0,
      }))
      .filter((t) => t.title.length > 0)
      .sort((a, b) => a.order - b.order)
      .map(({ id, title }) => ({ id, title }));

    setTabs(orderedTabs);
    if (orderedTabs.length === 0) {
      setSelectedTab("");
    } else {
      setSelectedTab((curr) =>
        curr && orderedTabs.some((t) => t.id === curr)
          ? curr
          : orderedTabs[0].id
      );
    }
  }, [config]);

  // Rank order from configure.Ranks.items, used to sort users within a tab
  const rankOrder = useMemo(() => {
    const record: Record<string, Item> | undefined = config?.Ranks?.items;
    const map = new Map<string, number>();
    if (!record) return map;
    const ordered = Object.entries(record)
      .map(([id, it]) => ({
        id,
        title: (it?.title ?? "").trim(),
        order: it?.order ?? 0,
      }))
      .filter((r) => r.title.length > 0)
      .sort((a, b) => a.order - b.order);

    // allow matching by key (id) and by title string
    ordered.forEach((r, idx) => {
      map.set(r.id.toLowerCase(), idx);
      map.set(r.title.toLowerCase(), idx);
    });
    return map;
  }, [config]);

  const getRankIndex = (u: User) => {
    const role = (u?.Role ?? "").toLowerCase();
    return rankOrder.has(role)
      ? rankOrder.get(role)!
      : Number.POSITIVE_INFINITY;
    // If you want to also match alternate spellings, extend here.
  };

  // Whether a user belongs to a given tab, based on user's `Shifts` field
  const belongsToTab = (u: User, tab: TabDef | undefined) => {
    if (!tab) return false;
    const shift = String(u?.Shifts ?? "")
      .toLowerCase()
      .trim();
    if (!shift) return false;
    return shift === tab.id.toLowerCase() || shift === tab.title.toLowerCase();
  };

  // Build team list for the selected tab
  useEffect(() => {
    const tab = tabs.find((t) => t.id === selectedTab);
    if (!tab || !users) {
      setTeam([]);
      setSelectedUser(null);
      return;
    }

    const list = Object.values(users)
      .filter((u) => u?.active !== false) // keep inactive users out
      .filter((u) => belongsToTab(u, tab))
      .sort((a, b) => {
        const ra = getRankIndex(a);
        const rb = getRankIndex(b);
        if (ra !== rb) return ra - rb;
        const ln = (a.lastName ?? "").localeCompare(b.lastName ?? "");
        if (ln !== 0) return ln;
        return (a.firstName ?? "").localeCompare(b.firstName ?? "");
      });

    setTeam(list);
    setSelectedUser(null);
  }, [tabs, selectedTab, users, rankOrder]);

  return (
    <div className="relative flex flex-col flex-shrink flex-grow gap-2 items-center p-4 justify-center w-full h-full">
      <motion.div className="relative flex gap-2 flex-col h-full w-full p-4">
        {/* Tabs */}
        <motion.div
          id="panel"
          className="relative w-full h-1/12 flex bg-zinc-950/30 rounded-md border border-zinc-800 drop-shadow-xl/50"
        >
          <ul className="relative flex items-center justify-around cursor-pointer overflow-hidden p-1 w-full h-full">
            {tabs.map((tab) => {
              const active = tab.id === selectedTab;
              return (
                <li
                  key={tab.id}
                  className="relative flex justify-center items-center text-center w-full h-full text-lg"
                  onClick={() => setSelectedTab(tab.id)}
                >
                  {active && (
                    <motion.div
                      layoutId="underline"
                      transition={{
                        type: "spring",
                        bounce: 0.25,
                        duration: 0.3,
                      }}
                      style={{ backgroundColor: primaryAccent }}
                      className="absolute top-0 left-0 w-full -z-1 h-full rounded-md"
                    />
                  )}
                  <motion.span
                    animate={{ color: active ? "#09090b" : "#e4e4e7" }}
                    transition={{
                      duration: 0.3,
                      ease: [0.43, 0.13, 0.23, 0.96],
                      delay: 0.1,
                    }}
                  >
                    {tab.title}
                  </motion.span>
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* Grid */}
        <motion.div
          id="panel"
          className="relative flex flex-col w-full h-11/12 bg-zinc-950/30 rounded-md border border-zinc-800 drop-shadow-xl/50"
        >
          <TeamPanel
            title={tabs.find((t) => t.id === selectedTab)?.title ?? "Team"}
            cards={team.map((user) => (
              <PanelCard
                key={String(user.uid ?? user.badge)}
                user={user}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                primaryAccent={primaryAccent}
                secondaryAccent={secondaryAccent}
                config={config}
              />
            ))}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------- Types from your UserContext ---------- */
type CustomValue = string | number | boolean | null;
export interface User {
  uid?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  badge: string;
  Shifts: string; // <-- used to map to tab
  carNumber: string;
  Role: string; // <-- used to rank/sort
  oic: boolean;
  fto: boolean;
  mandate: boolean;
  trainee: boolean;
  firearms?: boolean;
  trainer?: string;
  phase?: string;
  pit: boolean;
  speed: boolean;
  rifle: boolean;
  active: boolean;
  settings?: any;
  custom?: Record<string, CustomValue>;
}

/* ---------- Presentational pieces ---------- */

function TeamPanel({
  title,
  cards,
}: {
  title: string;
  cards: React.ReactNode;
}) {
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
}

function PanelCard({
  user,
  selectedUser,
  setSelectedUser,
  primaryAccent,
  secondaryAccent,
  config,
}: {
  user: User;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  primaryAccent: string;
  secondaryAccent: string;
  config: any; // full configure object for child consumption
}) {
  const idForKey = String(user.uid ?? user.badge);
  const isSelected =
    (selectedUser?.uid ?? selectedUser?.badge) === (user.uid ?? user.badge);

  return (
    <div className="w-full h-full">
      <motion.div
        layoutId={!isSelected ? `person-${idForKey}` : undefined}
        onClick={!isSelected ? () => setSelectedUser(user) : undefined}
        whileHover={
          isSelected
            ? undefined
            : { scale: 1.05, transition: { duration: 0.05 } }
        }
        className={`flex flex-col rounded-xl drop-shadow-lg/50 bg-zinc-900 text-zinc-200 w-full h-full items-center justify-center p-2 relative ${
          isSelected ? "invisible" : "cursor-pointer"
        }`}
      >
        <div className="relative flex justify-center items-center">
          <motion.div
            style={{ borderColor: primaryAccent }}
            className="relative rounded-full border-2 aspect-square flex justify-center items-center"
          >
            {/* Swap to your avatar component once you wire photos */}
            <BsPersonCircle size={isSelected ? 160 : 100} />
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 mt-2 text-sm font-semibold">
          <div>{`${user.firstName} ${user.lastName}`.trim()}</div>
          <motion.div
            style={{ backgroundColor: secondaryAccent }}
            className="text-zinc-950 px-1 py-0.5 rounded-xs"
          >
            {user.badge}
          </motion.div>
          <div>{user.Role}</div>
          <div>{user.phone || "000-000-0000"}</div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="overlay"
            layoutId={`person-${idForKey}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute inset-0 z-50"
          >
            {/* EditCard now receives the whole user + whole config */}
            <EditCard
              user={user}
              config={config}
              onClose={() => setSelectedUser(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
