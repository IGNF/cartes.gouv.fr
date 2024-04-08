import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { type Datastore, type DatastoreEndpoint } from "../types/app";
import { DatastorePermissionResponseDto } from "../types/entrepot";

const get = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_get", { datastoreId });
    return jsonFetch<Datastore>(url, {
        ...otherOptions,
    });
};

const getEndpoints = (datastoreId: string, query: { type?: string; open?: boolean }, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_get_endpoints", { datastoreId, ...query });
    return jsonFetch<DatastoreEndpoint[]>(url, {
        ...otherOptions,
    });
};

const getPermissions = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_get_permissions", { datastoreId });
    return jsonFetch<DatastorePermissionResponseDto[]>(url, {
        ...otherOptions,
    });
};

const datastore = {
    get,
    getEndpoints,
    getPermissions,
};

export default datastore;
