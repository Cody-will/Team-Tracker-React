// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getDatabase,
  ref,
  onValue,
  connectDatabaseEmulator,
} from "firebase/database";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVLR_BBkLw9oqNDmQ-lQyn-nams8SPOtw",
  authDomain: "team-tracker-8d615.firebaseapp.com",
  databaseURL: "https://team-tracker-8d615-default-rtdb.firebaseio.com",
  projectId: "team-tracker-8d615",
  storageBucket: "team-tracker-8d615.firebasestorage.app",
  messagingSenderId: "808179326359",
  appId: "1:808179326359:web:4f42e15e45b6f99dfb38d2",
  measurementId: "G-GPPMNXZEV7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const functions = getFunctions(app);
