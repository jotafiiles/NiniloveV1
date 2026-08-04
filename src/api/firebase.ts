import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDOFRyEXb39Hi_hRl_1YP6j3-Pv_BFUsYY",
  authDomain: "ninilove-dbbe6.firebaseapp.com",
  databaseURL: "https://ninilove-dbbe6-default-rtdb.firebaseio.com",
  projectId: "ninilove-dbbe6",
  storageBucket: "ninilove-dbbe6.firebasestorage.app",
  messagingSenderId: "978378005415",
  appId: "1:978378005415:web:2a9bc0266e2a999546b482",
  measurementId: "G-PFVPJQN469"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
