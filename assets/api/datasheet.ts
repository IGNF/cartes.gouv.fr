import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { Datasheet, DatasheetDetailed } from "../types/app";

const getList = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datasheet_get_list", { datastoreId });
    return jsonFetch<Datasheet[]>(url, {
        ...otherOptions,
    });
};

const get = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datasheet_get", { datastoreId, datasheetName });
    return jsonFetch<DatasheetDetailed>(url, {
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
