// Themes et mot cles INSPIRE
import inspireKeywords from "@/data/thematic-inspire.json";

export const getInspireKeywords = () => {
    // récupérer et applatir tous les sous-tableaux
    const flat = Object.values(inspireKeywords).flat();
    // retourner uniquement les valeurs uniques
    return Array.from(new Set(flat));
};
