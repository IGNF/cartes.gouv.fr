import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Annexe, DatasheetThumbnailAnnexe } from "../../@types/app";

const getList = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_get_list", { datastoreId });
    return jsonFetch<Annexe[]>(url, {
        ...otherOptions,
    });
};

const addThumbnail = (datastoreId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_thumbnail_add", { datastoreId });
    return jsonFetch<DatasheetThumbnailAnnexe>(
        url,
        {
            method: "POST",
        },
        data,
        true
    );
};

const removeThumbnail = (datastoreId: string, datasheetName: string, annexeId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_thumbnail_delete", { datastoreId, datasheetName, annexeId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const remove = (datastoreId: string, annexeId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_delete", { datastoreId, annexeId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

export default {
    getList,
    addThumbnail,
    removeThumbnail,
    remove,
};
