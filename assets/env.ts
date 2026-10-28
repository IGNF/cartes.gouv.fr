import { appRoot } from "./router/router";

const rootDataset = (document.getElementById("root") as HTMLDivElement)?.dataset;

// APP_ENV de Symfony : "prod" sur toute image déployée, "dev" en local
export const appEnv = rootDataset?.["appEnv"] ?? "dev";
export const espaceCoUrl = rootDataset?.["apiEspacecoUrl"] ?? null;
export const catalogueUrl = rootDataset?.["catalogueUrl"] ?? appRoot + "/rechercher-une-donnee";
export const configCommunityId = rootDataset?.["configCommunityId"] ?? null;
export const configTechnicalName = rootDataset?.["configTechnicalName"] ?? null;
export const sandboxCommunityId = rootDataset?.["sandboxCommunityId"] ?? null;
export const annexesUrl = rootDataset?.["annexesUrl"] ?? "https://data.geopf.fr/annexes";
