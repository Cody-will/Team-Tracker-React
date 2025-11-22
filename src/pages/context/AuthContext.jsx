import { useContext, useState, useEffect, useCallback } from "react";
import * as React from "react";
import { auth } from "../../firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  onIdTokenChanged,
} from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [claims, setClaims] = useState(null);
  const value = {
    currentUser,
    isAdmin,
    signIn,
  };

  // This function can be used to dynamically display parts of the UI based on role
  function isAdmin() {
    return claims.role === "admin";
  }

  const refreshClaims = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) return null;
    await u.getIdToken(true);
    const res = await u.getIdTokenResult();
    setClaims(res.claims);
    return res.claims;
  }, []);

  // Keep user & claims updated automatically
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        const res = await u.getIdTokenResult();
        setClaims(res.claims);
        console.log(res.claims);
      } else {
        setClaims(null);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  async function signIn(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user.uid;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
