// Themes et mot cles INSPIRE
import { Metadata } from "@/@types/app";
import inspireKeywords from "@/data/thematic-inspire.json";
import categories from "@/data/topic_categories.json";

/** nom de l'organisme responsable de la donnée : producteur de rôle « custodian », à défaut le point de contact qui en tient lieu */
export const getMetadataCustodianName = (metadata: Metadata | undefined): string | undefined => {
    const producers = metadata?.csw_metadata?.producers;
    const custodian = producers?.find((producer) => producer.role === "custodian") ?? producers?.find((producer) => producer.role === "pointOfContact");

    return custodian?.organization_name;
};

export const getInspireKeywords = () => {
    // récupérer et applatir tous les sous-tableaux
    const flat = Object.values(inspireKeywords).flat();
    // retourner uniquement les valeurs uniques
    return Array.from(new Set(flat)).sort((a, b) => a.localeCompare(b));
};

export const getThematicCategories = () => {
    return Object.entries(categories)
        .map(([key, value]) => ({ code: key, text: value }))
        .sort((a, b) => a.text.localeCompare(b.text));
};
