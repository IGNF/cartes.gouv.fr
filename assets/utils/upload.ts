import ignfProjections from "@/data/ignf_projections.json";

/** contraintes Entrepôt sur le fichier de données déposé */
export const DATASET_MAX_FILE_SIZE = 2_000_000_000; // 2 Go
export const DATASET_FILE_EXTENSIONS = ["gpkg", "zip", "geojson", "csv", "sql"];

/** convertit un code de projection IGNF en son équivalent EPSG quand il est connu ; undefined si aucune projection exploitable */
export const mapIgnfToEpsg = (sridRaw: unknown): string | undefined => {
    const srid = typeof sridRaw === "string" && sridRaw !== "" && sridRaw in ignfProjections ? ignfProjections[sridRaw] : sridRaw;

    return typeof srid === "string" && srid.trim() !== "" ? srid : undefined;
};

/** parse le tag integration_progress d’une livraison (objet JSON étape → statut) */
export const parseIntegrationProgress = (rawProgress: string | undefined): Record<string, string> | null => {
    if (!rawProgress) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawProgress);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        // ignore les erreurs de parsing JSON
    }

    return null;
};

/** vrai si au moins une étape d’intégration a échoué */
export const integrationProgressHasFailure = (rawProgress: string | undefined): boolean =>
    Object.values(parseIntegrationProgress(rawProgress) ?? {}).includes("failed");
