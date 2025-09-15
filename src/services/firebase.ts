import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase para Verbix
// Proyecto: verbix-3de1f
const firebaseConfig = {
  apiKey: "AIzaSyD4EyuOTbn8_omubNyKrFhNfXJ8JtsRbVE",
  authDomain: "verbix-3de1f.firebaseapp.com",
  projectId: "verbix-3de1f",
  storageBucket: "verbix-3de1f.firebasestorage.app",
  messagingSenderId: "566032696373",
  appId: "1:566032696373:web:05692be05dd8e155badd7c",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
const auth = getAuth(app);

// Inicializar Firestore
const db = getFirestore(app);

// Inicializar Analytics (opcional)
// const analytics = getAnalytics(app);

export { app, auth, db };
export default app;
