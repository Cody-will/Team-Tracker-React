import React, { useContext, useState, useEffect, SetStateAction } from "react";
import { db, storage } from "../../firebase.js";
import { set, ref, push, update, remove, onValue } from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import type { FullMetadata, UploadTaskSnapshot } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "./AuthContext.jsx";
import {
  primaryAccentHex,
  secondaryAccentHex,
  backgroundImage,
} from "../../colors.jsx";

// TODO:
// Complete the typing and verify the functions for deleteUser, updateUser, and deactivateUser work correctly
// Complete error handling
// Double check types and account for dynamically created types that could come from the config page
// Make sure that all static paramiters are valid and all dynamic types are placed into an object

type CustomValue = string | number | boolean | null;

export interface User {
  uid?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  badge: string;
  carNumber: string;
  Role: string;
  oic: boolean;
  fto: boolean;
  mandate: boolean;
  trainee: boolean;
  trainer?: string;
  phase?: string;
  pit: boolean;
  speed: boolean;
  rifle: boolean;
  active: boolean;
  settings?: UserSettings;
  custom?: Record<string, CustomValue>;
}

type UserRecord = Record<string, User>;

export interface Value {
  data: UserRecord;
  loading: boolean;
  error?: string;
  user?: User;
  userSettings: UserSettings;
  addUser: (userData: User) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  deactivateUser: (uid: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  updateUserSettings: (
    uid: string,
    settings: Partial<UserSettings>
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
  }: UpdateBackground) => Promise<boolean>;
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
  bgImage: string;
  backgrounds?: UserBackground | Record<string, UserBackground>;
}

export interface DefaultSettings {
  primaryAccent: string;
  secondaryAccent: string;
  bgImage: string;
}

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
  };

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
      bgImage: user.settings?.bgImage ?? bgImage,
      backgrounds: user.settings?.backgrounds ?? undefined,
    };
    setUserSettings(settings);
  }, [user]);

  // Returns users email and password to be ised when creating the auth account
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

  async function updateUserBackground({
    uid,
    type,
    name,
    src,
    path,
  }: UpdateBackground): Promise<boolean> {
    const dbRef = `users/${uid}/settings/${type}`;
    await push(ref(db, dbRef), { name, src, path, uploadedAt: Date.now() });
    return true;
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

  // THIS FUNCTION still needs to be completed, will complete this function
  // when re-coding the update user information on the team-management page
  async function updateUser(user: User) {
    await update(ref(db, `users/${user.uid}`), user);
  }

  // This function will update the users settings in the database
  async function updateUserSettings(
    uid: string,
    settings: Partial<UserSettings>
  ) {
    try {
      await update(ref(db, `users/${uid}/settings`), settings);
    } catch (e) {
      console.error("updateUserSettings failed: ", e);
      throw e;
    }
  }

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}
