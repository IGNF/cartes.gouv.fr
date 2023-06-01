import { jsonFetch } from "./index";

/**
 *
 * @param {string} datastoreId
 * @returns
 */
const getOne = (datastoreId) => {
    const url = Routing.generate("cartesgouvfr_api_datastore_get_one", { datastoreId });
    return jsonFetch(url);
};

export default {
    getOne,
};
