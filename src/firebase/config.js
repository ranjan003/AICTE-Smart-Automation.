import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// AICTE Approval Automation - Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyADqZk7bBjMGSeDT1IAsI2u6XCEUSvS24s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aicte-automation.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aicte-automation",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aicte-automation.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "460064409760",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:460064409760:web:0c8aea26d2af5843dbe1c5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PCQKMJWM5T"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
