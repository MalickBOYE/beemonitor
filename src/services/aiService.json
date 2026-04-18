// src/services/aiService.js

/**
 * Analyse les données des ruches et génère une réponse intelligente
 * @param {string} userInput - La question de l'utilisateur
 * @param {Array} hivesData - Les données actuelles des ruches venant de Supabase
 */
export const analyzeHiveHealth = (userInput, hivesData) => {
  const input = userInput.toLowerCase();
  
  // 1. Analyse rapide du parc de ruches
  const totalHives = hivesData.length;
  const criticalHives = hivesData.filter(h => h.last_temp > 38 || h.last_temp < 10);
  const lowBatteryHives = hivesData.filter(h => h.last_bat < 20);

  // 2. Logique de réponse (Évolutive)
  
  // Demande d'état général
  if (input.includes("état") || input.includes("santé") || input.includes("vont")) {
    if (criticalHives.length > 0) {
      return `Attention : ${criticalHives.length} ruche(s) présentent des anomalies de température. Les autres se portent bien sur vos ${totalHives} emplacements.`;
    }
    return `Tout semble normal sur vos ${totalHives} ruches. La température moyenne est stable.`;
  }

  // Demande sur les batteries
  if (input.includes("batterie") || input.includes("pile")) {
    if (lowBatteryHives.length > 0) {
      return `Vous devriez prévoir une maintenance : ${lowBatteryHives.length} ruches ont une batterie faible (inférieure à 20%).`;
    }
    return "Toutes vos balises sont correctement chargées.";
  }

  // Demande de conseils (IA prédictive simple)
  if (input.includes("conseil") || input.includes("faire")) {
    const avgTemp = hivesData.reduce((acc, h) => acc + (h.last_temp || 0), 0) / totalHives;
    if (avgTemp > 30) return "Il fait chaud. Assurez-vous que vos ruches ont accès à un point d'eau à proximité.";
    return "Les conditions sont standard. Continuez la surveillance à distance.";
  }

  return "Je peux vous renseigner sur la santé de vos ruches, l'état des batteries ou vous donner des conseils d'entretien.";
};