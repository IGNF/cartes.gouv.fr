import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { StoredData } from "../types/app";

const get = <T = StoredData>(datastoreId: string, storedDataId: string) => {
    const url = Routing.generate("cartesgouvfr_api_stored_data_get", { datastoreId, storedDataId });
    return jsonFetch<T>(url);
};

const storedData = {
    get,
};

export default storedData;
