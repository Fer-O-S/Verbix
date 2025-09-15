import {
  FirebaseAuthError,
  LoginFormData,
  RegisterFormData,
  User,
} from "@/types";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export class AuthService {
  /**
   * Registra un nuevo usuario con email y contraseña
   */
  static async register(data: RegisterFormData): Promise<User> {
    console.log("🔥 AuthService.register llamado con:", {
      email: data.email,
      displayName: data.displayName,
    });
    try {
      // Crear usuario en Firebase Auth
      console.log("📧 Creando usuario en Firebase Auth...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log("✅ Usuario creado en Auth:", userCredential.user.uid);

      const firebaseUser = userCredential.user;

      // Actualizar perfil con nombre
      await updateProfile(firebaseUser, {
        displayName: data.displayName,
      });

      // Crear documento del usuario en Firestore
      const userData = {
        email: data.email,
        displayName: data.displayName,
        // No incluir photoURL si es undefined
        createdAt: new Date(),
        lastLoginAt: new Date(),
        learningProgress: {
          totalVerbsLearned: 0,
          currentStreak: 0,
          levelCompleted: 0,
        },
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      return {
        uid: firebaseUser.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        learningProgress: {
          totalVerbsLearned: 0,
          currentStreak: 0,
          levelCompleted: 0,
        },
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  static async login(data: LoginFormData): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Actualizar última conexión
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        lastLoginAt: serverTimestamp(),
      });

      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData?.displayName,
        photoURL: firebaseUser.photoURL || userData?.photoURL,
        createdAt: userData?.createdAt?.toDate() || new Date(),
        lastLoginAt: new Date(),
        learningProgress: userData?.learningProgress || {
          totalVerbsLearned: 0,
          currentStreak: 0,
          levelCompleted: 0,
        },
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Cierra sesión del usuario
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Envía email para restablecer contraseña
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtiene el usuario actual desde Firestore
   */
  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();

      if (!userData) return null;

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData.displayName,
        photoURL: firebaseUser.photoURL || userData.photoURL,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
        learningProgress: userData.learningProgress || {
          totalVerbsLearned: 0,
          currentStreak: 0,
          levelCompleted: 0,
        },
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Maneja errores de Firebase Auth y los convierte a mensajes legibles
   */
  private static handleAuthError(error: any): Error {
    const errorCode = error.code as FirebaseAuthError;

    const errorMessages: Record<FirebaseAuthError, string> = {
      "auth/email-already-in-use": "Este correo ya está registrado",
      "auth/invalid-email": "El formato del correo no es válido",
      "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
      "auth/user-not-found": "No existe una cuenta con este correo",
      "auth/wrong-password": "Contraseña incorrecta",
      "auth/too-many-requests":
        "Demasiados intentos fallidos. Intenta más tarde",
      "auth/network-request-failed": "Error de conexión. Revisa tu internet",
    };

    const message =
      errorMessages[errorCode] || error.message || "Error desconocido";
    return new Error(message);
  }
}
