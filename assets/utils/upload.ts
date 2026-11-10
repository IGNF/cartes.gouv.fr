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
