import { motion, AnimatePresence } from "motion/react";
import EditCard from "../components/EditCard.tsx";
import { useUser } from "./context/UserContext";
import { useConfigure } from "./context/configureContext";
import type { Item } from "../components/ListPanel";
import { useEffect, useMemo, useState } from "react";
import type { User } from "./context/UserContext";
import ProfilePhoto from "../components/ProfilePhoto.tsx";
import PopUp, { PopUpProps } from "../components/PopUp.tsx";
import type { ErrorNotify } from "./Vacation.tsx";
import { useSafeSettings } from "./hooks/useSafeSettings.ts";
import { useBreakpoint } from "./hooks/useBreakpoint.ts";
import type { ConfigureData } from "../components/TeamDisplay.tsx";
import type { UserRecord } from "./context/UserContext";

type TabDef = { id: string; title: string; order?: number };

export default function TeamManagement() {
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [tabs, setTabs] = useState<TabDef[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [notify, setNotify] = useState<PopUpProps | null>(null);

  const { data: config } = useConfigure() as { data: any };
  const { data: users } = useUser();
  const { primaryAccent, secondaryAccent } = useSafeSettings();

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
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(({ id, title, order }) => ({ id, title, order }));

    setTabs(orderedTabs);

    // Only change selectedTab if current is invalid
    if (!orderedTabs.some((t) => t.id === selectedTab)) {
      setSelectedTab(orderedTabs[0]?.id ?? "");
    }
  }, [config, selectedTab]);

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
  };

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
      // Do not force-clear selection here; just leave it as-is.
      return;
    }

    const list = Object.values(users)
      .filter((u) => u?.active !== false)
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

    // Preserve selection if the selected UID is still in the list.
    setSelectedUser((prev) => {
      if (!prev) return prev;
      return list.some((u) => u.uid === prev) ? prev : null;
    });
  }, [tabs, selectedTab, users, rankOrder]);

  return (
    <div className="relative flex flex-col shrink grow gap-2 items-center lg:p-4 justify-center w-full h-full">
      {notify && (
        <PopUp
          onClose={notify.onClose}
          title={notify.title}
          location={notify.location}
          message={notify.message}
          timer={notify.timer}
          trueText={notify.trueText}
          falseText={notify.falseText}
          isConfirm={notify.isConfirm ? notify.isConfirm : false}
        />
      )}
      <motion.div className="relative flex gap-2 flex-col h-full w-full p-2 lg:p-4">
        {/* Tabs */}
        <motion.div
          id="panel"
          style={{borderColor: `${primaryAccent}E6`}}
          className="relative w-full lg:h-1/12 flex  rounded-md border  drop-shadow-xl/50"
        >
          <ul className="relative flex items-center justify-around cursor-pointer overflow-hidden p-1 w-full h-full">
            {tabs.map((tab) => {
              const active = tab.id === selectedTab;
              return (
                <li
                  key={tab.id}
                  className="relative flex justify-center items-center text-center w-full h-full lg:p-0 p-1 text-xs lg:font-normal font-medium lg:text-lg"
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
          style={{borderColor: `${primaryAccent}E6`}}
          className="relative flex flex-col w-full h-11/12  rounded-md border  drop-shadow-xl/50"
        >
          {selectedTab && (
            <TeamPanel
              title={tabs.find((t) => t.id === selectedTab)?.title ?? "Team"}
              supervisorCards={getSupervisors(
                users,
                config.Shifts.items[selectedTab].title
              ).map((user) => (
                <PanelCard
                  key={user.uid}
                  user={user}
                  selectedUid={selectedUser}
                  setSelectedUid={setSelectedUser}
                  primaryAccent={primaryAccent}
                  secondaryAccent={secondaryAccent}
                  config={config}
                  setNotify={setNotify}
                />
              ))}
              employeeCards={getEmployees(
                users,
                config.Shifts.items[selectedTab].title,
                config
              ).map((user) => (
                <PanelCard
                  key={user.uid}
                  user={user}
                  selectedUid={selectedUser}
                  setSelectedUid={setSelectedUser}
                  primaryAccent={primaryAccent}
                  secondaryAccent={secondaryAccent}
                  config={config}
                  setNotify={setNotify}
                />
              ))}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function sortRank(user: User): number {
  if (user.Ranks === "Sergeant") return 0;
  if (user.oic) return 1;
  return 2;
}

function getSupervisors(users: Record<string, User>, shift: string) {
  return Object.values(users)
    .filter(
      (user) => user.Shifts === shift && (user.Ranks === "Sergeant" || user.oic)
    )
    .sort((a, b) => sortRank(a) - sortRank(b));
}

function getEmployees(users: Record<string, User>, shift: string, conf: any) {
  return Object.values(users)
    .filter(
      (user) => user.Shifts === shift && user.Ranks !== "Sergeant" && !user.oic
    )
    .sort((a, b) => getOrder(a.Ranks, conf) - getOrder(b.Ranks, conf));
}

function getOrder(rank: string, data: ConfigureData): number {
  const ranks = data.Ranks.items;
  const order = Object.values(ranks).filter((ranks) => ranks.title === rank);
  return order[0].order;
}

function TeamPanel({
  title,
  supervisorCards,
  employeeCards,
}: {
  title: string;
  supervisorCards: React.ReactNode;
  employeeCards: React.ReactNode;
}) {
  const exclude = ["Alpha", "Bravo", "Charlie", "Delta"];
  const allCards = [supervisorCards, employeeCards];
  return (
    <motion.div className="flex flex-col w-full h-full">
      <div className="w-full p-2 relative flex items-center justify-start text-lg font-medium 2xl:text-xl 2xl:font-semibold text-zinc-200">
        {title}
      </div>
      <div className="flex p-2 flex-col items-center justify-evenly w-full h-full">
        {exclude.includes(title) && (
          <>
            <div className="flex p-2 gap-4 border-b-2 border-zinc-900 items-center justify-evenly w-full h-2/5">
              {supervisorCards}
            </div>
            <div className="flex p-2 lg:flex-row flex-col gap-4 flex-1 flex-wrap w-full">
              {employeeCards}
            </div>{" "}
          </>
        )}
        {!exclude.includes(title) && (
          <motion.div className="flex flex-1 lg:flex-row flex-col p-2 gap-4 flex-wrap w-full">
            {allCards}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function PanelCard({
  user,
  selectedUid,
  setSelectedUid,
  primaryAccent,
  secondaryAccent,
  config,
  setNotify,
}: {
  user: User;
  selectedUid: string | null;
  setSelectedUid: React.Dispatch<React.SetStateAction<string | null>>;
  primaryAccent: string;
  secondaryAccent: string;
  config: any;
  setNotify: React.Dispatch<React.SetStateAction<PopUpProps | null>>;
}) {
  const isSelected = !!user.uid && selectedUid === user.uid;
  const { twoXlUp } = useBreakpoint();
  const photoSize = twoXlUp ? 24 : 22;
  const badgeFont = twoXlUp ? 14 : 12;
  const { user: currUser } = useUser();

  function hasAccess() {
    if (!currUser) return;
    return currUser.Shifts === "Command Staff" || currUser.badge === "3816";
  }

  const includes = ["Alpha", "Bravo", "Charlie", "Delta", "Command-Staff"];

  return (
    <div className="flex-1 basis-1/3">
      <motion.div
        layoutId={`user-${user.uid}`}
        onClick={
          !isSelected && hasAccess()
            ? () => user.uid && setSelectedUid(user.uid)
            : undefined
        }
        style={{ borderColor: secondaryAccent }}
        whileHover={
          isSelected
            ? undefined
            : { scale: 1.02, transition: { duration: 0.05 } }
        }
        className={`flex flex-col overflow-hidden rounded-xl border-2 drop-shadow-xl/30 bg-zinc-900 text-zinc-200 w-full h-full items-center justify-center p-2 relative ${
          isSelected ? "invisible" : "cursor-pointer"
        }`}
      >
        <div className="relative flex justify-center items-center">
          <motion.div className="relative rounded-full aspect-square flex justify-center items-center">
            <ProfilePhoto
              user={user}
              size={photoSize}
              borderColor={primaryAccent}
              badge={true}
              borderSize="md"
              badgeFontSize={badgeFont}
            />
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-center gap-0.5 mt-2 text-xs 2xl:text-sm font-semibold">
          <div>{`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}</div>
          <motion.div
            style={{ backgroundColor: secondaryAccent }}
            className="text-zinc-950 px-1 py-0.5 rounded-xs 2xl:text-sm text-xs font-medium"
          >
            {user.badge}
          </motion.div>
          {user.Ranks && <div className="">{user.Ranks}</div>}
          {!includes.includes(user.Shifts) && (
            <div className="">{user.SpecialRoles}</div>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="sync">
        {isSelected && (
          <motion.div
            key={`overlay-${user.uid}`}
            layoutId={`user-${user.uid}`}
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="absolute inset-0 z-50"
          >
            <EditCard
              user={user}
              selected={selectedUid}
              setSelected={setSelectedUid}
              setNotify={setNotify}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
