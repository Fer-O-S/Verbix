const fs = require("fs");
const path = require("path");

// Lista de verbos más comunes para clasificación automática
const VERY_COMMON_VERBS = new Set([
  "be",
  "have",
  "do",
  "say",
  "get",
  "make",
  "go",
  "know",
  "take",
  "see",
  "come",
  "think",
  "look",
  "want",
  "give",
  "use",
  "find",
  "tell",
  "ask",
  "work",
  "seem",
  "feel",
  "try",
  "leave",
  "call",
  "good",
  "new",
  "first",
  "like",
  "need",
  "turn",
  "put",
  "mean",
  "become",
  "keep",
  "let",
  "begin",
  "show",
  "hear",
  "play",
  "run",
  "move",
  "live",
  "believe",
  "hold",
  "bring",
  "happen",
  "write",
  "provide",
  "sit",
  "stand",
  "lose",
  "pay",
  "meet",
  "include",
]);

const COMMON_VERBS = new Set([
  "eat",
  "buy",
  "speak",
  "learn",
  "teach",
  "help",
  "walk",
  "talk",
  "read",
  "write",
  "listen",
  "watch",
  "drive",
  "fly",
  "swim",
  "dance",
  "sing",
  "sleep",
  "wake",
  "open",
  "close",
  "start",
  "stop",
  "finish",
  "continue",
  "break",
  "fix",
  "build",
  "create",
  "destroy",
  "clean",
  "wash",
  "cook",
  "serve",
  "order",
  "choose",
  "decide",
  "agree",
  "disagree",
  "remember",
  "forget",
  "understand",
  "explain",
  "describe",
  "discuss",
  "argue",
  "fight",
  "win",
  "lose",
  "compete",
  "practice",
  "exercise",
  "study",
  "research",
  "discover",
  "invent",
  "develop",
  "improve",
  "change",
  "remain",
  "stay",
  "arrive",
  "depart",
  "enter",
  "exit",
  "visit",
  "travel",
  "explore",
  "return",
]);

// Verbos irregulares conocidos
const IRREGULAR_VERBS = new Set([
  "be",
  "have",
  "do",
  "say",
  "get",
  "make",
  "go",
  "know",
  "take",
  "see",
  "come",
  "think",
  "give",
  "find",
  "tell",
  "become",
  "leave",
  "feel",
  "bring",
  "begin",
  "keep",
  "hold",
  "write",
  "stand",
  "hear",
  "let",
  "put",
  "mean",
  "set",
  "meet",
  "run",
  "pay",
  "sit",
  "speak",
  "lie",
  "lead",
  "read",
  "grow",
  "lose",
  "fall",
  "send",
  "build",
  "understand",
  "draw",
  "break",
  "spend",
  "cut",
  "rise",
  "drive",
  "buy",
  "wear",
  "choose",
  "fight",
  "catch",
  "throw",
  "forget",
  "hide",
  "hit",
  "hurt",
  "lay",
  "light",
  "ride",
  "ring",
  "sell",
  "shoot",
  "shut",
  "sing",
  "sleep",
  "slide",
  "steal",
  "stick",
  "strike",
  "swing",
  "teach",
  "tear",
  "wake",
  "win",
  "bind",
  "bite",
  "blow",
  "burst",
  "deal",
  "dig",
  "feed",
  "flee",
  "fly",
  "freeze",
  "hang",
  "kneel",
  "lean",
  "leap",
  "lend",
  "seek",
  "shake",
  "shine",
  "shrink",
  "sink",
  "spit",
  "split",
  "spread",
  "spring",
  "sting",
  "stink",
  "sweep",
  "swim",
  "swing",
  "weep",
  "wind",
]);

// Función para determinar si un verbo es regular o irregular
function determineVerbType(verb, infinitive, pastParticiple) {
  if (IRREGULAR_VERBS.has(verb)) {
    return "irregular";
  }

  // Auxiliaries
  if (["be", "have", "do"].includes(verb)) {
    return "auxiliary";
  }

  // Modals
  if (
    [
      "can",
      "could",
      "may",
      "might",
      "must",
      "shall",
      "should",
      "will",
      "would",
    ].includes(verb)
  ) {
    return "modal";
  }

  // Check if it follows regular pattern (add -ed)
  if (pastParticiple && infinitive) {
    const base = infinitive.replace(/e$/, ""); // remove final 'e' if present
    if (
      pastParticiple === base + "ed" ||
      pastParticiple === infinitive + "ed"
    ) {
      return "regular";
    }
  }

  return "irregular"; // Default to irregular if unsure
}

// Función para determinar dificultad
function determineDifficulty(verb) {
  if (VERY_COMMON_VERBS.has(verb)) {
    return "beginner";
  }
  if (COMMON_VERBS.has(verb)) {
    return "beginner";
  }

  // Verbos cortos y simples generalmente son más fáciles
  if (verb.length <= 4) {
    return "beginner";
  }
  if (verb.length <= 7) {
    return "intermediate";
  }

  return "advanced";
}

// Función para determinar frecuencia
function determineFrequency(verb) {
  if (VERY_COMMON_VERBS.has(verb)) {
    return "very-common";
  }
  if (COMMON_VERBS.has(verb)) {
    return "common";
  }

  // Los verbos más cortos tienden a ser más comunes
  if (verb.length <= 4 && !verb.includes("z") && !verb.includes("x")) {
    return "common";
  }

  return "uncommon";
}

// Función para generar ejemplos básicos
function generateExamples(verb, pastForm, pastParticiple) {
  const examples = [
    `I ${verb} every day`,
    `She ${pastForm} yesterday`,
    `They have ${pastParticiple} before`,
  ];

  // Ajustar para verbos específicos
  if (verb === "be") {
    return ["I am happy", "She was tired", "They have been here"];
  }
  if (verb === "have") {
    return ["I have a car", "She had lunch", "We have had enough"];
  }

  return examples;
}

try {
  console.log("🔄 Cargando archivo de 1,011 verbos...");
  const inputFile = path.join(__dirname, "verbs-conjugations.json");
  const verbs = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  console.log("⚡ Procesando y convirtiendo verbos...");

  const convertedVerbs = verbs.map((verbData, index) => {
    if (index % 100 === 0) {
      console.log(
        `   Procesando: ${index + 1}/${verbs.length} - ${verbData.verb}`
      );
    }

    const infinitive = verbData.verb;
    const pastForm = verbData.participle?.[0] || infinitive + "ed";
    const pastParticiple = verbData.participle?.[0] || infinitive + "ed";
    const presentParticiple = verbData.gerund?.[0] || infinitive + "ing";

    // Determinar third person singular (he/she/it form)
    let thirdPersonSingular = infinitive;
    if (verbData.indicative?.present?.[2]) {
      thirdPersonSingular = verbData.indicative.present[2];
    } else if (
      infinitive.endsWith("s") ||
      infinitive.endsWith("sh") ||
      infinitive.endsWith("ch") ||
      infinitive.endsWith("x") ||
      infinitive.endsWith("z")
    ) {
      thirdPersonSingular = infinitive + "es";
    } else if (
      infinitive.endsWith("y") &&
      !"aeiou".includes(infinitive[infinitive.length - 2])
    ) {
      thirdPersonSingular = infinitive.slice(0, -1) + "ies";
    } else {
      thirdPersonSingular = infinitive + "s";
    }

    const type = determineVerbType(infinitive, infinitive, pastParticiple);
    const difficulty = determineDifficulty(infinitive);
    const frequency = determineFrequency(infinitive);
    const examples = generateExamples(infinitive, pastForm, pastParticiple);

    return {
      infinitive,
      simplePast: pastForm,
      pastParticiple,
      presentParticiple,
      thirdPersonSingular,
      type,
      difficulty,
      frequency,
      meaning: "", // Vacío por ahora, se puede agregar manualmente después
      examples,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  console.log("📊 Generando estadísticas...");

  // Generar estadísticas
  const stats = {
    total: convertedVerbs.length,
    byType: {
      regular: convertedVerbs.filter((v) => v.type === "regular").length,
      irregular: convertedVerbs.filter((v) => v.type === "irregular").length,
      auxiliary: convertedVerbs.filter((v) => v.type === "auxiliary").length,
      modal: convertedVerbs.filter((v) => v.type === "modal").length,
    },
    byDifficulty: {
      beginner: convertedVerbs.filter((v) => v.difficulty === "beginner")
        .length,
      intermediate: convertedVerbs.filter(
        (v) => v.difficulty === "intermediate"
      ).length,
      advanced: convertedVerbs.filter((v) => v.difficulty === "advanced")
        .length,
    },
    byFrequency: {
      "very-common": convertedVerbs.filter((v) => v.frequency === "very-common")
        .length,
      common: convertedVerbs.filter((v) => v.frequency === "common").length,
      uncommon: convertedVerbs.filter((v) => v.frequency === "uncommon").length,
    },
  };

  console.log("\n📈 Estadísticas del dataset convertido:");
  console.log(`📚 Total: ${stats.total} verbos`);
  console.log(
    `🔤 Por tipo: Regular(${stats.byType.regular}), Irregular(${stats.byType.irregular}), Auxiliary(${stats.byType.auxiliary}), Modal(${stats.byType.modal})`
  );
  console.log(
    `📊 Por dificultad: Beginner(${stats.byDifficulty.beginner}), Intermediate(${stats.byDifficulty.intermediate}), Advanced(${stats.byDifficulty.advanced})`
  );
  console.log(
    `⭐ Por frecuencia: Very Common(${stats.byFrequency["very-common"]}), Common(${stats.byFrequency["common"]}), Uncommon(${stats.byFrequency["uncommon"]})`
  );

  // Guardar el dataset convertido
  const outputCode = `/**
 * Dataset completo de ${stats.total} verbos en inglés
 * Convertido automáticamente desde verbs-conjugations.json
 * 
 * Estadísticas:
 * - Total: ${stats.total} verbos
 * - Regulares: ${stats.byType.regular}, Irregulares: ${stats.byType.irregular}
 * - Auxiliares: ${stats.byType.auxiliary}, Modales: ${stats.byType.modal}
 * - Principiante: ${stats.byDifficulty.beginner}, Intermedio: ${
    stats.byDifficulty.intermediate
  }, Avanzado: ${stats.byDifficulty.advanced}
 */

import { Verb } from '../types/verb';

export const completeVerbsDataset: Omit<Verb, 'id' | 'createdAt' | 'updatedAt'>[] = ${JSON.stringify(
    convertedVerbs.map((verb) => {
      const { createdAt, updatedAt, ...rest } = verb;
      return rest;
    }),
    null,
    2
  )};

export const verbsStats = ${JSON.stringify(stats, null, 2)};
`;

  const outputFile = path.join(__dirname, "verbs-complete.ts");
  fs.writeFileSync(outputFile, outputCode, "utf8");

  console.log(`\n✅ Dataset convertido guardado en: ${outputFile}`);
  console.log(`📦 ${stats.total} verbos listos para usar en la app`);

  // Mostrar algunos ejemplos
  console.log("\n📝 Ejemplos de verbos convertidos:");
  convertedVerbs.slice(0, 5).forEach((verb, i) => {
    console.log(
      `${i + 1}. ${verb.infinitive} (${verb.type}, ${verb.difficulty}) - ${
        verb.simplePast
      } - ${verb.pastParticiple}`
    );
  });
} catch (error) {
  console.error("❌ Error procesando verbos:", error.message);
  console.error(error.stack);
}
