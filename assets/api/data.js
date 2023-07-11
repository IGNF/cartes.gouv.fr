import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @param {RequestInit} otherOptions
 * @returns
 */
const getList = (datastoreId, detailed = false, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_data_get_list", { datastoreId, detailed });
    return jsonFetch(url, {
        ...otherOptions,
    });
};

const data = { getList };

export default data;
