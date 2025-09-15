// Tipos específicos para verbos (para el futuro)
export interface Verb {
  id: string;
  infinitive: string; // base form (go)
  pastSimple: string; // past tense (went)
  pastParticiple: string; // past participle (gone)
  type: "regular" | "irregular";
  frequency: "high" | "medium" | "low";
  difficulty: 1 | 2 | 3 | 4 | 5;
  examples: string[];
  pronunciation?: {
    infinitive: string;
    pastSimple: string;
    pastParticiple: string;
  };
}

export interface UserProgress {
  userId: string;
  verbId: string;
  status: "not-started" | "learning" | "practiced" | "mastered";
  attempts: number;
  correctAnswers: number;
  lastReviewDate: Date;
  masteredDate?: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  date: Date;
  verbsStudied: string[]; // verb IDs
  duration: number; // in minutes
  correctAnswers: number;
  totalQuestions: number;
  score: number; // percentage
}
