/**
 * Servicio para gestionar verbos en Firebase Firestore
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  updateDoc,
  where,
} from "firebase/firestore";
import { completeVerbsDataset } from "../data/verbs-complete";
import {
  UserVerbProgress,
  Verb,
  VerbDifficulty,
  VerbFrequency,
  VerbType,
} from "../types/verb";
import { db } from "./firebase";

const VERBS_COLLECTION = "verbs";
const USER_PROGRESS_COLLECTION = "userVerbProgress";

export class VerbService {
  /**
   * Cargar datos iniciales de verbos en Firestore (solo ejecutar una vez)
   */
  static async loadInitialData(): Promise<void> {
    try {
      // Verificar si ya hay verbos en la base de datos
      const verbsSnapshot = await getDocs(collection(db, VERBS_COLLECTION));
      if (!verbsSnapshot.empty) {
        return;
      }

      // Cargar verbos iniciales (dataset completo de 1,011 verbos)
      const BATCH_SIZE = 50;
      const batches = [];

      for (let i = 0; i < completeVerbsDataset.length; i += BATCH_SIZE) {
        const batch = completeVerbsDataset.slice(i, i + BATCH_SIZE);
        batches.push(batch);
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        const promises = batch.map(async (verbData: any) => {
          const verbWithTimestamps: Omit<Verb, "id"> = {
            ...verbData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return addDoc(collection(db, VERBS_COLLECTION), verbWithTimestamps);
        });

        await Promise.all(promises);

        // Pequeña pausa para no sobrecargar Firestore
        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error);
      throw error;
    }
  }

  /**
   * Obtener todos los verbos con filtros opcionales
   * Estrategia optimizada para evitar índices complejos
   */
  static async getVerbs(filters?: {
    type?: VerbType;
    difficulty?: VerbDifficulty;
    frequency?: VerbFrequency;
    searchTerm?: string;
    limitCount?: number;
  }): Promise<Verb[]> {
    try {
      // Estrategia 1: Si solo hay un filtro, usar consulta directa
      if (this.hasSingleFilter(filters)) {
        return this.getVerbsWithSingleFilter(filters);
      }

      // Estrategia 2: Si hay múltiples filtros, obtener todos y filtrar en memoria
      const constraints: QueryConstraint[] = [];

      // Solo usar el primer filtro para la consulta, el resto se filtra en memoria
      const primaryFilter = this.getPrimaryFilter(filters);
      if (primaryFilter.field && primaryFilter.value) {
        constraints.push(where(primaryFilter.field, "==", primaryFilter.value));
      }

      // Ordenar por infinitivo (solo si no hay filtros where múltiples)
      if (!primaryFilter.field) {
        constraints.push(orderBy("infinitive", "asc"));
      }

      // Obtener más datos para compensar el filtrado en memoria
      const queryLimit = filters?.limitCount
        ? Math.min(filters.limitCount * 3, 300)
        : 100;
      constraints.push(limit(queryLimit));

      const q = query(collection(db, VERBS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);

      let verbs: Verb[] = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Verb)
      );

      // Aplicar filtros adicionales en memoria
      verbs = this.applyMemoryFilters(verbs, filters);

      // Ordenar en memoria si es necesario
      verbs.sort((a, b) => a.infinitive.localeCompare(b.infinitive));

      // Aplicar límite final
      if (filters?.limitCount && verbs.length > filters.limitCount) {
        verbs = verbs.slice(0, filters.limitCount);
      }

      // Filtro de búsqueda (local, ya que Firestore no soporta búsqueda full-text)
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        verbs = verbs.filter(
          (verb) =>
            verb.infinitive.toLowerCase().includes(searchTerm) ||
            (verb.meaning && verb.meaning.toLowerCase().includes(searchTerm)) ||
            verb.simplePast.toLowerCase().includes(searchTerm) ||
            verb.pastParticiple.toLowerCase().includes(searchTerm)
        );
      }

      return verbs;
    } catch (error) {
      console.error("❌ Error obteniendo verbos:", error);
      throw error;
    }
  }

  /**
   * Obtener un verbo por ID
   */
  static async getVerbById(verbId: string): Promise<Verb | null> {
    try {
      const docRef = doc(db, VERBS_COLLECTION, verbId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Verb;
      }

      return null;
    } catch (error) {
      console.error("❌ Error obteniendo verbo por ID:", error);
      throw error;
    }
  }

  /**
   * Obtener verbos aleatorios para práctica
   */
  static async getRandomVerbs(count: number = 10): Promise<Verb[]> {
    try {
      // Obtener todos los verbos y seleccionar aleatoriamente
      const allVerbs = await this.getVerbs();

      if (allVerbs.length <= count) {
        return allVerbs;
      }

      const shuffled = [...allVerbs].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error("❌ Error obteniendo verbos aleatorios:", error);
      throw error;
    }
  }

  /**
   * Obtener progreso del usuario para un verbo
   */
  static async getUserVerbProgress(
    userId: string,
    verbId: string
  ): Promise<UserVerbProgress | null> {
    try {
      const q = query(
        collection(db, USER_PROGRESS_COLLECTION),
        where("userId", "==", userId),
        where("verbId", "==", verbId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as unknown as UserVerbProgress;
      }

      return null;
    } catch (error) {
      console.error("❌ Error obteniendo progreso del usuario:", error);
      throw error;
    }
  }

  /**
   * Actualizar progreso del usuario para un verbo
   */
  static async updateUserVerbProgress(
    userId: string,
    verbId: string,
    progressData: Partial<Omit<UserVerbProgress, "userId" | "verbId">>
  ): Promise<void> {
    try {
      const existingProgress = await this.getUserVerbProgress(userId, verbId);

      if (existingProgress && existingProgress.id) {
        // Actualizar progreso existente
        const docRef = doc(db, USER_PROGRESS_COLLECTION, existingProgress.id);
        await updateDoc(docRef, {
          ...progressData,
          lastStudiedAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Crear nuevo progreso
        const newProgress: Omit<UserVerbProgress, "id"> = {
          userId,
          verbId,
          status: "learning",
          masteryLevel: 0,
          timesStudied: 0,
          timesCorrect: 0,
          timesIncorrect: 0,
          firstStudiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...progressData,
        };

        await addDoc(collection(db, USER_PROGRESS_COLLECTION), newProgress);
      }
    } catch (error) {
      console.error("❌ Error actualizando progreso del usuario:", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del progreso del usuario
   */
  static async getUserStats(userId: string): Promise<{
    totalVerbs: number;
    practicedVerbs: number;
    masteredVerbs: number;
    averageMastery: number;
    lastPracticed?: Date;
  }> {
    try {
      // Obtener total de verbos
      const allVerbsSnapshot = await getDocs(collection(db, VERBS_COLLECTION));
      const totalVerbs = allVerbsSnapshot.size;

      // Obtener progreso del usuario
      const q = query(
        collection(db, USER_PROGRESS_COLLECTION),
        where("userId", "==", userId)
      );
      const progressSnapshot = await getDocs(q);

      if (progressSnapshot.empty) {
        return {
          totalVerbs,
          practicedVerbs: 0,
          masteredVerbs: 0,
          averageMastery: 0,
        };
      }

      const progressData = progressSnapshot.docs.map(
        (doc) => doc.data() as UserVerbProgress
      );

      const practicedVerbs = progressData.length;
      const masteredVerbs = progressData.filter(
        (p) => p.masteryLevel >= 80
      ).length;
      const averageMastery =
        progressData.reduce((acc, p) => acc + p.masteryLevel, 0) /
        practicedVerbs;

      // Última práctica
      const lastPracticedDates = progressData
        .map((p) => p.lastStudiedAt)
        .filter((date) => date instanceof Date)
        .sort((a, b) => b.getTime() - a.getTime());
      const lastPracticed =
        lastPracticedDates.length > 0 ? lastPracticedDates[0] : undefined;

      return {
        totalVerbs,
        practicedVerbs,
        masteredVerbs,
        averageMastery: Math.round(averageMastery),
        lastPracticed,
      };
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas del usuario:", error);
      throw error;
    }
  }

  /**
   * Obtener verbos recomendados para práctica (basado en progreso)
   */
  static async getRecommendedVerbs(
    userId: string,
    count: number = 10
  ): Promise<Verb[]> {
    try {
      // Obtener progreso del usuario
      const progressQuery = query(
        collection(db, USER_PROGRESS_COLLECTION),
        where("userId", "==", userId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      const userProgress = progressSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as unknown as UserVerbProgress)
      );

      // Obtener todos los verbos
      const allVerbs = await this.getVerbs();

      // Priorizar verbos según progreso
      const verbsWithPriority = allVerbs.map((verb) => {
        const progress = userProgress.find((p) => p.verbId === verb.id);

        let priority = 0;

        if (!progress) {
          // Verbos no practicados tienen alta prioridad
          priority = 100;
        } else {
          // Verbos con baja maestría tienen prioridad
          priority = 100 - progress.masteryLevel;

          // Verbos no practicados recientemente tienen más prioridad
          const daysSinceLastPractice = progress.lastStudiedAt
            ? Math.floor(
                (Date.now() - progress.lastStudiedAt.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 30;
          priority += Math.min(daysSinceLastPractice * 2, 50);
        }

        return { verb, priority };
      });

      // Ordenar por prioridad y tomar los primeros
      const recommendedVerbs = verbsWithPriority
        .sort((a, b) => b.priority - a.priority)
        .slice(0, count)
        .map((item) => item.verb);

      return recommendedVerbs;
    } catch (error) {
      console.error("❌ Error obteniendo verbos recomendados:", error);
      throw error;
    }
  }

  /**
   * Verificar si solo hay un filtro activo
   */
  private static hasSingleFilter(filters?: {
    type?: VerbType;
    difficulty?: VerbDifficulty;
    frequency?: VerbFrequency;
    searchTerm?: string;
    limitCount?: number;
  }): boolean {
    if (!filters) return false;

    const activeFilters = [
      filters.type,
      filters.difficulty,
      filters.frequency,
      filters.searchTerm,
    ].filter((f) => f !== undefined && f !== "");

    return activeFilters.length <= 1;
  }

  /**
   * Obtener verbos con un solo filtro (más eficiente)
   */
  private static async getVerbsWithSingleFilter(filters?: {
    type?: VerbType;
    difficulty?: VerbDifficulty;
    frequency?: VerbFrequency;
    searchTerm?: string;
    limitCount?: number;
  }): Promise<Verb[]> {
    const constraints: QueryConstraint[] = [];

    // Aplicar el único filtro activo
    if (filters?.type) {
      constraints.push(where("type", "==", filters.type));
    } else if (filters?.difficulty) {
      constraints.push(where("difficulty", "==", filters.difficulty));
    } else if (filters?.frequency) {
      constraints.push(where("frequency", "==", filters.frequency));
    }

    // Ordenar y limitar
    constraints.push(orderBy("infinitive", "asc"));
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(collection(db, VERBS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    let verbs: Verb[] = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Verb)
    );

    // Aplicar búsqueda por texto si es necesario
    if (filters?.searchTerm) {
      verbs = this.applyTextSearch(verbs, filters.searchTerm);
    }

    return verbs;
  }

  /**
   * Determinar el filtro primario para la consulta
   */
  private static getPrimaryFilter(filters?: {
    type?: VerbType;
    difficulty?: VerbDifficulty;
    frequency?: VerbFrequency;
    searchTerm?: string;
  }): { field: string | null; value: any } {
    if (filters?.type) return { field: "type", value: filters.type };
    if (filters?.difficulty)
      return { field: "difficulty", value: filters.difficulty };
    if (filters?.frequency)
      return { field: "frequency", value: filters.frequency };
    return { field: null, value: null };
  }

  /**
   * Aplicar filtros en memoria
   */
  private static applyMemoryFilters(
    verbs: Verb[],
    filters?: {
      type?: VerbType;
      difficulty?: VerbDifficulty;
      frequency?: VerbFrequency;
      searchTerm?: string;
    }
  ): Verb[] {
    let filtered = [...verbs];

    if (filters?.type) {
      filtered = filtered.filter((v) => v.type === filters.type);
    }
    if (filters?.difficulty) {
      filtered = filtered.filter((v) => v.difficulty === filters.difficulty);
    }
    if (filters?.frequency) {
      filtered = filtered.filter((v) => v.frequency === filters.frequency);
    }
    if (filters?.searchTerm) {
      filtered = this.applyTextSearch(filtered, filters.searchTerm);
    }

    return filtered;
  }

  /**
   * Aplicar búsqueda por texto
   */
  private static applyTextSearch(verbs: Verb[], searchTerm: string): Verb[] {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return verbs;

    return verbs.filter(
      (verb) =>
        verb.infinitive.toLowerCase().includes(term) ||
        verb.simplePast.toLowerCase().includes(term) ||
        verb.pastParticiple.toLowerCase().includes(term) ||
        (verb.meaning && verb.meaning.toLowerCase().includes(term))
    );
  }
}
