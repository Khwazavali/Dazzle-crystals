// Firebase Core
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

// Firebase Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firestore Database
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9-_ADxrTxbclWGggetxcBJs8bPd2n0KI",
  authDomain: "dazzle-crystals.firebaseapp.com",
  projectId: "dazzle-crystals",
  storageBucket: "dazzle-crystals.firebasestorage.app",
  messagingSenderId: "596503346455",
  appId: "1:596503346455:web:c8dfe16e473a80723f4b52",
  measurementId: "G-HR8VL9T1JL",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };