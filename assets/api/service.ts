import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { Service } from "../types/app";

const get = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_service_get_offering", { datastoreId, offeringId });
    return jsonFetch<Service>(url);
};

const service = { get };

export default service;
