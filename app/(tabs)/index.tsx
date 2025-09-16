import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { VerbService } from "../../src/services/VerbService";
import { Verb, VerbDifficulty, VerbType } from "../../src/types/verb";

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  // Estados
  const [loading, setLoading] = useState(true);
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<VerbType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    VerbDifficulty | "all"
  >("all");
  const [userStats, setUserStats] = useState({
    totalVerbs: 0,
    practicedVerbs: 0,
    masteredVerbs: 0,
    averageMastery: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const VERBS_PER_PAGE = 50; // Aumentar verbos por página

  // Cargar datos al inicializar
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar verbos cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
    loadVerbs(true);
  }, [searchTerm, selectedType, selectedDifficulty]);

  const loadInitialData = async () => {
    try {
      // Cargar estadísticas del usuario
      if (user?.uid) {
        const stats = await VerbService.getUserStats(user.uid);
        setUserStats(stats);
      }

      // Cargar primeros verbos
      await loadVerbs(true);
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error);
      Alert.alert("Error", "No se pudieron cargar los datos iniciales");
    }
  };

  const loadVerbs = async (resetList = false) => {
    try {
      if (resetList) {
        setLoading(true);
        setVerbs([]);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const filters: any = {
        limitCount: VERBS_PER_PAGE,
      };

      if (searchTerm) filters.searchTerm = searchTerm;
      if (selectedType !== "all") filters.type = selectedType;
      if (selectedDifficulty !== "all") filters.difficulty = selectedDifficulty;

      const verbsData = await VerbService.getVerbs(filters);

      if (resetList) {
        setVerbs(verbsData);
      } else {
        setVerbs((prev) => [...prev, ...verbsData]);
      }
    } catch (error) {
      console.error("❌ Error cargando verbos:", error);
      Alert.alert("Error", "No se pudieron cargar los verbos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadInitialDataIfNeeded = async () => {
    try {
      setLoading(true);
      await VerbService.loadInitialData();
      Alert.alert(
        "Éxito",
        "¡Dataset de 1,011 verbos cargado exitosamente! 🎉",
        [{ text: "OK", onPress: () => loadInitialData() }]
      );
    } catch (error) {
      console.error("❌ Error cargando dataset inicial:", error);
      Alert.alert("Error", "No se pudo cargar el dataset inicial");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (Platform.OS === "web") {
        const confirmLogout = confirm(
          "¿Estás seguro de que quieres cerrar sesión?"
        );
        if (confirmLogout) {
          await logout();
        }
      } else {
        Alert.alert(
          "Cerrar Sesión",
          "¿Estás seguro de que quieres cerrar sesión?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Cerrar Sesión",
              onPress: async () => await logout(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("❌ Error en logout:", error);
    }
  };

  // Función para cargar TODOS los verbos
  const loadAllVerbs = async () => {
    if (loading || loadingMore) return;

    try {
      setLoading(true);

      const filters: any = {
        limitCount: 1500, // Cargar más que los 1,011 para asegurar que obtenemos todos
      };

      if (searchTerm.trim()) {
        filters.searchTerm = searchTerm.trim();
      }
      if (selectedType !== "all") {
        filters.type = selectedType;
      }
      if (selectedDifficulty !== "all") {
        filters.difficulty = selectedDifficulty;
      }

      const allVerbs = await VerbService.getVerbs(filters);
      setVerbs(allVerbs);
      setCurrentPage(Math.ceil(allVerbs.length / VERBS_PER_PAGE));

      Alert.alert(
        "¡Éxito!",
        `Se cargaron ${allVerbs.length} verbos completos 🎉`,
        [{ text: "¡Genial!", style: "default" }]
      );
    } catch (error) {
      console.error("❌ Error cargando todos los verbos:", error);
      Alert.alert("Error", "No se pudieron cargar todos los verbos");
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar más verbos
  const loadMoreVerbs = async () => {
    if (loadingMore) return; // Prevenir múltiples llamadas

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const filters: any = {
        limitCount: VERBS_PER_PAGE,
        // Nota: En una implementación real, necesitarías offset o cursor
        // Para simplificar, cargaremos más verbos sin filtros específicos de página
      };

      if (searchTerm.trim()) {
        filters.searchTerm = searchTerm.trim();
      }
      if (selectedType !== "all") {
        filters.type = selectedType;
      }
      if (selectedDifficulty !== "all") {
        filters.difficulty = selectedDifficulty;
      }

      // Obtener más verbos (esto podría duplicar algunos, pero es una solución simple)
      filters.limitCount = VERBS_PER_PAGE * nextPage;
      const newVerbs = await VerbService.getVerbs(filters);

      setVerbs(newVerbs);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("❌ Error cargando más verbos:", error);
      Alert.alert("Error", "No se pudieron cargar más verbos");
    } finally {
      setLoadingMore(false);
    }
  };

  // Funciones auxiliares para estilos
  const getTypeStyle = (type: VerbType) => {
    switch (type) {
      case "regular":
        return styles.regularTag;
      case "irregular":
        return styles.irregularTag;
      default:
        return styles.verbTag;
    }
  };

  const getDifficultyStyle = (difficulty: VerbDifficulty) => {
    switch (difficulty) {
      case "beginner":
        return styles.beginnerTag;
      case "intermediate":
        return styles.intermediateTag;
      case "advanced":
        return styles.advancedTag;
      default:
        return styles.verbTag;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verbix Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats Card */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Tu Progreso 📊</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalVerbs}</Text>
              <Text style={styles.statLabel}>Total Verbos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.practicedVerbs}</Text>
              <Text style={styles.statLabel}>Practicados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.masteredVerbs}</Text>
              <Text style={styles.statLabel}>Dominados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.averageMastery}%</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar verbos..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === "all" && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType("all")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === "all" && styles.filterChipTextActive,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>

            {(["regular", "irregular", "auxiliary", "modal"] as VerbType[]).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedType === type && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedType === type && styles.filterChipTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}

            {(["beginner", "intermediate", "advanced"] as VerbDifficulty[]).map(
              (difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === difficulty &&
                      styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDifficulty === difficulty &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Load Data Button */}
        {userStats.totalVerbs === 0 && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>
              ¡Bienvenido, {user?.displayName || user?.email || "Usuario"}! 👋
            </Text>
            <Text style={styles.welcomeText}>
              Para comenzar, necesitas cargar el dataset de 1,011 verbos en la
              base de datos.
            </Text>
            <TouchableOpacity
              style={styles.loadDataButton}
              onPress={loadInitialDataIfNeeded}
            >
              <Text style={styles.loadDataButtonText}>
                📚 Cargar Dataset de 1,011 Verbos
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Verbos Section */}
        {verbs.length > 0 && (
          <View style={styles.verbsSection}>
            <Text style={styles.sectionTitle}>
              Verbos ({verbs.length}) {loading && "(Cargando...)"}
            </Text>

            {verbs.map((verb) => (
              <View key={verb.id} style={styles.verbCard}>
                <View style={styles.verbHeader}>
                  <Text style={styles.verbInfinitive}>{verb.infinitive}</Text>
                  <View style={styles.verbTags}>
                    <Text style={[styles.verbTag, getTypeStyle(verb.type)]}>
                      {verb.type}
                    </Text>
                    <Text
                      style={[
                        styles.verbTag,
                        getDifficultyStyle(verb.difficulty),
                      ]}
                    >
                      {verb.difficulty}
                    </Text>
                  </View>
                </View>

                <View style={styles.verbConjugations}>
                  <View style={styles.conjugationRow}>
                    <Text style={styles.conjugationLabel}>Past:</Text>
                    <Text style={styles.conjugationValue}>
                      {verb.simplePast}
                    </Text>
                  </View>
                  <View style={styles.conjugationRow}>
                    <Text style={styles.conjugationLabel}>
                      Past Participle:
                    </Text>
                    <Text style={styles.conjugationValue}>
                      {verb.pastParticiple}
                    </Text>
                  </View>
                  <View style={styles.conjugationRow}>
                    <Text style={styles.conjugationLabel}>-ing:</Text>
                    <Text style={styles.conjugationValue}>
                      {verb.presentParticiple}
                    </Text>
                  </View>
                </View>

                {verb.meaning && (
                  <Text style={styles.verbMeaning}>
                    Significado: {verb.meaning}
                  </Text>
                )}

                {verb.examples && verb.examples.length > 0 && (
                  <Text style={styles.verbExample}>
                    Ejemplo: "{verb.examples[0]}"
                  </Text>
                )}
              </View>
            ))}

            {loadingMore && (
              <ActivityIndicator
                size="large"
                color="#007AFF"
                style={styles.loader}
              />
            )}

            {/* Botón Cargar Más */}
            {!loading &&
              !loadingMore &&
              verbs.length > 0 &&
              verbs.length >= VERBS_PER_PAGE && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreVerbs}
                >
                  <Text style={styles.loadMoreButtonText}>
                    📄 Cargar Más Verbos
                  </Text>
                </TouchableOpacity>
              )}

            {/* Botón para cargar TODOS los verbos */}
            {!loading &&
              !loadingMore &&
              verbs.length > 0 &&
              verbs.length < 1000 && (
                <TouchableOpacity
                  style={styles.loadAllButton}
                  onPress={loadAllVerbs}
                >
                  <Text style={styles.loadAllButtonText}>
                    🔥 Mostrar TODOS los Verbos (1,011)
                  </Text>
                </TouchableOpacity>
              )}

            {/* Mostrar total de verbos cargados */}
            {verbs.length > 0 && (
              <Text style={styles.verbsCountText}>
                Mostrando {verbs.length} verbos{" "}
                {verbs.length >= 1000 && "🎉 ¡Todos cargados!"}
              </Text>
            )}
          </View>
        )}

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.sectionTitle}>Información de usuario</Text>
          <Text style={styles.userInfoText}>Email: {user?.email}</Text>
          <Text style={styles.userInfoText}>ID: {user?.uid}</Text>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.loader}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: "white",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },

  // Stats
  statsContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  // Welcome
  welcomeContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },

  // Features
  featuresContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  featureItem: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },

  // User Info
  userInfoContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  loader: {
    marginTop: 20,
  },

  // Filters
  filtersContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  filterScrollView: {
    flexDirection: "row",
  },
  filterChip: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterChipText: {
    fontSize: 14,
    color: "#333",
  },
  filterChipTextActive: {
    color: "white",
  },

  // Load Data Button
  loadDataButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  loadDataButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Verbs Section
  verbsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  verbCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verbHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  verbInfinitive: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  verbTags: {
    flexDirection: "row",
    gap: 8,
  },
  verbTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#e2e3e5",
    color: "#383d41",
  },
  regularTag: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  irregularTag: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  auxiliaryTag: {
    backgroundColor: "#d1ecf1",
    color: "#0c5460",
  },
  modalTag: {
    backgroundColor: "#e2e3e5",
    color: "#383d41",
  },
  beginnerTag: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  intermediateTag: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  advancedTag: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  verbConjugations: {
    marginBottom: 12,
  },
  conjugationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  conjugationLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  conjugationValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  verbMeaning: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 8,
    fontStyle: "italic",
  },
  verbExample: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  loadMoreButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadMoreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  verbsCountText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    fontStyle: "italic",
  },
  loadAllButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  loadAllButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
