import { useContext, useState, useEffect } from "react";
import * as React from "react";
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
    updateList,
    addPanel,
    removePanel,
    addItem,
    removeItem,
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

  async function updateList(panel, data) {
    const updates = {};
    for (const [id, title, order] of data) {
      updates[`configure/${panel}/items/${id}/title`] = title;
      updates[`configure/${panel}/items/${id}/order`] = order;
    }
    await update(ref(db), updates);
  }

  /**
   * @param {String} panel
   * @param {String} title
   * @param {Number} order
   */
  async function addItem(panel, title, order) {
    const noSpaces = panel.replace(" ", "-");
    const configRef = ref(db, `configure/${noSpaces}/items`);
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
  async function removePanel(panelName) {
    await remove(ref(db, `configure/${panelName}`));
  }

  async function removeItem(panel, itemID) {
    await remove(ref(db, `configure/${panel}/items/${itemID}`));
  }

  return (
    <ConfigureContext.Provider value={value}>
      {children}
    </ConfigureContext.Provider>
  );
}
