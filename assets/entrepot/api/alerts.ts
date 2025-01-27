import { IApiAlert } from "../../@types/alert";
import { jsonFetch } from "../../modules/jsonFetch";

const datastoreId = "5cb4fdb0-6f6c-4422-893d-e04564bfcc10";
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
    datastoreId,
    fileName,
    get,
};
