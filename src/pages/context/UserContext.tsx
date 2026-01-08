
import { useContext, useState, useEffect, SetStateAction } from "react";
import * as React from "react";
import { db, storage } from "../../firebase.js";
import {
  set,
  ref,
  get,
  push,
  update,
  remove,
  onValue,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import type { UploadTaskSnapshot } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "./AuthContext.jsx";
import type { Location } from "../Settings.js";
import {
  primaryAccentHex,
  secondaryAccentHex,
  backgroundImage,
} from "../../colors.jsx";
import type { FormValues } from "../../components/EditForm.tsx";

type CustomValue = string | number | boolean | null;
type Photo = { src: string; path: string };

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  secondPhone?: string;
  badge: string;
  Shifts: string;
  car: string;
  Role: string;
  oic: boolean;
  fto: boolean;
  sick: boolean;
  sickExpires?: number | null;
  mandate: boolean;
  Ranks: string;
  photo?: Photo;
  ftoList?: boolean;
  jailSchool?: boolean;
  SpecialRoles?: string;
  isMandated: boolean;
  trainee: boolean;
  Divisions?: string;
  firearms?: boolean;
  trainer?: string;
  phase?: string;
  pit: boolean;
  speed: boolean;
  rifle: boolean;
  medical: boolean;
  active: boolean;
  settings?: UserSettings;
  custom?: Record<string, CustomValue>;
}

export type UserRecord = Record<string, User>;

export interface UserSettings {
  primaryAccent: string;
  secondaryAccent: string;
  trainingAccent: string;
  swapAccent: string;
  coverageAccent: string;
  vacationAccent: string;
  bgImage: string;
  backgrounds?: UserBackground | Record<string, UserBackground>;
}

type UserBackground = {
  name: string;
  src: string;
  path: string;
  uploadedAt: number;
};

export interface DefaultSettings {
  primaryAccent: string;
  secondaryAccent: string;
  vacationAccent: string;
  swapAccent: string;
  coverageAccent: string;
  trainingAccent: string;
  bgImage: string;
}

export type AddUserReturn = { success: boolean; message: string };

export type UpdateUserResult =
  | { success: true }
  | {
      success: false;
      source: "role" | "profile";
      code?: string;
      message: string;
    };

export type UploadArguments = {
  uid: string;
  file: File;
  name: string;
  type: "backgrounds" | "avatars";
  handleProgress: (snapshot: UploadTaskSnapshot) => void;
};

export type UploadResult = {
  src: string;
  path: string;
};

export type UpdateBackground = {
  uid: string;
  type: "backgrounds" | "avatars";
  name: string;
  src: string;
  path: string;
};

export type View = "ADC" | "UPD" | null;

type UserWithShift = User & { shift: string };

export interface Value {
  data: UserRecord;
  allUsers: UserRecord;
  loading: boolean;
  error?: string;
  user?: User;
  userSettings: UserSettings | null;
  defaultSettings: DefaultSettings;
  userReady: boolean;
  usersReady: boolean;
  settingsReady: boolean;
  view: View;
  setView: React.Dispatch<SetStateAction<View>>;
  addUser: (userData: User) => Promise<AddUserReturn>;
  deleteUser: (uid: string) => Promise<void>;
  deactivateUser: (uid: string) => Promise<void>;
  updateUser: (uid: string, formData: FormValues) => Promise<UpdateUserResult>;
  updateUserSettings: (
    uid: string,
    location: Location,
    value: string
  ) => Promise<void>;
  uploadPhoto: ({
    uid,
    file,
    name,
    type,
    handleProgress,
  }: UploadArguments) => Promise<UploadResult>;
  updateUserBackground: ({
    uid,
    type,
    name,
    src,
    path,
  }: UpdateBackground) => Promise<string>;
  usersWithoutShift: (shift: string) => UserWithShift[] | void;
  setProfilePhoto: (args: {
    uid: string;
    file: File;
    onProgress?: (snapshot: UploadTaskSnapshot) => void;
  }) => Promise<{ src: string; path: string }>;
  removeProfilePhoto: (uid: string) => Promise<void>;
  updateAfterDrag: (
    uid: string,
    field: string,
    data: string | boolean | null | number
  ) => Promise<AddUserReturn>;
}

const userContext = React.createContext<Value | undefined>(undefined);

export function useUser(): Value {
  const context = useContext(userContext);
  if (!context) throw new Error("useUser must be inside <UserProvider>");
  return context;
}

export function UserProvider({ children }: any) {
  // ===== DEBUG TOGGLES =====
  const DEBUG = true; // set false when done
  const log = (...args: any[]) => DEBUG && console.log("[UserProvider]", ...args);
  const warn = (...args: any[]) => DEBUG && console.warn("[UserProvider]", ...args);
  const errLog = (...args: any[]) => DEBUG && console.error("[UserProvider]", ...args);

  const [data, setData] = useState<UserRecord>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>();
  const [usersReady, setUsersReady] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);

  const defaultSettings: DefaultSettings = {
    primaryAccent: primaryAccentHex,
    secondaryAccent: secondaryAccentHex,
    vacationAccent: primaryAccentHex,
    swapAccent: primaryAccentHex,
    trainingAccent: primaryAccentHex,
    coverageAccent: primaryAccentHex,
    bgImage: backgroundImage,
  };

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const { currentUser } = useAuth();
  const [error, setError] = useState<string | undefined>(undefined);

  // Single source of truth for all users from DB
  const [allUsers, setAllUsers] = useState<UserRecord>({});

  // Per-division caches so toggling view is cheap
  const [usersByDivision, setUsersByDivision] = useState<{
    ADC: UserRecord;
    UPD: UserRecord;
  }>({ ADC: {}, UPD: {} });

  const [view, setView] = useState<View>(null);

  // ---- DIAGNOSTIC snapshot of state each render (optional, can be noisy)
  useEffect(() => {
    if (!DEBUG) return;
    log("render snapshot", {
      auth: !!currentUser,
      uid: currentUser?.uid,
      loading,
      usersReady,
      userReady,
      settingsReady,
      view,
      allUsersCount: Object.keys(allUsers).length,
      adcCount: Object.keys(usersByDivision.ADC).length,
      updCount: Object.keys(usersByDivision.UPD).length,
      dataCount: Object.keys(data).length,
      hasUser: !!user,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEBUG, currentUser, loading, usersReady, userReady, settingsReady, view, allUsers, usersByDivision, data, user]);

  const value: Value = {
    data,
    allUsers,
    loading,
    error,
    user,
    userSettings,
    defaultSettings,
    usersReady,
    userReady,
    settingsReady,
    view,
    setView,
    addUser,
    deleteUser,
    deactivateUser,
    updateUser,
    updateUserSettings,
    uploadPhoto,
    updateUserBackground,
    usersWithoutShift,
    setProfilePhoto,
    removeProfilePhoto,
    updateAfterDrag,
  };

  // Apply accent color to :root
  useEffect(() => {
    if (!userSettings) return;
    const color = userSettings.primaryAccent || "#0ea5e9";
    document.documentElement.style.setProperty("--accent", color);
    log("accent applied", color);
  }, [userSettings]);

  // Utility: division rule
  const isADC = (u: User) => {
    if (u?.Divisions === "ADC") return true;
    if (u?.Ranks === "Sheriff") return true;
    return false;
  };

  // Fix expired sick (unchanged, but with logs)
  function fixExpiredSick(raw: Record<string, User>, now = Date.now()): Record<string, User> {
    const result: Record<string, User> = {};

    for (const [uid, u] of Object.entries(raw)) {
      let fixed: User = { ...u };

      if (fixed.sick && fixed.sickExpires && fixed.sickExpires <= now) {
        fixed = { ...fixed, sick: false, sickExpires: null };
        // fire-and-forget; don't await inside loop
        updateAfterDrag(uid, "sick", false);
        updateAfterDrag(uid, "sickExpires", null);
        warn("sick expired auto-fix", { uid, wasExpires: u.sickExpires });
      }

      result[uid] = fixed;
    }

    return result;
  }

  // ===== 1) Main users listener: fills allUsers + per-division caches =====

useEffect(() => {
  const uid = currentUser?.uid;

  if (!uid) {
    log("AUTH: no uid -> resetting provider state");
    setData({});
    setAllUsers({});
    setUsersByDivision({ ADC: {}, UPD: {} });
    setUser(undefined);
    setUserSettings(null);
    setError(undefined);

    setLoading(false);
    setUsersReady(false);
    setUserReady(false);
    setSettingsReady(false);
    setView(null);
    return;
  }

  log("AUTH: uid present -> attach /users listener", { uid });

  setLoading(true);
  setUsersReady(false);
  setError(undefined);

  const usersRef = ref(db, "users");
  let didFirstSnapshot = false;

  const unsub = onValue(
    usersRef,
    (snap) => {
      didFirstSnapshot = true;

      const raw = (snap.val() || {}) as Record<string, User>;
      const checked = fixExpiredSick(raw);

      log("DB: /users snapshot", {
        totalUsers: Object.keys(raw).length,
        includesCurrent: !!checked[uid],
      });

      setAllUsers(checked);

      const adcEntries = Object.entries(checked).filter(([, u]) => isADC(u));
      const updEntries = Object.entries(checked).filter(([, u]) => u?.Divisions === "UPD");

      const adcMap = Object.fromEntries(adcEntries) as UserRecord;
      const updMap = Object.fromEntries(updEntries) as UserRecord;

      setUsersByDivision({ ADC: adcMap, UPD: updMap });

      setLoading(false);
    },
    (e) => {
      didFirstSnapshot = true;
      errLog("DB: /users onValue error", e);

      setError(e?.message ?? "Failed to load users");
      setAllUsers({});
      setUsersByDivision({ ADC: {}, UPD: {} });
      setData({});
      setUsersReady(false);
      setLoading(false);
    }
  );

  // Optional: if something goes wrong and we never get the first callback,
  // don’t block the entire app forever.
  const t = window.setTimeout(() => {
    if (!didFirstSnapshot) {
      warn("DB: /users first snapshot timeout -> releasing loading gate");
      setLoading(false);
    }
  }, 6000);

  return () => {
    window.clearTimeout(t);
    log("DB: detach /users listener", { uid });
    unsub();
  };
}, [currentUser?.uid]); // ✅ key off uid only

  // ===== 2) Derived: user object (DB user tied to auth) =====
  useEffect(() => {
    if (!currentUser) {
      setUser(undefined);
      setUserReady(false);
      log("DERIVE user: no auth -> cleared");
      return;
    }

    const uid = currentUser.uid;
    const cUser = allUsers[uid];

    setUser(cUser ?? undefined);
    setUserReady(!!cUser);

    if (!cUser) {
      warn("DERIVE user: currentUser not found in allUsers yet", {
        uid,
        allUsersCount: Object.keys(allUsers).length,
      });
    } else {
      log("DERIVE user: loaded", { uid, division: cUser.Divisions, rank: cUser.Ranks });
    }
  }, [allUsers, currentUser]);

  // ===== 3) Initialize view ONCE when user becomes known (prevents race) =====
  useEffect(() => {
    if (!user?.Divisions) return;
    const div = user.Divisions == "Ghost" ? "ADC" : user.Divisions

    setView((prev) => {
      const next = prev ?? (div as "ADC" | "UPD");
      if (prev == null) log("VIEW: initialized", { view: next, fromDivision: user.Divisions });
      return next;
    });
  }, [user]);

  // ===== 4) Derived: visible data based on view + caches =====
  useEffect(() => {
    if (!currentUser) {
      setData({});
      setUsersReady(false);
      log("DERIVE data: no auth -> cleared");
      return;
    }

    const uid = currentUser.uid;
    const current = allUsers[uid];

    if (!current) {
      setData({});
      setUsersReady(false);
      warn("DERIVE data: waiting for current user record in allUsers", { uid });
      return;
    }

    // no division -> only themselves
    if (!current.Divisions) {
      setData({ [uid]: current });
      setUsersReady(true);
      log("DERIVE data: no division -> self only", { uid });
      return;
    }

    const division = (view ?? current.Divisions) as "ADC" | "UPD";
    const fromCache = usersByDivision[division];

    // IMPORTANT: don't claim ready if cache empty on first login
    const cacheSize = fromCache ? Object.keys(fromCache).length : 0;

    if (!fromCache || cacheSize === 0) {
      setUsersReady(false);
      warn("DERIVE data: division cache not ready yet", {
        division,
        view,
        userDivision: current.Divisions,
        adcCount: Object.keys(usersByDivision.ADC).length,
        updCount: Object.keys(usersByDivision.UPD).length,
      });
      return;
    }

    setData(fromCache);
    setUsersReady(true);

    log("DERIVE data: populated", { division, count: cacheSize });
  }, [allUsers, usersByDivision, view, currentUser]);

  // ===== 5) Derived: userSettings from user or defaults =====
  useEffect(() => {
    if (!user) {
      setUserSettings(null);
      setSettingsReady(false);
      warn("SETTINGS: waiting for user");
      return;
    }

    if (!user.settings) {
      setUserSettings({ ...defaultSettings, backgrounds: undefined });
      setSettingsReady(true);
      log("SETTINGS: user.settings missing -> using defaults");
      return;
    }

    const settings: UserSettings = {
      primaryAccent: user.settings.primaryAccent,
      secondaryAccent: user.settings.secondaryAccent,
      trainingAccent: user.settings.trainingAccent,
      coverageAccent: user.settings.coverageAccent,
      swapAccent: user.settings.swapAccent,
      vacationAccent: user.settings.vacationAccent,
      bgImage: user.settings.bgImage,
      backgrounds: user.settings.backgrounds ?? undefined,
    };

    setUserSettings(settings);
    setSettingsReady(true);
    log("SETTINGS: loaded from DB");
  }, [user]);

  // ======================
  // Your existing functions below (unchanged except minor logging safety)
  // ======================

  function usersWithoutShift(shift: string): UserWithShift[] | void {
    if (!data) return;
    const usersArr = Object.values(data) as UserWithShift[];
    return usersArr.filter((u) => u?.shift != shift);
  }

  async function updateAfterDrag(
    uid: string,
    field: string,
    dataVal: string | boolean | null | number
  ) {
    try {
      await update(ref(db, `users/${uid}`), { [field]: dataVal });
      return { success: true, message: "Sucess" };
    } catch (e: any) {
      errLog("updateAfterDrag failed", { uid, field, e });
      return { success: false, message: e.message };
    }
  }

  async function uploadPhoto({
    uid,
    file,
    name,
    type,
    handleProgress,
  }: UploadArguments): Promise<UploadResult> {
    const storagePath = `users/${uid}/${type}/${Date.now()}_${file.name}`;
    const objectRef = storageRef(storage, storagePath);
    const upload = uploadBytesResumable(objectRef, file, {
      contentType: file.type,
      customMetadata: { displayName: name },
    });

    await new Promise<void>((resolve, reject) => {
      const unsubscribe = upload.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => handleProgress(snapshot),
        (error) => {
          unsubscribe();
          reject(error);
        },
        () => {
          unsubscribe();
          resolve();
        }
      );
    });

    const src = await getDownloadURL(objectRef);
    return { src, path: storagePath };
  }

  async function updateUserBackground({
    uid,
    type,
    name,
    src,
    path,
  }: UpdateBackground): Promise<string> {
    const dbRefPath = `users/${uid}/settings/${type}`;
    await push(ref(db, dbRefPath), { name, src, path, uploadedAt: Date.now() });
    return src;
  }

  // Returns users email and password to be used when creating the auth account
  function getEmailAndPassword(u: User) {
    return { email: u.email.trim(), password: u.password.trim() };
  }

  async function createUserAccount(email: string, password: string): Promise<string> {
    const createAuthUser = httpsCallable(getFunctions(), "createAuthUser");
    const response = await createAuthUser({ email, password });
    return (response.data as { uid: string; created: boolean }).uid;
  }

  async function deleteUserAccount(uid: string): Promise<boolean> {
    const deleteAuthUser = httpsCallable(getFunctions(), "deleteAuthUser");
    const response = await deleteAuthUser({ uid });
    return (response.data as { ok: boolean }).ok;
  }

  async function setUserRole(uid: string, role: string): Promise<boolean> {
    const setRole = httpsCallable(getFunctions(), "setUserRole");
    const response = await setRole({ uid, role });
    return (response.data as { complete: boolean }).complete;
  }

  async function disableUser(uid: string, disabled: boolean) {
    const setDisabled = httpsCallable(getFunctions(), "setDisabled");
    const response = await setDisabled({ uid, disabled });
    return (response.data as { uid: string; disabled: boolean }).disabled;
  }

  async function addUser(userData: User): Promise<AddUserReturn> {
    try {
      const { email, password } = getEmailAndPassword(userData);
      const uid = await createUserAccount(email, password);
      await setUserRole(uid, userData.Role.toLowerCase());
      const { password: _omit, ...cleanData } = userData;
      const userRef = ref(db, `users/${uid}`);
      await set(userRef, {
        ...cleanData,
        uid,
        email,
        active: cleanData.active ?? true,
        createdAt: Date.now(),
        settings: { ...defaultSettings },
      });
      return { success: true, message: "Successful" };
    } catch (e) {
      errLog("addUser failed", e);
      return { success: false, message: "Failed" };
    }
  }

  async function deleteUser(uid: string) {
    try {
      await deleteUserAccount(uid);
      await remove(ref(db, `users/${uid}`));
    } catch (e) {
      errLog("deleteUser failed", e);
      throw e;
    }
  }

  async function deactivateUser(uid: string) {
    try {
      const disabled = true;
      await disableUser(uid, disabled);
      await update(ref(db, `users/${uid}`), { active: false });
    } catch (e) {
      errLog("deactivateUser failed", e);
      throw e;
    }
  }

  async function updateUser(uid: string, formData: FormValues): Promise<UpdateUserResult> {
    const setRoleFn = httpsCallable(getFunctions(), "setUserRole");

    try {
      // NOTE: safer guard: data[uid] might not be in current division view
      const existing = allUsers[uid];
      if (existing && existing.Role !== formData.Role) {
        await setRoleFn({ uid, role: formData.Role });
      }

      await update(ref(db, `users/${uid}`), formData);

      return { success: true };
    } catch (err: any) {
      errLog("updateUser failed", err);

      let source: "role" | "profile" = "profile";
      let code: string | undefined = err?.code;
      let message = "Failed to update user.";

      if (typeof err?.code === "string" && err.code.startsWith("functions/")) {
        source = "role";
        if (err.details?.originalMessage) message = err.details.originalMessage;
        else if (err.message) message = err.message;
      } else {
        if (err?.message) message = err.message;
      }

      return { success: false, source, code, message };
    }
  }

  async function updateUserSettings(uid: string, location: Location, value: string) {
    const updates = { [`users/${uid}/settings/${location}`]: value };
    try {
      await update(ref(db), updates);
    } catch (e) {
      errLog("updateUserSettings failed", e);
      throw e;
    }
  }

  async function setProfilePhoto({
    uid,
    file,
    onProgress,
  }: {
    uid: string;
    file: File;
    onProgress?: (snapshot: UploadTaskSnapshot) => void;
  }): Promise<{ src: string; path: string }> {
    if (!uid) throw new Error("setProfilePhoto: uid is required");
    if (!file) throw new Error("setProfilePhoto: file is required");

    let oldPath: string | undefined;
    try {
      const pathSnap = await get(ref(db, `users/${uid}/photo/path`));
      oldPath = pathSnap.exists() ? (pathSnap.val() as string) : undefined;
    } catch (e) {
      warn("Could not read old photo path", e);
    }

    const storagePath = `users/${uid}/avatars/${Date.now()}_${file.name}`;
    const objectRef = storageRef(storage, storagePath);
    const upload = uploadBytesResumable(objectRef, file, { contentType: file.type });

    await new Promise<void>((resolve, reject) => {
      const unsub = upload.on(
        "state_changed",
        (snap) => onProgress?.(snap),
        (e) => {
          unsub();
          reject(e);
        },
        () => {
          unsub();
          resolve();
        }
      );
    });

    const src = await getDownloadURL(objectRef);
    await update(ref(db, `users/${uid}/photo`), { src, path: storagePath });

    if (oldPath) {
      try {
        await deleteObject(storageRef(storage, oldPath));
      } catch (e) {
        warn("Delete old profile photo skipped", e);
      }
    }

    return { src, path: storagePath };
  }

  async function removeProfilePhoto(uid: string): Promise<void> {
    if (!uid) throw new Error("removeProfilePhoto: uid is required");

    try {
      const pathSnap = await get(ref(db, `users/${uid}/photo/path`));
      const oldPath = pathSnap.exists() ? (pathSnap.val() as string) : undefined;

      if (oldPath) {
        try {
          await deleteObject(storageRef(storage, oldPath));
        } catch (e) {
          warn("Delete profile photo skipped", e);
        }
      }
    } finally {
      await update(ref(db), { [`users/${uid}/photo`]: null });
    }
  }

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}

