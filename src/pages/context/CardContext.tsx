
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
  if (!context) {
    throw new Error("CardContext must be used inside <CardProvider>");
  }
  return context;
}

export function CardProvider({ children }: { children: React.ReactNode }) {
  const { user, view } = useUser();
  const [info, setInfo] = useState<Info>([]);

  // all cards, by division
  const [allInfo, setAllInfo] = useState<AllInfo>({
    ADC: {},
    UPD: {},
  });

  // ---- Firebase subscription: keep allInfo in sync ----
  useEffect(() => {
    const cardRef = ref(db, "cards");

    const unsubscribe = onValue(
      cardRef,
      (snapshot) => {
        const val = snapshot.val() as Partial<AllInfo> | null;

        // Normalize so we ALWAYS have ADC + UPD keys
        setAllInfo({
          ADC: val?.ADC ?? {},
          UPD: val?.UPD ?? {},
        });
      },
      (err) => {
        console.error("Firebase fetch error:", err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // ---- Derive `info` for the current view (division) ----
  useEffect(() => {
    if (!user || !view) {
      setInfo([]);
      return;
    }

    const divisionCards = allInfo[view];
    if (!divisionCards) {
      setInfo([]);
      return;
    }

    const sorted = Object.values(divisionCards).sort(
      (a, b) => a.order - b.order
    );

    setInfo(sorted);
  }, [allInfo, user, view]);

  // ---- Add a new card ----
  async function addCard(cardProps: InfoCardProps): Promise<string> {
    // Use the division from the card itself, not from context,
    // so you can create cards for any division explicitly.
    const division = cardProps.division; // "ADC" | "UPD"

    const listRef = ref(db, `cards/${division}`);
    const newRef = push(listRef);
    const uid = newRef.key;

    if (!uid) {
      throw new Error("Failed to generate card id");
    }

    await set(newRef, {
      ...cardProps,
      uid,
    });

    return uid;
  }

  // ---- Reorder cards on drag end ----
 async function reorderCard(cards: Info) {
  if (!user) return;

  const division = user.Divisions?.toUpperCase();
  if (!division) return;

  // Reference to the division card list
  const cardListRef = ref(db, `cards/${division}`);

  // Build the update object
  const updates: Record<string, any> = {};

  cards.forEach((card, index) => {
    if (!card.uid) return;
    const newOrder = (index + 1) * 10;

    updates[`${card.uid}/order`] = newOrder;
  });

  // Commit all updates in a single atomic update()
  await update(cardListRef, updates);

  
}

  // ---- Delete Card ---- 
  async function deleteCard(uid: string) {
    if (!user) return;
    const division = user.Divisions.toUpperCase();

    const cardRef = ref(db, `cards/${division}/${uid}`);
    await set(cardRef, null);
  }

  // ---- Add a signup to a card ----
  async function addSignup(
    cardUid: string,
    division: "ADC" | "UPD"
  ): Promise<void> {
    if (!user) return;

    const signupData = {
      uid: user.uid,
      firstName: user.firstName,
      lastName: user.lastName,
      badge: user.badge,
    };

    // Cards are stored at cards/{division}/{cardUid}
    const signupsRef = ref(
      db,
      `cards/${division}/${cardUid}/signUpProps`
    );
    const newRef = push(signupsRef);
    const signupId = newRef.key;

    if (!signupId) {
      throw new Error("Failed to generate signup id");
    }

    await set(newRef, signupData);
  }

  const value: Value = {
    addCard,
    info,
    allInfo,
    addSignup,
    deleteCard,
    reorderCard,
  };

  return (
    <CardContext.Provider value={value}>
      {children}
    </CardContext.Provider>
  );
}

