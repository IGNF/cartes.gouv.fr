import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { Service } from "../types/app";

const get = (datastoreId: string, offeringId: string) => {
    const url = Routing.generate("cartesgouvfr_api_service_get_offering", { datastoreId, offeringId });
    return jsonFetch<Service>(url);
};

const service = { get };

export default service;
