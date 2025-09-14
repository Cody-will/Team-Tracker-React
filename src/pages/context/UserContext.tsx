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

// TODO:
// Complete the typing and verify the functions for deleteUser, updateUser, and deactivateUser work correctly
// Complete a function to create the user an account, then use the uid created to map them to the user section with the rest of their info.
// Complete error handling
// Double check types and account for dynamically created types that could come from the config page
// Make sure that all static paramiters are valid and all dynamic types are placed into an object

type CustomValue = string | number | boolean | null;

export interface User {
  uid?: string;
  firstName: string;
  lastName: string;
  email: string;
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
export function UserProvider({ children }) {
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

  async function addUser(userData: User) {
    const userRef = ref(db, "users");
    await push(userRef, userData);
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
