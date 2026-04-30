import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";

export type StatsScope = "datastore" | "user";

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
};

export type StatsScopeConfig = {
    label: string;
    entities: Record<string, StatsEntityConfig>;
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

export const statsConfig: Record<StatsScope, StatsScopeConfig> = {
    user: {
        label: "Utilisateur",
        entities: {
            me: {
                label: "Utilisateur (moi)",
                apiRoute: "cartesgouvfr_api_user_me_stats",
                params: [],
            },
        },
    },
    datastore: {
        label: "Entrepôt",
        entities: {
            endpoint: {
                label: "Points de publication",
                apiRoute: "cartesgouvfr_api_datastore_get_endpoint_stats",
                params: [datastoreIdParam, endpointIdParam],
            },
            offering: {
                label: "Services",
                apiRoute: "cartesgouvfr_api_service_get_service_stats",
                params: [datastoreIdParam, offeringIdParam],
            },
            permission: {
                label: "Permissions",
                apiRoute: "cartesgouvfr_api_datastore_get_permission_stats",
                params: [datastoreIdParam, permissionIdParam],
            },
        },
    },
};
