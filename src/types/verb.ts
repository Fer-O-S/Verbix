/**
 * Tipos para la estructura de datos de verbos en inglés
 */

export interface Verb {
  id: string;
  infinitive: string; // Base form (e.g., "go", "eat", "study")
  simplePast: string; // Past tense (e.g., "went", "ate", "studied")
  pastParticiple: string; // Past participle (e.g., "gone", "eaten", "studied")
  presentParticiple: string; // -ing form (e.g., "going", "eating", "studying")
  thirdPersonSingular: string; // he/she/it form (e.g., "goes", "eats", "studies")

  // Categorización
  type: VerbType;
  difficulty: VerbDifficulty;
  frequency: VerbFrequency;

  // Metadatos
  meaning?: string; // Significado en español
  examples?: string[]; // Ejemplos de uso
  pronunciation?: string; // Pronunciación fonética

  // Fechas
  createdAt: Date;
  updatedAt: Date;
}

export type VerbType =
  | "regular" // walk, walked, walked
  | "irregular"; // go, went, gone

export type VerbDifficulty =
  | "beginner" // Nivel A1-A2 (429 verbos básicos)
  | "intermediate" // Nivel B1-B2 (504 verbos)
  | "advanced"; // Nivel C1-C2 (78 verbos avanzados)

export type VerbFrequency =
  | "very-common" // Top 100 verbos más usados
  | "common" // Top 500 verbos
  | "uncommon" // Top 1000 verbos
  | "rare"; // Verbos poco frecuentes

// Para el progreso del usuario
export interface UserVerbProgress {
  id?: string;
  userId: string;
  verbId: string;

  // Estado de aprendizaje
  status: VerbLearningStatus;
  masteryLevel: number; // 0-100%

  // Estadísticas
  timesStudied: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastStudiedAt?: Date;
  firstStudiedAt?: Date;

  // Fechas
  createdAt: Date;
  updatedAt: Date;
}

export type VerbLearningStatus =
  | "not-studied" // No ha estudiado este verbo
  | "learning" // Actualmente aprendiendo
  | "practiced" // Ha practicado pero no domina
  | "mastered"; // Domina el verbo

// Para búsquedas y filtros
export interface VerbFilter {
  type?: VerbType[];
  difficulty?: VerbDifficulty[];
  frequency?: VerbFrequency[];
  searchTerm?: string;
  learningStatus?: VerbLearningStatus[];
  limit?: number;
  offset?: number;
}

// Para estadísticas del dashboard
export interface VerbStats {
  totalVerbs: number;
  verbsLearned: number;
  verbsMastered: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;

  // Por tipo
  byType: {
    regular: number;
    irregular: number;
  };

  // Por dificultad
  byDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };

  // Por frecuencia
  byFrequency: {
    high: number;
    medium: number;
    low: number;
  };
}
