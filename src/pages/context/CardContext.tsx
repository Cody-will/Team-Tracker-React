
import * as React from "react";
import { useEffect, useState } from "react";
import { ref, push, set, onValue, update } from "firebase/database";
import { db } from "../../firebase";
import type { InfoCardProps } from "../../components/InfoCard";
import { useUser } from "./UserContext";

export interface AllInfo {
  ADC: Record<string, InfoCardProps>;
  UPD: Record<string, InfoCardProps>;
}
export type Info = InfoCardProps[];

export interface Value {
  addCard: (cardProps: InfoCardProps) => Promise<string>;
  info: Info;
  allInfo: AllInfo;
  addSignup: (cardUid: string, division: "ADC" | "UPD") => Promise<void>;
  deleteCard: (uid: string) => Promise<void>;
  reorderCard: (cards: Info) => Promise<void>;
}

const CardContext = React.createContext<Value | undefined>(undefined);

export function useCard() {
  const context = React.useContext(CardContext);
  if (!context) throw new Error("CardContext must be used inside <CardProvider>");
  return context;
}

export function CardProvider({ children }: { children: React.ReactNode }) {
  const DEBUG = true;
  const log = (...a: any[]) => DEBUG && console.log("[CardProvider]", ...a);
  const warn = (...a: any[]) => DEBUG && console.warn("[CardProvider]", ...a);
  const errLog = (...a: any[]) => DEBUG && console.error("[CardProvider]", ...a);

  const { user, view } = useUser();
  const [info, setInfo] = useState<Info>([]);

  // Keep structure for API compatibility, but we won't subscribe to root anymore
  const [allInfo, setAllInfo] = useState<AllInfo>({ ADC: {}, UPD: {} });

  // ✅ Subscribe ONLY to the active division path (cards/ADC or cards/UPD)
  useEffect(() => {
    // not logged in / not ready
    if (!user || !view) {
      log("no user/view -> reset cards state", { hasUser: !!user, view });
      setInfo([]);
      setAllInfo({ ADC: {}, UPD: {} });
      return;
    }

    const division = view; // "ADC" | "UPD"
    const divisionRef = ref(db, `cards/${division}`);

    log("attach onValue", `cards/${division}`);

    const unsub = onValue(
      divisionRef,
      (snap) => {
        const val = (snap.val() || {}) as Record<string, InfoCardProps>;

        // update allInfo for that division (keep other division intact)
        setAllInfo((prev) => ({
          ...prev,
          [division]: val,
        }));

        const sorted = Object.values(val).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setInfo(sorted);

        log("cards snapshot", { division, count: sorted.length });
      },
      (e) => {
        errLog("cards onValue error", { division, e });
        setInfo([]);
        setAllInfo((prev) => ({ ...prev, [division]: {} as any }));
      }
    );

    return () => {
      log("detach onValue", `cards/${division}`);
      unsub();
    };
  }, [user?.uid, view]);

  async function addCard(cardProps: InfoCardProps): Promise<string> {
    const division = cardProps.division; // "ADC" | "UPD"
    const listRef = ref(db, `cards/${division}`);
    const newRef = push(listRef);
    const uid = newRef.key;
    if (!uid) throw new Error("Failed to generate card id");

    await set(newRef, { ...cardProps, uid });
    return uid;
  }

  async function reorderCard(cards: Info) {
    if (!user) return;

    // IMPORTANT: use view for reorder, not user.Divisions (because Sheriff can toggle view)
    const division = (view ?? user.Divisions)?.toUpperCase() as "ADC" | "UPD" | undefined;
    if (!division) return;

    const cardListRef = ref(db, `cards/${division}`);
    const updatesObj: Record<string, any> = {};

    cards.forEach((card, index) => {
      if (!card.uid) return;
      updatesObj[`${card.uid}/order`] = (index + 1) * 10;
    });

    await update(cardListRef, updatesObj);
  }

  async function deleteCard(uid: string) {
    if (!user) return;
    const division = (view ?? user.Divisions)?.toUpperCase() as "ADC" | "UPD" | undefined;
    if (!division) return;

    const cardRef = ref(db, `cards/${division}/${uid}`);
    await set(cardRef, null);
  }

  async function addSignup(cardUid: string, division: "ADC" | "UPD"): Promise<void> {
    if (!user) return;

    const signupData = {
      uid: user.uid,
      firstName: user.firstName,
      lastName: user.lastName,
      badge: user.badge,
    };

    const signupsRef = ref(db, `cards/${division}/${cardUid}/signUpProps`);
    const newRef = push(signupsRef);
    const signupId = newRef.key;
    if (!signupId) throw new Error("Failed to generate signup id");

    await set(newRef, signupData);
  }

  const value: Value = { addCard, info, allInfo, addSignup, deleteCard, reorderCard };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

