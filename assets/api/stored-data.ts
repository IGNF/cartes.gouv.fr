import SymfonyRouting from "../modules/Routing";
import { jsonFetch } from "../modules/jsonFetch";
import { StoredData, StoredDataReport, StoredDataType } from "../types/app";
import { OfferingListResponseDto, StoredDataListResponseDto } from "../types/entrepot";

const getList = <T = StoredData[]>(datastoreId: string, type?: StoredDataType, otherOptions: RequestInit = {}) => {
    const params = { datastoreId };
    if (type !== undefined) {
        params["type"] = type;
    }

    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_list", params);
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
    return jsonFetch<{ stored_data_list: StoredDataListResponseDto[]; offerings_list: OfferingListResponseDto[] }>(url, {
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
    get,
    getUses,
    getReportData,
    remove,
};

export default storedData;
