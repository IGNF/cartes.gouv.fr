const rootDataset = (document.getElementById("root") as HTMLDivElement)?.dataset;

export const espaceCoUrl = rootDataset?.["apiEspacecoUrl"] ?? null;
export const catalogueUrl = rootDataset?.["catalogueUrl"] ?? "/catalogue";
export const communityId = rootDataset?.["configCommunityId"] ?? null;
export const annexesUrl = rootDataset?.["annexesUrl"] ?? "https://data.geopf.fr/annexes";
