import React, { useContext, useState, useEffect } from "react";
import { db } from "../../firebase.js";
import { set, ref, push, update, remove, onValue } from "firebase/database";
import { useAuth } from "./AuthContext.jsx";
import { getFunctions, httpsCallable } from "firebase/functions";

// TODO:
// Complete the typing and verify the functions for deleteUser, updateUser, and deactivateUser work correctly
// Complete a function to create the user an account, then use the uid created to map them to the user section with the rest of their info.
// Complete error handling
// Double check types and account for dynamically created types that could come from the config page
// Make sure that all static paramiters are valid and all dynamic types are placed into an object
// Figure out whether to store the uid as its own attribute or get it directly from the key.

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
  role: string;
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
  custom?: Record<string, CustomValue>;
}

type UserRecord = Record<string, User>;

const userContext = React.createContext<Value | undefined>(undefined);

export function useUser() {
  return useContext(userContext);
}

export interface Value {
  data: UserRecord;
  loading: boolean;
  error?: string;
  addUser: (userData: User) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  deactivateUser: (uid: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

export function UserProvider({ children }: any) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const value: Value = {
    data,
    loading,
    error,
    addUser,
    deleteUser,
    deactivateUser,
    updateUser,
  };

  useEffect(() => {
    const confRef = ref(db, "users");
    const unsubscribe = onValue(
      confRef,
      (snapshot) => {
        setData(snapshot.exists() ? snapshot.val() : {});
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  // Returns users email and password to be ised when creating the auth account
  function getEmailAndPassword(user: User) {
    return { email: user.email.trim(), password: user.password.trim() };
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
    try {
      const { email, password } = getEmailAndPassword(userData);
      const uid = await createUserAccount(email, password);
      await setUserRole(uid, userData.role);
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

  async function updateUser(user: User) {
    await update(ref(db, `users/${user.uid}`), user);
  }

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}
