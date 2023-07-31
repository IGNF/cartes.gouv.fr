import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { type Datastore, type DatastoreEndpoint } from "../types/app";

const get = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datastore_get", { datastoreId });
    return jsonFetch<Datastore>(url, {
        ...otherOptions,
    });
};

const getEndpoints = (datastoreId: string, query: { type?: string; open?: boolean }, otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datastore_get_endpoints", { datastoreId, ...query });
    return jsonFetch<DatastoreEndpoint[]>(url, {
        ...otherOptions,
    });
};

const datastore = {
    get,
    getEndpoints,
};

export default datastore;
