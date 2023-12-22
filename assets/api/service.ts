import SymfonyRouting from "../modules/Routing";
import { jsonFetch } from "../modules/jsonFetch";
import { Service } from "../types/app";
import { OfferingDetailResponseDto, OfferingListResponseDto } from "../types/entrepot";

const get = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_offering", { datastoreId, offeringId });
    return jsonFetch<Service>(url);
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

const unpublishWfs = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_wfs_unpublish", { datastoreId, offeringId });
    return jsonFetch<null>(url, {
        method: "DELETE",
    });
};

const unpublishWmsVector = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_wmsvector_unpublish", { datastoreId, offeringId });
    return jsonFetch<null>(url, {
        method: "DELETE",
    });
};

const service = { get, getOfferings, getOfferingsDetailed, unpublishWfs, unpublishWmsVector };

export default service;
