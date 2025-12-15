// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqT9avXpR5JKUN-_EUZ2HDjWJ_yW4sClI",
  authDomain: "sunshineproperties-e2580.firebaseapp.com",
  projectId: "sunshineproperties-e2580",
  storageBucket: "sunshineproperties-e2580.firebasestorage.app",
  messagingSenderId: "698408887812",
  appId: "1:698408887812:web:1f7c4367a69680ca4b3751",
  measurementId: "G-154GFEH0JK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, analytics };