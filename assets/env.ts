// Fixés au build (vite.config.ts)
export const basePath = import.meta.env.APP_BASE_PATH ?? "";
export const appVersion = import.meta.env.APP_VERSION ?? "";
export const appRevision = import.meta.env.APP_REVISION ?? "";
export const cacheBuster = import.meta.env.APP_CACHE_BUSTER ?? "";

// Fournis par Symfony à l’exécution (attributs data-* de #root)
const rootDataset = (document.getElementById("root") as HTMLDivElement)?.dataset;

// APP_ENV de Symfony : "prod" sur toute image déployée, "dev" en local
export const appEnv = rootDataset?.["appEnv"] ?? "dev";
export const espaceCoUrl = rootDataset?.["apiEspacecoUrl"] ?? null;
export const catalogueUrl = rootDataset?.["catalogueUrl"] ?? basePath + "/rechercher-une-donnee";
export const configCommunityId = rootDataset?.["configCommunityId"] ?? null;
export const configTechnicalName = rootDataset?.["configTechnicalName"] ?? null;
export const sandboxCommunityId = rootDataset?.["sandboxCommunityId"] ?? null;
export const annexesUrl = rootDataset?.["annexesUrl"] ?? "https://data.geopf.fr/annexes";
