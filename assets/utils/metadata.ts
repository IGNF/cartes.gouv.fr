import type { CswMetadata, CswMetadataProducer, CswMetadataTerritory } from "@/@types/app";
import type { BoundingBox } from "@/@types/entrepot";

// Themes et mot cles INSPIRE
import inspireKeywords from "@/data/thematic-inspire.json";
import categories from "@/data/topic_categories.json";

export const getInspireKeywords = () => {
    // récupérer et applatir tous les sous-tableaux
    const flat = Object.values(inspireKeywords).flat();
    // retourner uniquement les valeurs uniques
    return Array.from(new Set(flat));
};

export const getThematicCategories = () => {
    return Object.entries(categories)
        .map(([key, value]) => ({ code: key, text: value }))
        .sort((a, b) => a.text.localeCompare(b.text));
};

// le premier producteur est le point de contact ; le rôle contact est le contact des métadonnées, sinon le point de contact
export const getMetadataContact = (metadata?: CswMetadata): CswMetadataProducer | undefined =>
    metadata?.producers?.find((producer) => producer.role === "contact") ?? metadata?.producers?.[0];

// rectangle englobant les emprises des territoires (bbox = [ouest, sud, est, nord])
export const getTerritoriesBbox = (territories?: CswMetadataTerritory[]): BoundingBox | undefined =>
    territories?.length
        ? {
              west: Math.min(...territories.map((t) => t.bbox[0])),
              south: Math.min(...territories.map((t) => t.bbox[1])),
              east: Math.max(...territories.map((t) => t.bbox[2])),
              north: Math.max(...territories.map((t) => t.bbox[3])),
          }
        : undefined;
