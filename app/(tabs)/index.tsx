import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HamburgerMenu from "../../components/HamburgerMenu";
import { useAuth } from "../../src/hooks/useAuth";
import { VerbService } from "../../src/services/VerbService";
import { Verb, VerbDifficulty, VerbType } from "../../src/types/verb";

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  // Estados
  const [loading, setLoading] = useState(true);
  const [allVerbs, setAllVerbs] = useState<Verb[]>([]); // Todos los verbos cargados
  const [verbs, setVerbs] = useState<Verb[]>([]); // Verbos filtrados que se muestran
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

  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Refs para el scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollToTopFadeAnim = useRef(new Animated.Value(0)).current;

  // Función para filtrar verbos en memoria
  const filterVerbs = (
    verbsToFilter: Verb[],
    search: string,
    type: VerbType | "all",
    difficulty: VerbDifficulty | "all"
  ) => {
    let filtered = [...verbsToFilter];

    // Filtrar por término de búsqueda
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (verb) =>
          verb.infinitive.toLowerCase().includes(searchLower) ||
          verb.simplePast.toLowerCase().includes(searchLower) ||
          verb.pastParticiple.toLowerCase().includes(searchLower) ||
          verb.meaning?.toLowerCase().includes(searchLower) ||
          verb.examples?.some((example) =>
            example.toLowerCase().includes(searchLower)
          )
      );
    }

    // Filtrar por tipo
    if (type !== "all") {
      filtered = filtered.filter((verb) => verb.type === type);
    }

    // Filtrar por dificultad
    if (difficulty !== "all") {
      filtered = filtered.filter((verb) => verb.difficulty === difficulty);
    }

    return filtered;
  };
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtrar verbos cuando cambian los filtros (en memoria)
  useEffect(() => {
    if (allVerbs.length > 0) {
      const filtered = filterVerbs(
        allVerbs,
        searchTerm,
        selectedType,
        selectedDifficulty
      );
      setVerbs(filtered);
    }
  }, [searchTerm, selectedType, selectedDifficulty, allVerbs]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas del usuario
      if (user?.uid) {
        const stats = await VerbService.getUserStats(user.uid);
        setUserStats(stats);
      }

      // Cargar TODOS los verbos desde el inicio (1,011)
      const loadedVerbs = await VerbService.getVerbs({
        limitCount: 1500, // Cargar más que los 1,011 para asegurar que obtenemos todos
      });

      setAllVerbs(loadedVerbs); // Guardar todos los verbos
      // Los verbos filtrados se actualizarán automáticamente por el useEffect
      setLoading(false);

      console.log(`🎉 Cargados ${loadedVerbs.length} verbos desde el inicio`);
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error);
      Alert.alert("Error", "No se pudieron cargar los datos iniciales");
      setLoading(false);
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

  // Función para manejar el scroll
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // Mostrar botón "scroll to top" después de 300px
    const shouldShowScrollToTop = scrollY > 300;

    // Animar botón scroll to top
    if (shouldShowScrollToTop !== showScrollToTop) {
      setShowScrollToTop(shouldShowScrollToTop);
      Animated.timing(scrollToTopFadeAnim, {
        toValue: shouldShowScrollToTop ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }; // Función para scroll hacia arriba
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fijo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HamburgerMenu
            onUpdateData={loadInitialData}
            onShowStatistics={() =>
              Alert.alert("Estadísticas", "Próximamente disponible")
            }
            onShowSettings={() =>
              Alert.alert("Configuración", "Próximamente disponible")
            }
            onShowAbout={() =>
              Alert.alert(
                "Acerca de",
                "Verbix v1.0.0\nAplicación para aprender verbos en inglés"
              )
            }
          />
          <Text style={styles.headerTitle}>Verbix Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros sticky */}
      <View style={styles.stickyFiltersContainer}>
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

          {(["regular", "irregular"] as VerbType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                selectedType === type && styles.filterChipActive,
              ]}
              onPress={() =>
                setSelectedType(selectedType === type ? "all" : type)
              }
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
          ))}

          {(["beginner", "intermediate", "advanced"] as VerbDifficulty[]).map(
            (difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterChip,
                  selectedDifficulty === difficulty && styles.filterChipActive,
                ]}
                onPress={() =>
                  setSelectedDifficulty(
                    selectedDifficulty === difficulty ? "all" : difficulty
                  )
                }
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

      {/* ScrollView principal */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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

            {/* Botones de Debug Temporal */}
            <View style={styles.debugContainer}>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => {
                  console.log("🧪 DEBUG: Filtros actuales", {
                    searchTerm,
                    selectedType,
                    selectedDifficulty,
                    verbsCount: verbs.length,
                  });
                  Alert.alert(
                    "Debug",
                    `Filtros: Tipo=${selectedType}, Dificultad=${selectedDifficulty}, Verbos=${verbs.length}`
                  );
                }}
              >
                <Text style={styles.debugButtonText}>🔍 Debug Filtros</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.debugButton}
                onPress={async () => {
                  console.log("🧪 Probando filtro REGULAR específico");
                  const testVerbs = await VerbService.getVerbs({
                    type: "regular",
                    limitCount: 10,
                  });
                  console.log(
                    "🧪 Resultado filtro REGULAR:",
                    testVerbs.length,
                    testVerbs.slice(0, 3)
                  );
                  Alert.alert(
                    "Test Regular",
                    `Encontrados: ${testVerbs.length} verbos regulares`
                  );
                }}
              >
                <Text style={styles.debugButtonText}>🧪 Test Regular</Text>
              </TouchableOpacity>
            </View>

            {/* Mostrar total de verbos cargados */}
            {verbs.length > 0 && (
              <Text style={styles.verbsCountText}>
                Mostrando {verbs.length} verbos
                {verbs.length >= 1000 && " 🎉 ¡Todos cargados!"}
                {(selectedType !== "all" || selectedDifficulty !== "all") && (
                  <Text style={styles.filterActiveText}>
                    {"\n"}Filtros:{" "}
                    {selectedType !== "all" && `Tipo: ${selectedType}`}
                    {selectedDifficulty !== "all" &&
                      ` Nivel: ${selectedDifficulty}`}
                  </Text>
                )}
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

      {/* Botón flotante para scroll hacia arriba */}
      {showScrollToTop && (
        <Animated.View
          style={[styles.scrollToTopButton, { opacity: scrollToTopFadeAnim }]}
        >
          <TouchableOpacity
            style={styles.scrollToTopButtonInner}
            onPress={scrollToTop}
          >
            <Text style={styles.scrollToTopButtonText}>⬆️</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  debugContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
    gap: 8,
  },
  debugButton: {
    backgroundColor: "#6C757D",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  filterActiveText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  // Estilos para filtros sticky
  stickyFiltersContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    elevation: 3, // Para Android
    shadowColor: "#000", // Para iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  // Estilos para botones flotantes
  floatingButton: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -75 }], // Centrar el botón (ancho aproximado 150px)
    zIndex: 1000,
  },
  floatingButtonInner: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  floatingButtonSubtext: {
    color: "#FFFFFF",
    fontSize: 10,
    opacity: 0.8,
    textAlign: "center",
    marginTop: 2,
  },
  scrollToTopButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  scrollToTopButtonInner: {
    backgroundColor: "#34C759",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  scrollToTopButtonText: {
    fontSize: 20,
  },
});
