import { annexesUrl, configCommunityId, configTechnicalName } from "@/env";
import { IApiAlert } from "../../@types/alert";
import { jsonFetch } from "../../modules/jsonFetch";

const annexePath = "/public/alerts.json";
const fileName = annexePath.substring(annexePath.lastIndexOf("/") + 1);
const baseUrl = `${annexesUrl}/${configTechnicalName}`;

const get = (otherOptions: RequestInit = {}) => {
    return jsonFetch<IApiAlert[]>(`${baseUrl}${annexePath}`, {
        ...otherOptions,
    });
};

export default {
    annexePath,
    communityId: configCommunityId,
    fileName,
    get,
};
