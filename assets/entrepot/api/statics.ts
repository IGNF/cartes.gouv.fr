import { StaticFile } from "@/@types/app";
import SymfonyRouting, { type QueryParams } from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";

const getList = async (datastoreId: string, queryParams: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_statics_get_list", { datastoreId, ...queryParams });
    const res = await apiFetch(url, {
        ...otherOptions,
    });

    return {
        data: (await res.json()) as StaticFile[],
        headers: res.headers,
    };
};

const remove = (datastoreId: string, staticFileId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_statics_delete", { datastoreId, staticFileId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const download = async (datastoreId: string, staticFileId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_statics_get_file_content", { datastoreId, staticFileId });
    const response = await apiFetch(url);
    return response.text();
};

const statics = {
    download,
    getList,
    remove,
};

export default statics;
