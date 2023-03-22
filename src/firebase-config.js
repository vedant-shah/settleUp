import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbWuja_DpAJXna-4f42hLdh0cvE07IUsA",
  authDomain: "settleup-2c61f.firebaseapp.com",
  projectId: "settleup-2c61f",
  storageBucket: "settleup-2c61f.appspot.com",
  messagingSenderId: "251931784146",
  appId: "1:251931784146:web:3e46059d3a3a49a7620e0b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
