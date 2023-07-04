import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @returns
 */
const getList = (datastoreId) => {
    const url = Routing.generate("cartesgouvfr_api_data_get_list", { datastoreId });
    return jsonFetch(url);
};

const data = { getList };

export default data;
