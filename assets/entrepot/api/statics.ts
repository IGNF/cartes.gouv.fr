import { StaticFileListResponseDto } from "../../@types/entrepot";
import SymfonyRouting from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";

const getList = (datastoreId: string, queryParams: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_statics_get_list", { datastoreId, ...queryParams });
    return jsonFetch<StaticFileListResponseDto[]>(url, {
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
    getList,
    remove,
};

export default statics;
