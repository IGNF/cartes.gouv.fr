import { StaticFile } from "@/@types/app";
import SymfonyRouting from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";

const getList = async (datastoreId: string, queryParams: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_statics_get_list", { datastoreId, ...queryParams });
    const res = await apiFetch(url, {
        ...otherOptions,
    });

    return {
        data: (await res.json()) as StaticFile[],
        headers: res.headers,
    };
};

const getAll = (datastoreId: string, queryParams: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_statics_get_list", { datastoreId, ...queryParams, all: true });
    return jsonFetch<StaticFile[]>(url, {
        method: "GET",
        ...otherOptions,
    });
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
    getAll,
    getList,
    remove,
};

export default statics;
