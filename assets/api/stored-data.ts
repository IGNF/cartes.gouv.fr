import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { StoredData } from "../types/app";

const get = (datastoreId: string, storedDataId: string) => {
    const url = Routing.generate("cartesgouvfr_api_stored_data_get", { datastoreId, storedDataId });
    return jsonFetch<StoredData>(url);
};

const storedData = {
    get,
};

export default storedData;
