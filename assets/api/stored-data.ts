import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { StoredData, StoredDataReport } from "../types/app";

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
    get,
    getReportData,
};

export default storedData;
