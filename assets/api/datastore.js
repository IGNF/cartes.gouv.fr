import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @param {RequestInit} otherOptions
 * @returns
 */
const getOne = (datastoreId, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_datastore_get_one", { datastoreId });
    return jsonFetch(url, {
        ...otherOptions,
    });
};

export default {
    getOne,
};
