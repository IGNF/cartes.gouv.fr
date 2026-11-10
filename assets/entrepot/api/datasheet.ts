import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Datasheet, DatasheetDetailed, Metadata, Service } from "../../@types/app";

const getList = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_get_list", { datastoreId });
    return jsonFetch<Datasheet[]>(url, {
        ...otherOptions,
    });
};

const get = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_get", { datastoreId, datasheetName });
    return jsonFetch<DatasheetDetailed>(url, {
        ...otherOptions,
    });
};

// multipart : champ `data` (DatasheetMetadataDTO en JSON) et fichier `thumbnail` facultatif
const add = (datastoreId: string, formData: FormData) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_add", { datastoreId });
    return jsonFetch<Metadata>(url, { method: "POST" }, formData, true);
};

// remplace les champs saisis ; `delete_thumbnail` supprime la vignette, `thumbnail` la remplace
const replace = (datastoreId: string, datasheetName: string, formData: FormData) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_replace", { datastoreId, datasheetName });
    return jsonFetch<Metadata>(url, { method: "POST" }, formData, true);
};

// Offerings
const getServices = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_get_services", { datastoreId, datasheetName });
    return jsonFetch<Service[]>(url, {
        ...otherOptions,
    });
};

const remove = (datastoreId: string, datasheetName: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_delete", { datastoreId, datasheetName });
    return jsonFetch<null>(url, {
        method: "DELETE",
    });
};

const publish = (datastoreId: string, datasheetName: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_publish", { datastoreId, datasheetName });
    return jsonFetch<null>(url, { method: "POST" });
};

const unpublish = (datastoreId: string, datasheetName: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_unpublish", { datastoreId, datasheetName });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const datasheet = { getList, get, add, replace, getServices, remove, publish, unpublish };

export default datasheet;
