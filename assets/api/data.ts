import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { Data, DataDetailed } from "../types/app";

const getList = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_data_get_list", { datastoreId });
    return jsonFetch<Data[]>(url, {
        ...otherOptions,
    });
};

const get = (datastoreId: string, dataName: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_data_get", { datastoreId, dataName });
    return jsonFetch<DataDetailed>(url, {
        ...otherOptions,
    });
};

const remove = (datastoreId: string, dataName: string) => {
    const url = Routing.generate("cartesgouvfr_api_data_delete", { datastoreId, dataName });
    return jsonFetch(url, {
        method: "DELETE",
    });
};

const data = { getList, get, remove };

export default data;
