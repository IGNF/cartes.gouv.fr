import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";

const getMe = () => {
    const url = Routing.generate("cartesgouvfr_api_user_me");
    return jsonFetch(url);
};

const getDatastoresList = () => {
    const url = Routing.generate("cartesgouvfr_api_user_datastores_list");
    return jsonFetch(url);
};

const user = {
    getMe,
    getDatastoresList,
};

export default user;