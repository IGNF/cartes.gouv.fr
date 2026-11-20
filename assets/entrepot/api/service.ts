import type { OfferingStandardListResponseDto } from "@/@types/entrepot";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting, { type QueryParams } from "@/modules/Routing";
import { ConfigurationTypeEnum, type Service } from "../../@types/app";

const getService = (datastoreId: string, offeringId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_service", { datastoreId, offeringId });
    return jsonFetch<Service>(url, {
        ...otherOptions,
    });
};

const getOfferings = <T = OfferingStandardListResponseDto>(datastoreId: string, queryParams: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_offering_list", { datastoreId, ...queryParams });
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

const getExistingLayerNames = (datastoreId: string, type: ConfigurationTypeEnum, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_existing_layer_names", { datastoreId, type });
    return jsonFetch<string[]>(url, {
        ...otherOptions,
    });
};

// modification depuis la page du flux : renvoie l’offre, nouvelle si l’endpoint a changé
const edit = (datastoreId: string, offeringId: string, formData: FormData) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_edit_service", { datastoreId, offeringId });
    return jsonFetch<Service>(url, { method: "POST" }, formData, true);
};

const service = {
    getService,
    edit,
    getOfferings,
    unpublishService,
    getExistingLayerNames,
};

export default service;
