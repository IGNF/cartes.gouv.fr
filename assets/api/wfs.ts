import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";

const add = (datastoreId: string, storedDataId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_wfs_add", { datastoreId, storedDataId });
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

const wfs = { add };

export default wfs;
