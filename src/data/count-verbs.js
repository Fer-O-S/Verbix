const fs = require("fs");
const path = require("path");

try {
  console.log("🔄 Leyendo archivo de verbos...");
  const filePath = path.join(__dirname, "verbs-conjugations.json");
  const fileContent = fs.readFileSync(filePath, "utf8");

  console.log("📊 Parseando JSON...");
  const verbs = JSON.parse(fileContent);

  console.log(`✅ Total de verbos encontrados: ${verbs.length}`);

  // Mostrar algunos ejemplos
  console.log("\n📝 Primeros 5 verbos:");
  verbs.slice(0, 5).forEach((verb, index) => {
    console.log(`${index + 1}. ${verb.verb}`);
  });

  console.log("\n📝 Últimos 5 verbos:");
  verbs.slice(-5).forEach((verb, index) => {
    console.log(`${verbs.length - 4 + index}. ${verb.verb}`);
  });

  // Analizar estructura
  const firstVerb = verbs[0];
  console.log("\n🔍 Estructura del primer verbo:");
  console.log("- Verbo:", firstVerb.verb);
  console.log("- Infinitivo:", firstVerb.infinitive);
  console.log("- Participio:", firstVerb.participle);
  console.log("- Gerundio:", firstVerb.gerund);
  console.log(
    "- Tiempos disponibles:",
    Object.keys(firstVerb.indicative || {})
  );
} catch (error) {
  console.error("❌ Error:", error.message);
}
