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
  runTransaction,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import type { FullMetadata, UploadTaskSnapshot } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "./AuthContext.jsx";
import type { Location } from "../Settings.js";
import {
  primaryAccentHex,
  secondaryAccentHex,
  backgroundImage,
  backgroundOptions,
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

export interface Value {
  data: UserRecord;
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

type UserBackground = {
  name: string;
  src: string;
  path: string;
  uploadedAt: number;
};

export type AddUserReturn = { success: boolean; message: string };

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

export interface DefaultSettings {
  primaryAccent: string;
  secondaryAccent: string;
  vacationAccent: string;
  swapAccent: string;
  coverageAccent: string;
  trainingAccent: string;
  bgImage: string;
}

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

const userContext = React.createContext<Value | undefined>(undefined);

export function useUser(): Value {
  const context = useContext(userContext);
  if (!context) {
    throw new Error("useUser must be inside <UserProvider>");
  }
  return context;
}

export function UserProvider({ children }: any) {
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

  const [view, setView] = useState<"ADC" | "UPD" | null>(null);

  const value: Value = {
    data,
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
  }, [userSettings]);

  // Main users listener: fills allUsers + per-division caches
  useEffect(() => {
    if (!currentUser) {
      // reset everything if logged out
      setData({});
      setAllUsers({});
      setUsersByDivision({ ADC: {}, UPD: {} });
      setUser(undefined);
      setUserSettings(null);

      setLoading(false);
      setUsersReady(false);
      setUserReady(false);
      setSettingsReady(false);
      setView(null);
      return;
    }

    setLoading(true);
    setUsersReady(false);

    const usersRef = ref(db, "users");

    const unsub = onValue(
      usersRef,
      (snap) => {
        const raw = (snap.val() || {}) as Record<string, User>;
        const checked = fixExpiredSick(raw);

        // single source of truth
        setAllUsers(checked);

        // pre-split by division ONCE per snapshot
        const adcEntries = Object.entries(checked).filter(
          ([, u]) => u.Divisions === "ADC"
        );
        const updEntries = Object.entries(checked).filter(
          ([, u]) => u.Divisions === "UPD"
        );

        setUsersByDivision({
          ADC: Object.fromEntries(adcEntries) as UserRecord,
          UPD: Object.fromEntries(updEntries) as UserRecord,
        });

        setLoading(false);
      },
      (err) => {
        console.error("users onValue error:", err);
        setError(err.message ?? "Failed to load users");
        setAllUsers({});
        setUsersByDivision({ ADC: {}, UPD: {} });
        setData({});
        setUsersReady(false);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  // Derived: data (visible users) based on currentUser + view
  useEffect(() => {
    if (!currentUser) {
      setData({});
      setUsersReady(false);
      return;
    }

    const uid = currentUser.uid;
    const current = allUsers[uid];

    // current user not yet loaded
    if (!current) {
      setData({});
      setUsersReady(false);
      return;
    }

    // no division -> they only ever see themselves
    if (!current.Divisions) {
      setData({ [uid]: current });
      setUsersReady(true);
      return;
    }

    // which division are we *viewing*?
    // view overrides, otherwise user's own division
    const division = (view ?? current.Divisions) as "ADC" | "UPD";

    const fromCache = usersByDivision[division] ?? {};

    setData(fromCache);
    setUsersReady(true);
  }, [allUsers, usersByDivision, view, currentUser]);

  // Derived: user object (DB user tied to auth)
  useEffect(() => {
    if (!currentUser) {
      setUser(undefined);
      setUserReady(false);
      return;
    }

    const uid = currentUser.uid;
    const cUser = allUsers[uid];

    setUser(cUser ?? undefined);
    setUserReady(!!cUser);
  }, [allUsers, currentUser]);

  // Derived: userSettings from user or defaults
  useEffect(() => {
    if (!user) {
      setUserSettings(null);
      setSettingsReady(false);
      return;
    }

    if (!user.settings) {
      setUserSettings({
        ...defaultSettings,
        backgrounds: undefined,
      });
      setSettingsReady(true);
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
  }, [user]);

  function fixExpiredSick(
    raw: Record<string, User>,
    now = Date.now()
  ): Record<string, User> {
    const result: Record<string, User> = {};

    for (const [uid, user] of Object.entries(raw)) {
      let fixed: User = { ...user };

      if (fixed.sick && fixed.sickExpires && fixed.sickExpires <= now) {
        fixed = {
          ...fixed,
          sick: false,
          sickExpires: null,
        };
        // fire-and-forget; don't await inside loop
        updateAfterDrag(uid, "sick", false);
        updateAfterDrag(uid, "sickExpires", null);
      }

      result[uid] = fixed;
    }

    return result;
  }

  // Returns users email and password to be used when creating the auth account
  function getEmailAndPassword(user: User) {
    return { email: user.email.trim(), password: user.password.trim() };
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

  function usersWithoutShift(shift: string): UserWithShift[] | void {
    if (!data) return;
    const usersArr = Object.values(data) as UserWithShift[];
    return usersArr.filter((user) => user?.shift != shift);
  }

  async function updateAfterDrag(
    uid: string,
    field: string,
    dataVal: string | boolean | null | number
  ) {
    try {
      await update(ref(db, `users/${uid}`), { [field]: dataVal });
      return { success: true, message: "Sucess" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async function updateUserBackground({
    uid,
    type,
    name,
    src,
    path,
  }: UpdateBackground): Promise<string> {
    const dbRef = `users/${uid}/settings/${type}`;
    await push(ref(db, dbRef), { name, src, path, uploadedAt: Date.now() });
    return src;
  }

  async function createUserAccount(
    email: string,
    password: string
  ): Promise<string> {
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
      console.error("addUser failed:", e);
      return { success: false, message: "Failed" };
    }
  }

  async function deleteUser(uid: string) {
    try {
      await deleteUserAccount(uid);
      await remove(ref(db, `users/${uid}`));
    } catch (e) {
      console.error("deleteUser failed: ", e);
      throw e;
    }
  }

  async function deactivateUser(uid: string) {
    try {
      const disabled = true;
      await disableUser(uid, disabled);
      await update(ref(db, `users/${uid}`), { active: false });
    } catch (e) {
      console.error("deactivateUser failed: ", e);
      throw e;
    }
  }

  async function updateUser(
    uid: string,
    formData: FormValues
  ): Promise<UpdateUserResult> {
    const setRole = httpsCallable(getFunctions(), "setUserRole");

    try {
      if (data[uid].Role !== formData.Role) {
        await setRole({ uid, role: formData.Role });
      }

      await update(ref(db, `users/${uid}`), formData);

      return { success: true };
    } catch (err: any) {
      console.error("updateUser failed:", err);

      let source: "role" | "profile" = "profile";
      let code: string | undefined = err?.code;
      let message = "Failed to update user.";

      if (typeof err?.code === "string" && err.code.startsWith("functions/")) {
        source = "role";

        if (err.details?.originalMessage) {
          message = err.details.originalMessage;
        } else if (err.message) {
          message = err.message;
        }
      } else {
        if (err?.message) {
          message = err.message;
        }
      }

      return {
        success: false,
        source,
        code,
        message,
      };
    }
  }

  async function updateUserSettings(
    uid: string,
    location: Location,
    value: string
  ) {
    const updates = { [`users/${uid}/settings/${location}`]: value };
    try {
      await update(ref(db), updates);
    } catch (e) {
      console.error("updateUserSettings failed: ", e);
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
      console.warn("Could not read old photo path:", e);
    }

    const storagePath = `users/${uid}/avatars/${Date.now()}_${file.name}`;
    const objectRef = storageRef(storage, storagePath);
    const upload = uploadBytesResumable(objectRef, file, {
      contentType: file.type,
    });

    await new Promise<void>((resolve, reject) => {
      const unsub = upload.on(
        "state_changed",
        (snap) => onProgress?.(snap),
        (err) => {
          unsub();
          reject(err);
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
        console.warn("Delete old profile photo skipped:", e);
      }
    }

    return { src, path: storagePath };
  }

  async function removeProfilePhoto(uid: string): Promise<void> {
    if (!uid) throw new Error("removeProfilePhoto: uid is required");

    try {
      const pathSnap = await get(ref(db, `users/${uid}/photo/path`));
      const oldPath = pathSnap.exists()
        ? (pathSnap.val() as string)
        : undefined;

      if (oldPath) {
        try {
          await deleteObject(storageRef(storage, oldPath));
        } catch (e) {
          console.warn("Delete profile photo skipped:", e);
        }
      }
    } finally {
      await update(ref(db), { [`users/${uid}/photo`]: null });
    }
  }

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}
