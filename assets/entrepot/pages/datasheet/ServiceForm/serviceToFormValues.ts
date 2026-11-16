import { type DatastorePermission, type Service } from "@/@types/app";
import { isPrivateServiceVisibleOnCartesGouv } from "@/utils";
import { type ServiceAccess, type ServiceFormValues } from "./serviceFormSchema";

// les anciens formulaires TMS et raster enregistraient la description encodée en JSON
const decodeDescription = (abstract: string): string => {
    if (abstract.length >= 2 && abstract.startsWith('"') && abstract.endsWith('"')) {
        try {
            const decoded: unknown = JSON.parse(abstract);
            if (typeof decoded === "string") return decoded;
        } catch {
            // chaîne entre guillemets mais pas du JSON : gardée telle quelle
        }
    }
    return abstract;
};

// même lecture que l’accès affiché dans l’onglet Flux
const readAccess = (service: Service, permissions: DatastorePermission[] | undefined, cartesGouvCommunityId: string | null, now: number): ServiceAccess => {
    if (service.open) return "public";
    return isPrivateServiceVisibleOnCartesGouv(service, permissions, cartesGouvCommunityId, now) ? "restricted_visible" : "restricted";
};

export function serviceToFormValues(
    service: Service,
    permissions: DatastorePermission[] | undefined,
    cartesGouvCommunityId: string | null,
    now: number
): ServiceFormValues {
    const { configuration } = service;
    const typeInfos = configuration.type_infos;
    const abstract = "abstract" in typeInfos && typeof typeInfos.abstract === "string" ? typeInfos.abstract : "";

    return {
        stored_data_id: typeInfos.used_data[0]?.stored_data ?? "",
        title: configuration.name,
        technical_name: configuration.layer_name,
        description: decodeDescription(abstract),
        thumbnail: undefined,
        themes: (configuration.tags.theme ?? "").split(", ").filter((theme) => theme !== ""),
        tables: [],
        access: readAccess(service, permissions, cartesGouvCommunityId, now),
        attribution: {
            enabled: Boolean(configuration.attribution),
            title: configuration.attribution?.title ?? "",
            url: configuration.attribution?.url ?? "",
            logo: undefined,
        },
    };
}
