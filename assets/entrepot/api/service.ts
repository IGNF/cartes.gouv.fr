import type { OfferingStandardListResponseDto } from "@/@types/entrepot";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting, { QueryParams } from "@/modules/Routing";
import { ConfigurationTypeEnum, OfferingTypeEnum, type Service } from "../../@types/app";

const getService = (datastoreId: string, offeringId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_service", { datastoreId, offeringId });
    return jsonFetch<Service>(url, {
        ...otherOptions,
    });
};

const getOfferings = <T = OfferingStandardListResponseDto>(datastoreId: string, queryParams: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_offerings_list", { datastoreId, ...queryParams });
    return jsonFetch<T[]>(url, {
        ...otherOptions,
    });
};

const unpublishService = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_unpublish_service", { datastoreId, offeringId });
    return jsonFetch<null>(url, {
        method: "DELETE",
    });
};

const getExistingLayerNames = (datastoreId: string, type: ConfigurationTypeEnum | OfferingTypeEnum, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_existing_layer_names", { datastoreId, type });
    return jsonFetch<string[]>(url, {
        ...otherOptions,
    });
};

const service = {
    getService,
    getOfferings,
    unpublishService,
    getExistingLayerNames,
};

export default service;
