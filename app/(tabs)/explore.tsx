import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
  },
  verbsList: {
    padding: 15,
  },
  verbCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verbHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  verbInfo: {
    flex: 1,
  },
  infinitive: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  verbType: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  frequencyText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  learnButton: {
    padding: 8,
  },
  verbForms: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  formItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  formLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 3,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  formValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  examples: {
    marginBottom: 15,
  },
  exampleLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  exampleText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
    fontStyle: "italic",
  },
  difficulty: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
});

import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks";
import { Verb } from "@/types";

// Datos de ejemplo de verbos (después los traeremos de Firestore)
const SAMPLE_VERBS: Verb[] = [
  {
    id: "1",
    infinitive: "go",
    pastSimple: "went",
    pastParticiple: "gone",
    type: "irregular",
    frequency: "high",
    difficulty: 2,
    examples: ["I go to school", "I went yesterday", "I have gone there"],
  },
  {
    id: "2",
    infinitive: "make",
    pastSimple: "made",
    pastParticiple: "made",
    type: "irregular",
    frequency: "high",
    difficulty: 2,
    examples: ["I make dinner", "I made a mistake", "I have made progress"],
  },
  {
    id: "3",
    infinitive: "work",
    pastSimple: "worked",
    pastParticiple: "worked",
    type: "regular",
    frequency: "high",
    difficulty: 1,
    examples: ["I work hard", "I worked yesterday", "I have worked here"],
  },
  {
    id: "4",
    infinitive: "take",
    pastSimple: "took",
    pastParticiple: "taken",
    type: "irregular",
    frequency: "high",
    difficulty: 3,
    examples: ["I take photos", "I took a break", "I have taken the test"],
  },
  {
    id: "5",
    infinitive: "study",
    pastSimple: "studied",
    pastParticiple: "studied",
    type: "regular",
    frequency: "medium",
    difficulty: 1,
    examples: [
      "I study English",
      "I studied last night",
      "I have studied hard",
    ],
  },
];

export default function ExploreScreen() {
  const { user } = useAuth();
  const [verbs, setVerbs] = useState<Verb[]>(SAMPLE_VERBS);
  const [filteredVerbs, setFilteredVerbs] = useState<Verb[]>(SAMPLE_VERBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "regular" | "irregular"
  >("all");
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar verbos basado en búsqueda y filtro
  useEffect(() => {
    let filtered = verbs;

    // Filtrar por tipo
    if (selectedFilter !== "all") {
      filtered = filtered.filter((verb) => verb.type === selectedFilter);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (verb) =>
          verb.infinitive.toLowerCase().includes(searchQuery.toLowerCase()) ||
          verb.pastSimple.toLowerCase().includes(searchQuery.toLowerCase()) ||
          verb.pastParticiple.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVerbs(filtered);
  }, [verbs, searchQuery, selectedFilter]);

  const handleMarkAsLearned = (verbId: string) => {
    Alert.alert("Marcar como aprendido", "¿Has aprendido este verbo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, lo aprendí",
        onPress: () => {
          // TODO: Actualizar en Firestore el progreso del usuario
          Alert.alert("¡Excelente!", "Verbo marcado como aprendido 🎉");
        },
      },
    ]);
  };

  const renderVerbCard = ({ item }: { item: Verb }) => (
    <ThemedView style={styles.verbCard}>
      <View style={styles.verbHeader}>
        <View style={styles.verbInfo}>
          <Text style={styles.infinitive}>{item.infinitive}</Text>
          <View style={styles.verbType}>
            <Text
              style={[
                styles.typeText,
                { color: item.type === "irregular" ? "#e74c3c" : "#27ae60" },
              ]}
            >
              {item.type === "irregular" ? "Irregular" : "Regular"}
            </Text>
            <View
              style={[
                styles.frequencyBadge,
                {
                  backgroundColor:
                    item.frequency === "high"
                      ? "#667eea"
                      : item.frequency === "medium"
                      ? "#f39c12"
                      : "#95a5a6",
                },
              ]}
            >
              <Text style={styles.frequencyText}>{item.frequency}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.learnButton}
          onPress={() => handleMarkAsLearned(item.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      <View style={styles.verbForms}>
        <View style={styles.formItem}>
          <Text style={styles.formLabel}>Past Simple</Text>
          <Text style={styles.formValue}>{item.pastSimple}</Text>
        </View>
        <View style={styles.formItem}>
          <Text style={styles.formLabel}>Past Participle</Text>
          <Text style={styles.formValue}>{item.pastParticiple}</Text>
        </View>
      </View>

      <View style={styles.examples}>
        <Text style={styles.exampleLabel}>Ejemplos:</Text>
        {item.examples.slice(0, 2).map((example, index) => (
          <Text key={index} style={styles.exampleText}>
            • {example}
          </Text>
        ))}
      </View>

      <View style={styles.difficulty}>
        {[1, 2, 3, 4, 5].map((level) => (
          <Ionicons
            key={level}
            name={level <= item.difficulty ? "star" : "star-outline"}
            size={16}
            color={level <= item.difficulty ? "#f39c12" : "#ddd"}
          />
        ))}
        <Text style={styles.difficultyText}>Dificultad</Text>
      </View>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          📚 Verbos
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredVerbs.length} verbos disponibles
        </ThemedText>
      </ThemedView>

      {/* Búsqueda */}
      <ThemedView style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar verbos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      {/* Filtros */}
      <ThemedView style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "all" && styles.activeFilterText,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "regular" && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter("regular")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "regular" && styles.activeFilterText,
            ]}
          >
            Regulares
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "irregular" && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter("irregular")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "irregular" && styles.activeFilterText,
            ]}
          >
            Irregulares
          </Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Lista de verbos */}
      <FlatList
        data={filteredVerbs}
        renderItem={renderVerbCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.verbsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              No se encontraron verbos con estos criterios
            </ThemedText>
          </ThemedView>
        )}
      />
    </SafeAreaView>
  );
}
