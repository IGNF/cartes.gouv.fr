import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";

const add = (datastoreId: string, offeringId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_style_add", { datastoreId, offeringId });
    return jsonFetch<undefined>(
        url,
        {
            method: "POST",
        },
        data,
        true
    );
};

export default {
    add,
};
