import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";

export type SelectOption = { value: string; label: string };

export type ParamDef = {
    key: string;
    label: string;
    queryKey: (deps: Record<string, string>) => string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: (deps: Record<string, string>, options?: RequestInit) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toOptions: (data: any) => SelectOption[];
    dependsOn?: string[];
};

export type StatsEntityConfig = {
    label: string;
    apiRoute: string;
    params: ParamDef[];
    disabled?: boolean;
    disabledReason?: string;
};

// Helper : inférence de type à l'écriture, efface le générique dans ParamDef
function p<T>(def: {
    key: string;
    label: string;
    queryKey: (deps: Record<string, string>) => string[];
    queryFn: (deps: Record<string, string>, options?: RequestInit) => Promise<T>;
    toOptions: (data: T) => SelectOption[];
    dependsOn?: string[];
}): ParamDef {
    return def;
}

const datastoreIdParam = p({
    key: "datastoreId",
    label: "Entrepôt",
    queryKey: () => RQKeys.user_me(),
    queryFn: (_, options) => api.user.getMe(options),
    toOptions: (user: CartesUser | null) =>
        (user?.communities_member ?? [])
            .filter((cm) => cm.community?.datastore !== null && cm.community?.datastore !== undefined)
            .map((cm) => ({ value: cm.community!.datastore, label: cm.community!.name })),
});

const endpointIdParam = p({
    key: "endpointId",
    label: "Endpoint",
    dependsOn: ["datastoreId"],
    queryKey: ({ datastoreId }) => RQKeys.datastore(datastoreId),
    queryFn: ({ datastoreId }, options) => api.datastore.get(datastoreId, options),
    toOptions: (datastore) => (datastore.endpoints ?? []).map((ep) => ({ value: ep.endpoint._id, label: ep.endpoint.name })),
});

const offeringIdParam = p({
    key: "offeringId",
    label: "Offre",
    dependsOn: ["datastoreId"],
    queryKey: ({ datastoreId }) => RQKeys.datastore_offering_list(datastoreId),
    queryFn: ({ datastoreId }, options) => api.service.getOfferings(datastoreId, {}, options),
    toOptions: (offerings) => offerings.map((o) => ({ value: o._id, label: o.layer_name })),
});

const permissionIdParam = p({
    key: "permissionId",
    label: "Permission",
    dependsOn: ["datastoreId"],
    queryKey: ({ datastoreId }) => RQKeys.datastore_permissions(datastoreId),
    queryFn: ({ datastoreId }, options) => api.datastore.getPermissions(datastoreId, {}, options),
    toOptions: (perms) => perms.map((perm) => ({ value: perm._id, label: perm.licence || perm._id })),
});

const keyIdParam = p({
    key: "keyId",
    label: "Clé",
    queryKey: () => RQKeys.my_keys(),
    queryFn: (_, options) => api.user.getMyKeys(options),
    toOptions: (keys) => keys.map((k) => ({ value: k._id, label: k.name })),
});

export const statsConfig: Record<string, StatsEntityConfig> = {
    user_me: {
        label: "Utilisateur (moi)",
        apiRoute: "cartesgouvfr_api_user_me_stats",
        params: [],
    },
    datastore_endpoint: {
        label: "Endpoint de datastore",
        apiRoute: "cartesgouvfr_api_datastore_get_endpoint_stats",
        params: [datastoreIdParam, endpointIdParam],
    },
    datastore_offering: {
        label: "Offre de datastore",
        apiRoute: "cartesgouvfr_api_service_get_service_stats",
        params: [datastoreIdParam, offeringIdParam],
    },
    datastore_permission: {
        label: "Permission de datastore",
        apiRoute: "cartesgouvfr_api_datastore_get_permission_stats",
        disabled: true,
        disabledReason: "Route backend non disponible",
        params: [datastoreIdParam, permissionIdParam],
    },
    user_key: {
        label: "Clé d'utilisateur",
        apiRoute: "cartesgouvfr_api_user_key_stats",
        disabled: true,
        disabledReason: "Route backend non disponible",
        params: [keyIdParam],
    },
};
