import { StaticFileListResponseDto } from "../../@types/entrepot";
import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";

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

const statics = {
    getList,
    remove,
};

export default statics;
