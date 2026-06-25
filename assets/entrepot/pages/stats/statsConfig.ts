import { CartesUser } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";

export type StatsScope = "datastore" | "user" | "community";

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
};

export type StatsScopeConfig = {
    label: string;
    disabled?: boolean;
    param?: ParamDef | null; // sélecteur de périmètre (Entrepôt/Communauté), affiché en premier ; null ou absent pour le périmètre user
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

const communityIdParam = p({
    key: "communityId",
    label: "Communauté",
    queryKey: () => RQKeys.user_me(),
    queryFn: (_, options) => api.user.getMe(options),
    toOptions: (user: CartesUser | null) =>
        (user?.communities_member ?? [])
            .filter((cm) => cm.community !== undefined && cm.rights?.includes(CommunityMemberDtoRightsEnum.COMMUNITY))
            .map((cm) => ({ value: cm.community!._id, label: cm.community!.name })),
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

const datastorePermissionIdParam = p({
    key: "permissionId",
    label: "Permission",
    dependsOn: ["datastoreId"],
    queryKey: ({ datastoreId }) => RQKeys.datastore_permissions(datastoreId),
    queryFn: ({ datastoreId }, options) => api.datastore.getPermissions(datastoreId, {}, options),
    toOptions: (perms) => perms.map((perm) => ({ value: perm._id, label: perm.licence || perm._id })),
});

const communityPermissionIdParam = p({
    key: "permissionId",
    label: "Permission",
    dependsOn: ["communityId"],
    queryKey: ({ communityId }) => RQKeys.community_permissions(communityId),
    queryFn: ({ communityId }, options) => api.community.getPermissions(communityId, {}, options),
    toOptions: (perms) => perms.map((perm) => ({ value: perm._id, label: perm.licence || perm._id })),
});

const userPermissionQuery = {
    personal: true,
    community: false,
};
const userPermissionIdParam = p({
    key: "permissionId",
    label: "Permission",
    queryKey: () => RQKeys.my_permissions(userPermissionQuery),
    queryFn: (_, options) => api.user.getMyPermissions(userPermissionQuery, options),
    toOptions: (perms) => perms.map((perm) => ({ value: perm._id, label: perm.licence || perm._id })),
});

const userKeyIdParam = p({
    key: "keyId",
    label: "Clé",
    queryKey: () => RQKeys.my_keys(),
    queryFn: (_, options) => api.user.getMyKeys(options),
    toOptions: (keys) => keys.map((key) => ({ value: key._id, label: key.name })),
});

const userKeyAccessIdParam = p({
    key: "accessId",
    label: "Accès",
    dependsOn: ["keyId"],
    queryKey: ({ keyId }) => RQKeys.my_key(keyId),
    queryFn: ({ keyId }, options) => api.user.getMyKeyDetailedWithAccesses(keyId, options),
    toOptions: (key) => (key.accesses ?? []).map((access) => ({ value: access._id, label: access.offering.layer_name })),
});

export const statsConfig: Record<StatsScope, StatsScopeConfig> = {
    datastore: {
        label: "Entrepôt",
        param: datastoreIdParam,
        entities: {
            endpoint: {
                label: "Points de publication",
                apiRoute: "cartesgouvfr_api_datastore_get_endpoint_stats",
                params: [endpointIdParam],
            },
            offering: {
                label: "Services",
                apiRoute: "cartesgouvfr_api_service_get_service_stats",
                params: [offeringIdParam],
            },
            permission: {
                label: "Permissions",
                apiRoute: "cartesgouvfr_api_datastore_get_permission_stats",
                params: [datastorePermissionIdParam],
            },
        },
    },
    community: {
        label: "Communauté",
        disabled: true, // statistiques de communauté désactivées temporairement (issue #1032)
        param: communityIdParam,
        entities: {
            community: {
                label: "Communautés",
                apiRoute: "cartesgouvfr_api_community_get_stats",
                params: [],
            },
            permission: {
                label: "Permissions",
                apiRoute: "cartesgouvfr_api_community_get_permission_stats",
                params: [communityPermissionIdParam],
            },
        },
    },
    user: {
        label: "Moi-même",
        param: null,
        entities: {
            me: {
                label: "Moi-même",
                apiRoute: "cartesgouvfr_api_user_me_stats",
                params: [],
            },
            permission: {
                label: "Permissions",
                apiRoute: "cartesgouvfr_api_user_permission_stats",
                params: [userPermissionIdParam],
            },
            key: {
                label: "Clés",
                apiRoute: "cartesgouvfr_api_user_key_stats",
                params: [userKeyIdParam],
            },
            key_access: {
                label: "Accès de clé",
                apiRoute: "cartesgouvfr_api_user_key_access_stats",
                params: [userKeyIdParam, userKeyAccessIdParam],
            },
        },
    },
};
