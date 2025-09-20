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
        setData(snapshot.exists() ? snapshot.val() : null);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
    return unsubscribe;
  }, []);

  function getEmailAndPassword(user: User) {
    return { email: user.email, password: user.password };
  }

  async function createUserAccount(
    email: string,
    password: string
  ): Promise<string> {
    const createAuthUser = httpsCallable(getFunctions(), "createAuthUser");
    const response = await createAuthUser({ email, password });
    return (response.data as { uid: string; created: boolean }).uid;
  }

  async function addUser(userData: User) {
    try {
      const { email, password } = getEmailAndPassword(userData);
      const uid = await createUserAccount(email, password);
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
    await remove(ref(db, `users/${uid}`));
  }

  async function deactivateUser(uid: string) {
    await update(ref(db, `users/${uid}`), { active: false });
  }

  async function updateUser(user: User) {
    await update(ref(db, `users/${user.uid}`), user);
  }

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}
