import Routing from "fos-router";
import { jsonFetch } from "./index";

const getMe = () => {
    const url = Routing.generate("cartesgouvfr_api_user_me");
    return jsonFetch(url);
};

const getDatastoresList = () => {
    const url = Routing.generate("cartesgouvfr_api_user_datastores_list");
    return jsonFetch(url);
};

export default {
    getMe,
    getDatastoresList,
};
