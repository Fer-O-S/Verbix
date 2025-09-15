import { AuthService } from "@/services/auth";
import { auth } from "@/services/firebase";
import {
  AuthContextType,
  AuthState,
  LoginFormData,
  RegisterFormData,
} from "@/types";
import { onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Crear contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// Props del Provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider de autenticación
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    console.log("🔥 Iniciando listener de autenticación...");

    // TEMPORAL: Forzar logout en desarrollo para testing
    // Descomenta la siguiente línea si quieres forzar logout al recargar
    // AuthService.logout();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "🔄 Estado de autenticación cambió:",
        firebaseUser?.uid || "sin usuario"
      );

      if (firebaseUser) {
        console.log("👤 Usuario encontrado en Firebase:", firebaseUser.email);
        try {
          const user = await AuthService.getCurrentUser();
          console.log("✅ Usuario obtenido de Firestore:", user);
          setState({
            user,
            isLoading: false,
            isAuthenticated: !!user,
            error: null,
          });
        } catch (error) {
          console.error("❌ Error obteniendo usuario:", error);
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      } else {
        console.log("🚪 No hay usuario autenticado");
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Función de registro
  const register = async (data: RegisterFormData): Promise<void> => {
    console.log("🎯 useAuth.register llamado");
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("🔄 Llamando a AuthService.register...");
      const user = await AuthService.register(data);
      console.log("👤 Usuario registrado exitosamente:", user);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Error en el registro",
      });
      throw error;
    }
  };

  // Función de login
  const login = async (data: LoginFormData): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await AuthService.login(data);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Error en el login",
      });
      throw error;
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    console.log("🚪 Iniciando logout...");
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      console.log("🔐 Cerrando sesión en Firebase...");
      await AuthService.logout();
      console.log("✅ Sesión cerrada en Firebase");

      // Limpiar estado inmediatamente
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      console.log("🧹 Estado de autenticación limpiado");
    } catch (error) {
      console.error("❌ Error en logout:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error en el logout",
      }));
      throw error;
    }
  };

  // Función para resetear contraseña
  const resetPassword = async (email: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await AuthService.resetPassword(email);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al enviar email",
      }));
      throw error;
    }
  };

  // Función para limpiar errores
  const clearError = (): void => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    register,
    login,
    logout,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
