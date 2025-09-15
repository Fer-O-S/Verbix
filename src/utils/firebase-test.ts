// 🧪 Archivo temporal para probar Firebase
// Eliminar después de las pruebas

import { auth } from "@/services/firebase";

export const testFirebaseConnection = () => {
  console.log("🔥 Testing Firebase connection...");
  console.log("Auth instance:", auth);
  console.log("Auth currentUser:", auth.currentUser);
  console.log("Auth config:", auth.config);

  // Test básico
  if (auth) {
    console.log("✅ Firebase Auth está inicializado");
  } else {
    console.error("❌ Firebase Auth NO está inicializado");
  }
};
