import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração usando variáveis de ambiente
/*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
*/

// Use valores explícitos para debug
const firebaseConfig = {
  apiKey: "AIzaSyDIRFLERBT3g3OmZ4QKE25TSFb6xW04xgU",
  authDomain: "casadobiscoito-55734.firebaseapp.com",
  projectId: "casadobiscoito-55734",
  storageBucket: "casadobiscoito-55734.firebasestorage.app",
  messagingSenderId: "564773281342",
  appId: "1:564773281342:web:69a688992de1a87363bb6f",
  measurementId: "G-Y6H1SE64HZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);