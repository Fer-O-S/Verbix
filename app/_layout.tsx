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
    if (isLoading) {
      return; // No hacer nada mientras se carga el estado de auth
    }

    const inAuthGroup = segments[0] === "(tabs)";

    if (!user && inAuthGroup) {
      // Usuario no autenticado intentando acceder a las tabs
      router.replace("/login");
    } else if (user && !inAuthGroup) {
      // Usuario autenticado en pantallas de auth
      router.replace("/(tabs)");
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
