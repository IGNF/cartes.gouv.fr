import type { Datastore, DatastoreEndpoint, DatastorePermission } from "../../@types/app";
import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";

const get = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_get", { datastoreId });
    return jsonFetch<Datastore>(url, {
        ...otherOptions,
    });
};

const getSandbox = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_get_sandbox");
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

const getPermission = (datastoreId: string, permissionId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_get_permission", { datastoreId, permissionId });
    return jsonFetch<DatastorePermission>(url, {
        ...otherOptions,
    });
};

const getPermissions = (datastoreId: string, query: object, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_get_permissions", { datastoreId, ...query });
    return jsonFetch<DatastorePermission[]>(url, {
        ...otherOptions,
    });
};

const addPermission = (datastoreId: string, formData: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_add_permission", { datastoreId: datastoreId });
    return jsonFetch<DatastorePermission[]>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const updatePermission = (datastoreId: string, permissionId: string, formData: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_update_permission", { datastoreId: datastoreId, permissionId: permissionId });
    return jsonFetch<DatastorePermission>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const removePermission = (datastoreId: string, permissionId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datastore_remove_permission", { datastoreId: datastoreId, permissionId: permissionId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const datastore = {
    get,
    getSandbox,
    getEndpoints,
    getPermission,
    getPermissions,
    addPermission,
    updatePermission,
    removePermission,
};

export default datastore;
