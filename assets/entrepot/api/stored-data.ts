import { Offering, StoredData, StoredDataReport } from "../../@types/app";
import { ProcessingExecutionStoredDataDto } from "../../@types/entrepot";
import SymfonyRouting from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";

const getList = async <T = StoredData[]>(datastoreId: string, query: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_list", { datastoreId, ...query });
    const res = await apiFetch(url, {
        ...otherOptions,
    });

    return {
        data: (await res.json()) as T,
        headers: res.headers,
    };
};

const getAll = async <T = StoredData[]>(datastoreId: string, query: object = {}, otherOptions: RequestInit = {}) => {
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
    return jsonFetch<{ stored_data_list: ProcessingExecutionStoredDataDto[]; offerings_list: Offering[] }>(url, {
        ...otherOptions,
    });
};

const getReportData = (datastoreId: string, storedDataId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_report_data", { datastoreId, storedDataId });
    return jsonFetch<StoredDataReport>(url, {
        ...otherOptions,
    });
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
    getReportData,
    remove,
};

export default storedData;
