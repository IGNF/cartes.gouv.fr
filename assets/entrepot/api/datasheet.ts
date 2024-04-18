import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Datasheet, DatasheetDetailed, Service } from "../../types/app";

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
    return jsonFetch(url, {
        method: "DELETE",
    });
};

const datasheet = { getList, get, getServices, remove };

export default datasheet;
