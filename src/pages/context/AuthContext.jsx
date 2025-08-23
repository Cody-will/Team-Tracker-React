import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const value = {
    currentUser,
    signIn,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
