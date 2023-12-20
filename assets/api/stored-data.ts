import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { StoredData, StoredDataReport } from "../types/app";

const getList = <T = StoredData>(datastoreId: string, type?: string, otherOptions: RequestInit = {}) => {
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

const getReportData = (datastoreId: string, storedDataId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_stored_data_get_report_data", { datastoreId, storedDataId });
    return jsonFetch<StoredDataReport>(url, {
        ...otherOptions,
    });
};

const storedData = {
    getList,
    get,
    getReportData,
};

export default storedData;
