import React, { useContext, useState, useEffect } from "react";
import { db } from "../../firebase.js";
import { set, ref, push, onValue } from "firebase/database";

const ConfigureContext = React.createContext();

export function useConfigure() {
  return useContext(ConfigureContext);
}

export function ConfigureProvider({ children }) {
  const [data, setData] = useState();
  const value = {
    data,
    updateConfig,
  };

  useEffect(() => {
    const confRef = ref(db, "configure");
    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        setData(snapshot.exists() ? Object.values(snapshot.val()) : null);
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  function updateConfig(newData) {
    const configRef = ref(db, "configure");
    const entries = Object.entries(newData);
    set(configRef, { entries });
  }
  return (
    <ConfigureContext.Provider value={value}>
      {children}
    </ConfigureContext.Provider>
  );
}
