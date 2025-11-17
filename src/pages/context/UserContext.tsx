import React, { useContext, useState, useEffect, SetStateAction } from "react";
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
  badge: string;
  Shifts: string;
  car: string;
  Role: string;
  oic: boolean;
  fto: boolean;
  mandate: boolean;
  Ranks: string;
  photo?: Photo;
  trainee: boolean;
  firearms?: boolean;
  trainer?: string;
  phase?: string;
  pit: boolean;
  speed: boolean;
  rifle: boolean;
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
  userSettings: UserSettings;
  addUser: (userData: User) => Promise<void>;
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
}

type UserBackground = {
  name: string;
  src: string;
  path: string;
  uploadedAt: number;
};
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
  const defaultSettings: DefaultSettings = {
    primaryAccent: primaryAccentHex,
    secondaryAccent: secondaryAccentHex,
    vacationAccent: primaryAccentHex,
    swapAccent: primaryAccentHex,
    trainingAccent: primaryAccentHex,
    coverageAccent: primaryAccentHex,
    bgImage: backgroundImage,
  };
  const [userSettings, setUserSettings] = useState<
    UserSettings | DefaultSettings
  >(defaultSettings);
  const { currentUser } = useAuth();
  const [error, setError] = useState<string | undefined>(undefined);
  const value: Value = {
    data,
    loading,
    error,
    user,
    userSettings,
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
  };

  useEffect(() => {
    const color = userSettings?.primaryAccent || "#0ea5e9";
    document.documentElement.style.setProperty("--accent", color);
  }, [userSettings?.primaryAccent]);

  // Use effect to get the user data from the users section of the database
  useEffect(() => {
    const confRef = ref(db, "users");
    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        setData(snapshot.exists() ? (snapshot.val() as UserRecord) : {});
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  // This useEffect sets the user: Database to the currentUser: Auth by using the auth UID and linking it to users uid
  useEffect(() => {
    if (!currentUser) return;
    const uid: string = currentUser.uid;
    const cUser = data[uid];
    setUser(cUser ?? null);
  }, [data, currentUser]);

  // This useEffect sets the userSettings to either default or the users settings if the user has changed their settings
  useEffect(() => {
    if (!user) return;
    const { primaryAccent, secondaryAccent, bgImage } = defaultSettings;
    const settings = {
      primaryAccent: user.settings?.primaryAccent ?? primaryAccent,
      secondaryAccent: user.settings?.secondaryAccent ?? secondaryAccent,
      trainingAccent: user.settings?.trainingAccent ?? primaryAccent,
      coverageAccent: user.settings?.coverageAccent ?? primaryAccent,
      swapAccent: user.settings?.swapAccent ?? primaryAccent,
      vacationAccent: user.settings?.vacationAccent ?? primaryAccent,
      bgImage: user.settings?.bgImage ?? bgImage,
      backgrounds: user.settings?.backgrounds ?? undefined,
    };
    setUserSettings(settings);
  }, [user]);

  // Returns users email and password to be used when creating the auth account
  function getEmailAndPassword(user: User) {
    return { email: user.email.trim(), password: user.password.trim() };
  }

  // This function will handle uploading the users background image, may also make it to handle
  // uploading the users profile photo also.
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
    const users = Object.values(data) as UserWithShift[];
    return users.filter((user) => user?.shift != shift);
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

  // This functions calls the service worker on the server to create the users account
  // using the Admin SDK, so the admin can create the user without being logged
  // in as the new user afterwards
  async function createUserAccount(
    email: string,
    password: string
  ): Promise<string> {
    const createAuthUser = httpsCallable(getFunctions(), "createAuthUser");
    const response = await createAuthUser({ email, password });
    return (response.data as { uid: string; created: boolean }).uid;
  }

  // This function calls the service worker on the server to delete the users auth account
  // using the Admin SDK
  async function deleteUserAccount(uid: string): Promise<boolean> {
    const deleteAuthUser = httpsCallable(getFunctions(), "deleteAuthUser");
    const response = await deleteAuthUser({ uid });
    return (response.data as { ok: boolean }).ok;
  }

  // This function calls the service worker on the server to set the users role
  async function setUserRole(uid: string, role: string): Promise<boolean> {
    const setRole = httpsCallable(getFunctions(), "setUserRole");
    const response = await setRole({ uid, role });
    return (response.data as { complete: boolean }).complete;
  }

  // This function disables the users auth account by calling the service worker
  // that is using the Admin SDK, the service worker takes a disabled argument
  // but the function calling this function has an active argument, so when
  // calling this function active === false, but disabled === true, so this function
  // will send !active / !disabled to the database
  async function disableUser(uid: string, disabled: boolean) {
    const setDisabled = httpsCallable(getFunctions(), "setDisabled");
    const response = await setDisabled({ uid, disabled });
    return (response.data as { uid: string; disabled: boolean }).disabled;
  }

  // This function calls the function to create the users auth account, then
  // adds the users properties to the user section of the database under the returned
  // UID the user gets when their auth account gets created
  async function addUser(userData: User) {
    console.log(userData);
    console.log("Role: ", userData.Role);
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
      });
    } catch (e) {
      console.error("addUser failed:", e);
      throw e;
    }
  }

  // This function completely deletes the users auth account and user info
  async function deleteUser(uid: string) {
    try {
      await deleteUserAccount(uid);
      await remove(ref(db, `users/${uid}`));
    } catch (e) {
      console.error("deleteUser failed: ", e);
      throw e;
    }
  }

  // This function deactivated the user, but keeps their auth account and user info
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
      // 1) Update role if it changed
      if (data[uid].Role !== formData.Role) {
        // NOTE: callable takes an object, not (uid, role)
        await setRole({ uid, role: formData.Role });
      }

      // 2) Update user record in Realtime DB
      await update(ref(db, `users/${uid}`), formData);

      return { success: true };
    } catch (err: any) {
      console.error("updateUser failed:", err);

      // Default values
      let source: "role" | "profile" = "profile";
      let code: string | undefined = err?.code;
      let message = "Failed to update user.";

      // Detect if this came from the callable (functions/...)
      if (typeof err?.code === "string" && err.code.startsWith("functions/")) {
        source = "role";

        // Prefer the original message if you passed it via details
        if (err.details?.originalMessage) {
          message = err.details.originalMessage;
        } else if (err.message) {
          message = err.message;
        }
      } else {
        // Probably a DB error or something else on the client
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

  // This function will update the users settings in the database
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

  /**
   * Uploads a new profile photo, then deletes the old one (if any),
   * and stores { src, path } at users/{uid}/photo.
   * Old photo stays in place until the new one is uploaded + saved.
   */
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

    // 1) Read the previous photo path (but don't delete yet)
    let oldPath: string | undefined;
    try {
      const pathSnap = await get(ref(db, `users/${uid}/photo/path`));
      oldPath = pathSnap.exists() ? (pathSnap.val() as string) : undefined;
    } catch (e) {
      console.warn("Could not read old photo path:", e);
    }

    // 2) Upload the new file
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

    // 3) Get URL and persist { src, path } on the user
    const src = await getDownloadURL(objectRef);
    await update(ref(db, `users/${uid}/photo`), { src, path: storagePath });

    // 4) Now that the new one is live, delete the old one (if any)
    if (oldPath) {
      try {
        await deleteObject(storageRef(storage, oldPath));
      } catch (e) {
        console.warn("Delete old profile photo skipped:", e);
      }
    }

    return { src, path: storagePath };
  }

  /**
   * Removes the user's current profile photo:
   * - deletes the Storage object using saved path (if found)
   * - clears `users/{uid}/photo`
   */
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
      // Clear DB entry regardless of delete outcome
      await update(ref(db), { [`users/${uid}/photo`]: null });
    }
  }

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}
