import { type UploadIntegration } from "@/@types/app";
import ignfProjections from "@/data/ignf_projections.json";

const ignfProjectionsBySrid: Record<string, string> = ignfProjections;

/** contraintes Entrepôt sur le fichier de données déposé */
export const DATASET_MAX_FILE_SIZE = 2_000_000_000; // 2 Go
export const DATASET_FILE_EXTENSIONS = ["gpkg", "zip", "geojson", "csv", "sql"];

/** convertit un code de projection IGNF en son équivalent EPSG quand il est connu ; undefined si aucune projection exploitable */
export const mapIgnfToEpsg = (sridRaw: unknown): string | undefined => {
    const srid = typeof sridRaw === "string" && sridRaw !== "" && sridRaw in ignfProjections ? ignfProjectionsBySrid[sridRaw] : sridRaw;

    return typeof srid === "string" && srid.trim() !== "" ? srid : undefined;
};

/**
 * Faut-il envoyer le POST d’avancement de l’intégration ? Une action attend, aucune n’est en cours ni en échec,
 * et l’état ne vient pas du dernier POST (celui-là attend la lecture suivante, sinon le dialogue boucle).
 * Une intégration en échec n’avance plus : la suppression de sa livraison est laissée à l’onglet Données.
 */
export const shouldAdvanceIntegration = (
    integration: UploadIntegration | undefined,
    lastAdvancedState: UploadIntegration | undefined,
    isAdvancing: boolean,
    hasFailed: boolean
): boolean => !!integration?.next_action && integration.status !== "failed" && integration !== lastAdvancedState && !isAdvancing && !hasFailed;
