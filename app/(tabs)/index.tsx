import { Ionicons } from "@expo/vector-icons";
import { Alert, Platform, StyleSheet, TouchableOpacity } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    // Detección de plataforma: móvil vs web
    if (Platform.OS === "web") {
      // En web: usar confirm() del navegador
      const confirmed = confirm(
        "¿Estás seguro de que quieres cerrar sesión? Esto te permitirá iniciar con otra cuenta."
      );

      if (confirmed) {
        performLogout();
      }
    } else {
      // En móvil: usar Alert.alert nativo (el original que funciona)
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro de que quieres cerrar sesión? Esto te permitirá iniciar con otra cuenta.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cerrar sesión",
            style: "destructive",
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      console.log("🚪 Cerrando sesión desde la app principal...");
      await logout();
      console.log("✅ Sesión cerrada exitosamente - redirigiendo a login...");
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error);

      if (Platform.OS === "web") {
        alert("Error: No se pudo cerrar la sesión. Inténtalo de nuevo.");
      } else {
        Alert.alert(
          "Error",
          "No se pudo cerrar la sesión. Inténtalo de nuevo."
        );
      }
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#667eea", dark: "#1D3D47" }}
      headerImage={
        <ThemedView style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Verbix</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Aprende verbos en inglés
          </ThemedText>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          ¡Hola, {user?.displayName || "Usuario"}!
        </ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <Ionicons name="book-outline" size={32} color="#667eea" />
          <ThemedText style={styles.statNumber}>
            {user?.learningProgress.totalVerbsLearned || 0}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Verbos aprendidos</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statCard}>
          <Ionicons name="flame-outline" size={32} color="#e74c3c" />
          <ThemedText style={styles.statNumber}>
            {user?.learningProgress.currentStreak || 0}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Días seguidos</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statCard}>
          <Ionicons name="trophy-outline" size={32} color="#f39c12" />
          <ThemedText style={styles.statNumber}>
            {user?.learningProgress.levelCompleted || 0}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Nivel completado</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🎯 Tu progreso</ThemedText>
        <ThemedText>
          ¡Bienvenido a Verbix! Aquí podrás aprender verbos en inglés de forma
          organizada y divertida. Mantén tu racha diaria y desbloquea nuevos
          niveles.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">📚 Verbos por categoría</ThemedText>
        <ThemedText>
          Explora verbos regulares e irregulares organizados por frecuencia de
          uso. Ve a la pestaña{" "}
          <ThemedText type="defaultSemiBold">"Explore"</ThemedText> para
          comenzar.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">⭐ Consejos</ThemedText>
        <ThemedText>
          • Estudia al menos 5 verbos por día{"\n"}• Practica la pronunciación
          {"\n"}• Repasa los verbos que ya aprendiste{"\n"}• Mantén tu racha
          diaria activa
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
});
