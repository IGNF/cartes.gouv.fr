import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @returns
 */
const getOne = (datastoreId, storedDataId) => {
    const url = Routing.generate("cartesgouvfr_api_stored_data_get_one", { datastoreId, storedDataId });
    return jsonFetch(url);
};

export default {
    getOne,
};
