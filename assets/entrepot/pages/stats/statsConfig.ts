import { CartesUser, EndpointTypeEnum } from "@/@types/app";
import { OfferingStandardListResponseDto } from "@/@types/entrepot";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import type { SelectOption, SelectParamDef, ServiceOption, ServiceParamDef, StatsRequest, StatsScope, StatsScopeConfig, StatsTranslator } from "./stats.types";

// ---------- valeur encodée du param service : "endpoint:<id>" | "offering:<id>" ----------

export type ServiceValue = { kind: "endpoint" | "offering"; id: string };

export function encodeServiceValue({ kind, id }: ServiceValue): string {
    return `${kind}:${id}`;
}

export function parseServiceValue(value: string | undefined): ServiceValue | undefined {
    if (!value) return undefined;
    const sep = value.indexOf(":");
    if (sep === -1) return undefined;
    const kind = value.slice(0, sep);
    const id = value.slice(sep + 1);
    return (kind === "endpoint" || kind === "offering") && id !== "" ? { kind, id } : undefined;
}

// Helper : inférence de type à l'écriture, efface le générique dans SelectParamDef
function p<T>(def: {
    key: string;
    label: (t: StatsTranslator) => string;
    queryKey: (deps: Record<string, string>) => string[];
    queryFn: (deps: Record<string, string>, options?: RequestInit) => Promise<T>;
    toOptions: (data: T, t: StatsTranslator) => SelectOption[];
    dependsOn?: string[];
}): SelectParamDef {
    return { kind: "select", ...def };
}

const datastoreIdParam = p({
    key: "datastoreId",
    label: (t) => t("param_datastore_label"),
    queryKey: () => RQKeys.user_me(),
    queryFn: (_, options) => api.user.getMe(options),
    // l'exclusion de l'entrepôt bac à sable se fait dans Stats.tsx (prop excludeValues)
    toOptions: (user: CartesUser | null) =>
        (user?.communities_member ?? [])
            .filter((cm) => cm.community?.datastore !== null && cm.community?.datastore !== undefined)
            .map((cm) => ({ value: cm.community!.datastore, label: cm.community!.name }))
            .sort((a, b) => a.label.localeCompare(b.label)),
});

const datastorePermissionIdParam = p({
    key: "permissionId",
    label: (t) => t("param_permission_label"),
    dependsOn: ["datastoreId"],
    queryKey: ({ datastoreId }) => RQKeys.datastore_permissions(datastoreId),
    queryFn: ({ datastoreId }, options) => api.datastore.getPermissions(datastoreId, {}, options),
    toOptions: (perms) => perms.map((perm) => ({ value: perm._id, label: perm.licence || perm._id })).sort((a, b) => a.label.localeCompare(b.label)),
});

const userPermissionQuery = {
    personal: true,
    community: false,
};
const userPermissionIdParam = p({
    key: "permissionId",
    label: (t) => t("param_permission_label"),
    queryKey: () => RQKeys.my_permissions(userPermissionQuery),
    queryFn: (_, options) => api.user.getMyPermissions(userPermissionQuery, options),
    toOptions: (perms) => perms.map((perm) => ({ value: perm._id, label: perm.licence || perm._id })).sort((a, b) => a.label.localeCompare(b.label)),
});

const userKeyIdParam = p({
    key: "keyId",
    label: (t) => t("param_key_label"),
    queryKey: () => RQKeys.my_keys(),
    queryFn: (_, options) => api.user.getMyKeys(options),
    toOptions: (keys) => keys.map((key) => ({ value: key._id, label: key.name })).sort((a, b) => a.label.localeCompare(b.label)),
});

// ---------- sélecteur Service fusionné (offerings + agrégats endpoint) ----------

const supportedServiceTypes: string[] = [EndpointTypeEnum.WFS, EndpointTypeEnum.WMSRASTER, EndpointTypeEnum.WMSVECTOR, EndpointTypeEnum.WMTSTMS];

// La liste "detailed" est une seule requête (fields=...), chaque offering porte type, open et endpoint {_id, name}
export function buildServiceOptions(offerings: OfferingStandardListResponseDto[], t: StatsTranslator): ServiceOption[] {
    const eligible = offerings.filter((o) => supportedServiceTypes.includes(o.type) && o.endpoint?._id);

    // un groupe par endpoint : l'agrégat "tous les X" en 1ʳᵉ option, puis les services par ordre alphabétique
    const byEndpoint = new Map<string, OfferingStandardListResponseDto[]>();
    for (const o of eligible) {
        byEndpoint.set(o.endpoint._id, [...(byEndpoint.get(o.endpoint._id) ?? []), o]);
    }

    const groups = [...byEndpoint.values()]
        .map((groupOfferings) => ({
            endpointId: groupOfferings[0].endpoint._id,
            endpointName: groupOfferings[0].endpoint.name,
            type: groupOfferings[0].type as string,
            open: groupOfferings[0].open,
            offerings: groupOfferings,
        }))
        .sort((a, b) => a.type.localeCompare(b.type) || Number(b.open) - Number(a.open));

    // deux endpoints de même type et visibilité : suffixer avec le nom de l'endpoint pour désambiguïser
    const labelCounts = new Map<string, number>();
    groups.forEach((g) => labelCounts.set(`${g.type}|${g.open}`, (labelCounts.get(`${g.type}|${g.open}`) ?? 0) + 1));

    return groups.flatMap((g) => {
        const baseLabel = t("service_group_label", { type: g.type, open: g.open });
        const group = (labelCounts.get(`${g.type}|${g.open}`) ?? 0) > 1 ? `${baseLabel} — ${g.endpointName}` : baseLabel;
        return [
            { kind: "endpoint" as const, id: g.endpointId, label: t("service_aggregate_label", { type: g.type, open: g.open }), group },
            ...g.offerings
                .slice()
                .sort((a, b) => a.layer_name.localeCompare(b.layer_name))
                .map((o) => ({ kind: "offering" as const, id: o._id, label: o.layer_name, group })),
        ];
    });
}

const serviceQuery = { detailed: true };
const serviceParam: ServiceParamDef = {
    kind: "service",
    key: "service",
    label: (t) => t("param_service_label"),
    dependsOn: ["datastoreId"],
    queryKey: ({ datastoreId }) => RQKeys.datastore_offering_list(datastoreId, serviceQuery),
    queryFn: ({ datastoreId }, options) => api.service.getOfferings(datastoreId, serviceQuery, options),
    toOptions: buildServiceOptions,
};

// ---------- requêtes de stats ----------

function simpleRequest(route: string, paramKeys: string[]) {
    return (resolved: Record<string, string>): StatsRequest | undefined => {
        const routeParams: Record<string, string> = {};
        for (const key of paramKeys) {
            if (!resolved[key]) return undefined;
            routeParams[key] = resolved[key];
        }
        return { route, routeParams };
    };
}

function serviceRequest({ datastoreId, service }: Record<string, string>): StatsRequest | undefined {
    const parsed = parseServiceValue(service);
    if (!datastoreId || !parsed) return undefined;
    return parsed.kind === "endpoint"
        ? { route: "cartesgouvfr_api_datastore_get_endpoint_stats", routeParams: { datastoreId, endpointId: parsed.id } }
        : { route: "cartesgouvfr_api_service_get_service_stats", routeParams: { datastoreId, offeringId: parsed.id } };
}

// ---------- configuration : l'ordre des clés d'entités définit l'entité par défaut ----------

export const statsConfig: Record<StatsScope, StatsScopeConfig> = {
    datastore: {
        param: datastoreIdParam,
        entities: {
            service: {
                label: (t) => t("entity_datastore_service"),
                params: [serviceParam],
                getStatsRequest: serviceRequest,
            },
            permission: {
                label: (t) => t("entity_datastore_permission"),
                params: [datastorePermissionIdParam],
                getStatsRequest: simpleRequest("cartesgouvfr_api_datastore_get_permission_stats", ["datastoreId", "permissionId"]),
            },
        },
    },
    user: {
        param: null,
        entities: {
            me: {
                label: (t) => t("entity_user_me"),
                params: [],
                getStatsRequest: simpleRequest("cartesgouvfr_api_user_me_stats", []),
            },
            permission: {
                label: (t) => t("entity_user_permission"),
                params: [userPermissionIdParam],
                getStatsRequest: simpleRequest("cartesgouvfr_api_user_permission_stats", ["permissionId"]),
            },
            key: {
                label: (t) => t("entity_user_key"),
                params: [userKeyIdParam],
                getStatsRequest: simpleRequest("cartesgouvfr_api_user_key_stats", ["keyId"]),
            },
        },
    },
};
