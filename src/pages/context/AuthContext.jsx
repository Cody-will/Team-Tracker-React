import React, { useContext, useState, useEffect, useCallback } from "react";
import { auth } from "../../firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  onIdTokenChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [claims, setClaims] = useState(null);
  const [forceSplash, setForceSplash] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // This function can be used to dynamically display parts of the UI based on role
  function isAdmin() {
    // avoid crashes when claims is null
    return claims?.role === "admin";
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
      } else {
        setClaims(null);
      }
      setAuthReady(true);
    });

    return unsub;
  }, []);

  // Fallback listener (you can keep this for extra safety / legacy)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  async function resetPassword(email) {
    if (!email) {
      throw new Error("Must be agency email!");
    }
    await sendPasswordResetEmail(auth, email);
  }

  async function signIn(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user.uid;
    } catch (error) {
      // Normalize "user not found" into a custom error code your UI can detect
      if (error && error.code === "auth/user-not-found") {
        const customError = new Error("USER_NOT_FOUND");
        customError.code = "USER_NOT_FOUND";
        throw customError;
      }

      // Re-throw all other auth errors as-is
      throw error;
    }
  }

  const value = {
    currentUser,
    claims,
    isAdmin,
    signIn,
    resetPassword,
    authReady,
    refreshClaims,
    forceSplash,
    setForceSplash,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
