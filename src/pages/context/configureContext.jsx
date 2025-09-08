import React, { useContext, useState, useEffect } from "react";
import { db } from "../../firebase.js";
import {
  set,
  ref,
  get,
  push,
  update,
  remove,
  onValue,
} from "firebase/database";

const ConfigureContext = React.createContext();

export function useConfigure() {
  return useContext(ConfigureContext);
}

export function ConfigureProvider({ children }) {
  const [data, setData] = useState();
  const value = {
    data,
    updatePanel,
    addPanel,
    deletePanel,
    addItem,
  };

  useEffect(() => {
    const confRef = ref(db, "configure");
    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        setData(snapshot.exists() ? snapshot.val() : null);
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  /**
   *
   * @param {String} name
   * @returns
   */
  function slugify(name) {
    return name
      .trim()
      .replace(/[.#$/\[\]/]/g, "")
      .replace(/\s+/g, "-");
  }

  function updatePanel(panel, data) {
    const configRef = ref(db, "configure/" + panel);
    set(configRef, data);
  }

  /**
   * @param {String} panel
   * @param {String} title
   * @param {Number} order
   */
  async function addItem(panel, title, order) {
    const configRef = ref(db, `configure/${panel}/items`);
    await push(configRef, { title, order });
  }

  /**
   * @param {String} panelName
   * @return
   */
  async function addPanel(panelName) {
    const key = slugify(panelName);
    const snap = await get(ref(db, `configure/${key}`));
    if (snap.exists()) return key;
    await set(ref(db, `configure/${key}`), { title: panelName, items: {} });
  }

  /**
   *
   * @param {String} panelName
   */
  function deletePanel(panelName) {
    const configRef = ref(db, "configure/" + panelName);
    remove(configRef);
  }
  return (
    <ConfigureContext.Provider value={value}>
      {children}
    </ConfigureContext.Provider>
  );
}
