import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Annexe, DatasheetThumbnailAnnexe } from "../../@types/app";

const getList = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_get_list", { datastoreId });
    return jsonFetch<Annexe[]>(url, {
        ...otherOptions,
    });
};

const add = (datastoreId: string, path: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_add", { datastoreId });
    return jsonFetch<Annexe>(url, { method: "POST" }, formData, true, true);
};

const modify = (datastoreId: string, annexeId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_modify", { datastoreId, annexeId });
    return jsonFetch<Annexe>(url, { method: "PATCH" }, data);
};

const replaceFile = (datastoreId: string, annexeId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_replace_file", { datastoreId, annexeId });
    return jsonFetch<Annexe>(url, { method: "POST" }, formData, true, true);
};

const addThumbnail = (datastoreId: string, data: FormData) => {
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
    add,
    modify,
    replaceFile,
    addThumbnail,
    removeThumbnail,
    remove,
};
