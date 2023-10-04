import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";

const add = (datastoreId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_add", { datastoreId });
    return jsonFetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

export default {
    add,
};
