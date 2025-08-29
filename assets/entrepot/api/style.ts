import SymfonyRouting from "../../modules/Routing";

import { jsonFetch } from "../../modules/jsonFetch";
import { CartesStyle } from "../../@types/app";

const add = (datastoreId: string, offeringId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_style_add", { datastoreId, offeringId });
    return jsonFetch<CartesStyle[]>(
        url,
        {
            method: "POST",
        },
        data
    );
};

const remove = (datastoreId: string, offeringId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_style_remove", { datastoreId, offeringId });
    return jsonFetch<CartesStyle[]>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        data
    );
};

const setCurrent = (datastoreId: string, offeringId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_style_setcurrent", { datastoreId, offeringId });
    return jsonFetch<CartesStyle[]>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        data
    );
};

export default {
    add,
    remove,
    setCurrent,
};
