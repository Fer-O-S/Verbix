import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/hooks";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  // Removemos el anchor para permitir navegación completa
  initialRouteName: "login",
};

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const currentTime = new Date().toLocaleTimeString();
    console.log(`🧭 [${currentTime}] Navegación:`, {
      isLoading,
      user: user?.email || "sin usuario",
      segments: segments.join("/") || "raíz",
      isAuthenticated: !!user,
    });

    if (isLoading) {
      console.log("⏳ Esperando estado de autenticación...");
      return; // No hacer nada mientras se carga el estado de auth
    }

    const inAuthGroup = segments[0] === "(tabs)";
    console.log("📍 inAuthGroup:", inAuthGroup, "- segments:", segments);

    if (!user && inAuthGroup) {
      // Usuario no autenticado intentando acceder a las tabs
      console.log("🔒 REDIRIGIENDO: Usuario no autenticado a login");
      router.replace("/login");
    } else if (user && !inAuthGroup) {
      // Usuario autenticado en pantallas de auth
      console.log("✅ REDIRIGIENDO: Usuario autenticado a tabs");
      router.replace("/(tabs)");
    } else {
      console.log(
        "🔄 Sin cambios de navegación necesarios - manteniendo pantalla actual"
      );
    }
  }, [user, segments, isLoading]);

  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
