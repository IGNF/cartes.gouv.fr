import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { Service } from "../types/app";
import { OfferingListResponseDto } from "../types/entrepot";

const get = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_offering", { datastoreId, offeringId });
    return jsonFetch<Service>(url);
};

const getOfferings = (datastoreId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_offerings", { datastoreId });
    return jsonFetch<OfferingListResponseDto[]>(url);
};

/**
 * Demande la suppression de l'offering et puis la configuration
 */
const unpublish = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_unpublish", { datastoreId, offeringId });
    return jsonFetch(url, {
        method: "DELETE",
    });
};

const service = { get, getOfferings, unpublish };

export default service;
