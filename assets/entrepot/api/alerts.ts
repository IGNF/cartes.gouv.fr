import { IApiAlert } from "../../@types/alert";
import { jsonFetch } from "../../modules/jsonFetch";

const communityId = import.meta.env.CONFIG_COMMUNITY_ID;
const annexePath = "/public/alerts.json";
const fileName = annexePath.substring(annexePath.lastIndexOf("/") + 1);
const baseUrl = "https://data.geopf.fr/annexes/cartes.gouv.fr-config";

const get = (otherOptions: RequestInit = {}) => {
    return jsonFetch<IApiAlert[]>(`${baseUrl}${annexePath}`, {
        ...otherOptions,
    });
};

export default {
    annexePath,
    communityId,
    fileName,
    get,
};
