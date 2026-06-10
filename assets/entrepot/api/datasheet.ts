import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Datasheet, DatasheetDetailed, Service } from "../../@types/app";
import { type MetadataPayload } from "../pages/datasheet/forms/metadataSchema";

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

const addMetadata = (datastoreId: string, payload: MetadataPayload) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_add", { datastoreId });
    return jsonFetch<MetadataPayload>(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" } }, payload);
};

const editMetadata = (datastoreId: string, datasheetName: string, payload: MetadataPayload) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_edit", { datastoreId, datasheetName });
    return jsonFetch<MetadataPayload>(url, { method: "PUT", headers: { "Content-Type": "application/json", Accept: "application/json" } }, payload);
};

const datasheet = { getList, get, getServices, remove, addMetadata, editMetadata };

export default datasheet;
