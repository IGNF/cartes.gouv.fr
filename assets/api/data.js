import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @param {RequestInit} otherOptions
 * @returns
 */
const getList = (datastoreId, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_data_get_list", { datastoreId });
    return jsonFetch(url, {
        ...otherOptions,
    });
};

/**
 *
 * @param {string} datastoreId
 * @param {string} dataName
 * @param {RequestInit} otherOptions
 * @returns
 */
const get = (datastoreId, dataName, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_data_get", { datastoreId, dataName });
    return jsonFetch(url, {
        ...otherOptions,
    });
};

const data = { getList, get };

export default data;
