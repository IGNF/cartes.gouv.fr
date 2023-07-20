import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { Datastore } from "../types/app";

const get = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datastore_get", { datastoreId });
    return jsonFetch<Datastore>(url, {
        ...otherOptions,
    });
};

const datastore = {
    get,
};

export default datastore;
