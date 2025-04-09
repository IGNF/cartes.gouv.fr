const rootDataset = (document.getElementById("root") as HTMLDivElement)?.dataset;

export const espaceCoUrl = rootDataset?.["apiEspacecoUrl"] ?? null;
export const catalogueUrl = rootDataset?.["catalogueUrl"] ?? "/catalogue";
export const configCommunityId = rootDataset?.["configCommunityId"] ?? null;
export const configTechnicalName = rootDataset?.["configTechnicalName"] ?? null;
export const annexesUrl = rootDataset?.["annexesUrl"] ?? "https://data.geopf.fr/annexes";
