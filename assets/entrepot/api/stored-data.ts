import { Offering, StoredData, StoredDataDetails } from "../../@types/app";
import SymfonyRouting, { type QueryParams } from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";

const getList = async <T = StoredData[]>(datastoreId: string, query: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_list", { datastoreId, ...query });
    const res = await apiFetch(url, {
        ...otherOptions,
    });

    return {
        data: (await res.json()) as T,
        headers: res.headers,
    };
};

const getAll = async <T = StoredData[]>(datastoreId: string, query: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_list", { datastoreId, all: true, ...query });
    return jsonFetch<T>(url, {
        ...otherOptions,
    });
};

const get = <T = StoredData>(datastoreId: string, storedDataId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get", { datastoreId, storedDataId });
    return jsonFetch<T>(url, {
        ...otherOptions,
    });
};

const getUses = (datastoreId: string, storedDataId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_uses", { datastoreId, storedDataId });
    return jsonFetch<{ offerings_list: Offering[] }>(url, {
        ...otherOptions,
    });
};

const getDetails = (datastoreId: string, storedDataId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_details", { datastoreId, storedDataId });
    return jsonFetch<StoredDataDetails>(url, { ...otherOptions });
};

const getProcessingLogs = (datastoreId: string, storedDataId: string, executionId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_processing_logs", { datastoreId, storedDataId, executionId });
    return jsonFetch<string[]>(url, { ...otherOptions });
};

const remove = (datastoreId: string, storedDataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_delete", { datastoreId, storedDataId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const storedData = {
    getList,
    getAll,
    get,
    getUses,
    getDetails,
    getProcessingLogs,
    remove,
};

export default storedData;
