import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @param {string} storedDataId
 * @param {FormData|object} formData
 * @returns {Promise}
 */
const add = (datastoreId, storedDataId, formData) => {
    const url = Routing.generate("cartesgouvfr_api_wfs_add", { datastoreId, storedDataId });
    return jsonFetch(url, {
        method: "POST",
        body: formData,
    });
};

export default {
    add,
};
