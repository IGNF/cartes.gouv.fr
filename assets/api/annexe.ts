import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";

const addCapabilities = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_capabilities_add", { datastoreId, offeringId });
    return jsonFetch<undefined>(url, { method: "GET" });
};

export default {
    addCapabilities,
};
