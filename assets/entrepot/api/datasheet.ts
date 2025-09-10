import { Datasheet, DatasheetDetailed, Service, StoredData, Upload } from "@/@types/app";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";

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

const getBasic = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_get_basic", { datastoreId, datasheetName });
    return jsonFetch<Datasheet>(url, {
        ...otherOptions,
    });
};

const getUploads = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_get_uploads", { datastoreId, datasheetName });
    return jsonFetch<Upload[]>(url, {
        ...otherOptions,
    });
};

const getStoredData = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_get_stored_data", { datastoreId, datasheetName });
    return jsonFetch<StoredData[]>(url, {
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

const datasheet = { getList, get, getServices, remove, getBasic, getUploads, getStoredData };

export default datasheet;
