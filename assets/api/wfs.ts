import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";

const add = (datastoreId: string, storedDataId: string, formData: FormData | object) => {
    const url = Routing.generate("cartesgouvfr_api_wfs_add", { datastoreId, storedDataId });
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
