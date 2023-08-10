import Routing from "fos-router";

import { jsonFetch } from "../modules/jsonFetch";
import { Datastore } from "../types/app";

const getMe = () => {
    const url = Routing.generate("cartesgouvfr_api_user_me");
    return jsonFetch(url);
};

const getDatastoresList = (otherOptions: RequestInit = {}) => {
    const url = Routing.generate("cartesgouvfr_api_user_datastores_list");
    return jsonFetch<Datastore[]>(url, { ...otherOptions });
};

const user = {
    getMe,
    getDatastoresList,
};

export default user;
