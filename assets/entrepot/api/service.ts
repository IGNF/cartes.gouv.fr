import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { ConfigurationTypeEnum, OfferingTypeEnum, Service } from "../../@types/app";
import { OfferingDetailResponseDto, OfferingListResponseDto } from "../../@types/entrepot";

const getService = (datastoreId: string, offeringId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_service", { datastoreId, offeringId });
    return jsonFetch<Service>(url, {
        ...otherOptions,
    });
};

const getOfferings = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_offerings_list", { datastoreId });
    return jsonFetch<OfferingListResponseDto[]>(url, {
        ...otherOptions,
    });
};

const getOfferingsDetailed = (datastoreId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_offerings_list", { datastoreId, detailed: true });
    return jsonFetch<OfferingDetailResponseDto[]>(url, {
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
    getOfferingsDetailed,
    unpublishService,
    getExistingLayerNames,
};

export default service;
