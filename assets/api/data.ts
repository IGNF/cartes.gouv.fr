import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { Data, DataDetailed } from "../types/app";

const getList = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datasheet_get_list", { datastoreId });
    return jsonFetch<Data[]>(url, {
        ...otherOptions,
    });
};

const get = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datasheet_get", { datastoreId, datasheetName });
    return jsonFetch<DataDetailed>(url, {
        ...otherOptions,
    });
};

const remove = (datastoreId: string, datasheetName: string) => {
    const url = Routing.generate("cartesgouvfr_api_datasheet_delete", { datastoreId, datasheetName });
    return jsonFetch(url, {
        method: "DELETE",
    });
};

const data = { getList, get, remove };

export default data;
