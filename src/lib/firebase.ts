import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace the placeholder values below with your own Firebase project's configuration.
// You can find these details in the Firebase console:
// Go to Project settings > General tab > Your apps > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "AIzaSyAKzCYpyXpbWfKZiuh2gs0i_7y0mQX3yF8",
  authDomain: "fir-todo-d8b30.firebaseapp.com",
  projectId: "fir-todo-d8b30",
  storageBucket: "fir-todo-d8b30.firebasestorage.app",
  messagingSenderId: "596832700226",
  appId: "1:596832700226:web:2b8de2288d0a88c8deeadb"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
