import Routing from "fos-router";
import { jsonFetch } from "./index";

const getUser = () => {
    const url = Routing.generate("get_user");
    return jsonFetch(url);
};

export default {
    getUser,
};
