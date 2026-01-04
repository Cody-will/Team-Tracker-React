
import { useContext, useState, useEffect, useMemo } from "react";
import * as React from "react";
import { db } from "../../firebase.js";
import { set, ref, get, push, update, remove, onValue } from "firebase/database";
import { useUser } from "./UserContext.tsx"; // ✅ gate listener on auth/user

const DEBUG = true;
const log = (...args) => DEBUG && console.log("[ConfigureProvider]", ...args);
const warn = (...args) => DEBUG && console.warn("[ConfigureProvider]", ...args);
const errLog = (...args) => DEBUG && console.error("[ConfigureProvider]", ...args);

const ConfigureContext = React.createContext(undefined);

export function useConfigure() {
  const ctx = useContext(ConfigureContext);
  if (!ctx) throw new Error("useConfigure must be used inside <ConfigureProvider>");
  return ctx;
}

export function ConfigureProvider({ children }) {
  const { user } = useUser(); // ✅ will be null/undefined on /login
  const [data, setData] = useState(null);

  // ✅ Only subscribe once we have a user (prevents permission_denied spam on /login)
  useEffect(() => {
    if (!user?.uid) {
      log("no user -> reset configure");
      setData(null);
      return;
    }

    const confRef = ref(db, "configure");
    log("attach onValue", "/configure");

    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        const next = snapshot.exists() ? snapshot.val() : null;
        setData(next);
        log("snapshot", { hasData: !!next });
      },
      (error) => {
        errLog("onValue error", error);
        setData(null);
      }
    );

    return () => {
      log("detach onValue", "/configure");
      unsubscribe();
    };
  }, [user?.uid]);

  // ------------------------
  // helpers / mutations
  // ------------------------
  function slugify(name) {
    return name
      .trim()
      .replace(/[.#$/\[\]/]/g, "")
      .replace(/\s+/g, "-");
  }

  async function updateList(panel, items) {
    if (!user?.uid) {
      warn("updateList blocked: no user");
      return;
    }

    const updatesObj = {};
    for (const [id, title, order] of items) {
      updatesObj[`configure/${panel}/items/${id}/title`] = title;
      updatesObj[`configure/${panel}/items/${id}/order`] = order;
    }

    await update(ref(db), updatesObj);
  }

  async function addItem(panel, title, order) {
    if (!user?.uid) {
      warn("addItem blocked: no user");
      return;
    }

    const noSpaces = panel.replace(" ", "-");
    const configRef = ref(db, `configure/${noSpaces}/items`);
    await push(configRef, { title, order });
  }

  async function addPanel(panelName) {
    if (!user?.uid) {
      warn("addPanel blocked: no user");
      return null;
    }

    const key = slugify(panelName);
    const snap = await get(ref(db, `configure/${key}`));
    if (snap.exists()) return key;

    await set(ref(db, `configure/${key}`), { title: panelName, items: {} });
    return key;
  }

  async function removePanel(panelName) {
    if (!user?.uid) {
      warn("removePanel blocked: no user");
      return;
    }
    await remove(ref(db, `configure/${panelName}`));
  }

  async function removeItem(panel, itemID) {
    if (!user?.uid) {
      warn("removeItem blocked: no user");
      return;
    }
    await remove(ref(db, `configure/${panel}/items/${itemID}`));
  }

  const value = useMemo(
    () => ({
      data,
      updateList,
      addPanel,
      removePanel,
      addItem,
      removeItem,
    }),
    [data]
  );

  return (
    <ConfigureContext.Provider value={value}>
      {children}
    </ConfigureContext.Provider>
  );
}

