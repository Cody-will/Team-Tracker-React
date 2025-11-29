// src/pages/context/VersionContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { APP_VERSION } from "../../version";

type VersionContextValue = {
  appVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
};

const VersionContext = createContext<VersionContextValue | undefined>(
  undefined
);

export function useAppVersion(): VersionContextValue {
  const ctx = useContext(VersionContext);
  if (!ctx) {
    throw new Error("useAppVersion must be used inside <VersionProvider>");
  }
  return ctx;
}

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const versionRef = ref(db, "meta/appVersion");

    const unsub = onValue(versionRef, (snap) => {
      const latest = snap.val() as string | null;
      setLatestVersion(latest);

      if (latest && latest !== APP_VERSION) {
        setUpdateAvailable(true);
      } else {
        setUpdateAvailable(false);
      }
    });

    return () => unsub();
  }, []);

  const value: VersionContextValue = {
    appVersion: APP_VERSION,
    latestVersion,
    updateAvailable,
  };

  return (
    <VersionContext.Provider value={value}>{children}</VersionContext.Provider>
  );
}
