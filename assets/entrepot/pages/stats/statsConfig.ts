import api from "@/entrepot/api";

export type SelectOption = { value: string; label: string };

export type ParamDef = {
    key: string;
    label: string;
    fetchOptions: (deps: Record<string, string>) => Promise<SelectOption[]>;
    dependsOn?: string[];
};

export type StatsEntityConfig = {
    label: string;
    apiRoute: string;
    params: ParamDef[];
    disabled?: boolean;
    disabledReason?: string;
};

export type DatastoreInfo = { _id: string; name: string };

export const buildStatsConfig = (datastoreList: DatastoreInfo[]): Record<string, StatsEntityConfig> => {
    const datastoreOptions = (): Promise<SelectOption[]> => Promise.resolve(datastoreList.map((ds) => ({ value: ds._id, label: ds.name })));

    const endpointOptions = ({ datastoreId }: Record<string, string>): Promise<SelectOption[]> =>
        api.datastore.getEndpoints(datastoreId, {}).then((endpoints) => endpoints.map((ep) => ({ value: ep.endpoint._id, label: ep.endpoint.name })));

    const permissionOptions = ({ datastoreId }: Record<string, string>): Promise<SelectOption[]> =>
        api.datastore.getPermissions(datastoreId, {}).then((perms) => perms.map((p) => ({ value: p._id, label: p.licence || p._id })));

    const offeringOptions = ({ datastoreId }: Record<string, string>): Promise<SelectOption[]> =>
        api.service.getOfferings(datastoreId).then((offerings) => offerings.map((o) => ({ value: o._id, label: o.layer_name })));

    const keyOptions = (): Promise<SelectOption[]> => api.user.getMyKeys().then((keys) => keys.map((k) => ({ value: k._id, label: k.name })));

    return {
        datastore_endpoint: {
            label: "Endpoint de datastore",
            apiRoute: "cartesgouvfr_api_datastore_get_endpoint_stats",
            params: [
                { key: "datastoreId", label: "Entrepôt", fetchOptions: datastoreOptions },
                { key: "endpointId", label: "Endpoint", dependsOn: ["datastoreId"], fetchOptions: endpointOptions },
            ],
        },
        datastore_offering: {
            label: "Offre de datastore",
            apiRoute: "cartesgouvfr_api_service_get_service_stats",
            params: [
                { key: "datastoreId", label: "Entrepôt", fetchOptions: datastoreOptions },
                { key: "offeringId", label: "Offre", dependsOn: ["datastoreId"], fetchOptions: offeringOptions },
            ],
        },
        datastore_permission: {
            label: "Permission de datastore",
            apiRoute: "cartesgouvfr_api_datastore_get_permission_stats",
            disabled: true,
            disabledReason: "Route backend non disponible",
            params: [
                { key: "datastoreId", label: "Entrepôt", fetchOptions: datastoreOptions },
                { key: "permissionId", label: "Permission", dependsOn: ["datastoreId"], fetchOptions: permissionOptions },
            ],
        },
        user_me: {
            label: "Utilisateur (moi)",
            apiRoute: "cartesgouvfr_api_user_me_stats",
            params: [],
        },
        user_key: {
            label: "Clé d'utilisateur",
            apiRoute: "cartesgouvfr_api_user_key_stats",
            disabled: true,
            disabledReason: "Route backend non disponible",
            params: [{ key: "keyId", label: "Clé", fetchOptions: keyOptions }],
        },
    };
};
