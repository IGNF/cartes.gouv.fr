import SymfonyRouting from "../modules/Routing";
import { jsonFetch } from "../modules/jsonFetch";
import { Service } from "../types/app";

const add = (datastoreId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_add", { datastoreId });
    return jsonFetch<null>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const publish = (datastoreId: string, pyramidId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_publish", { datastoreId, pyramidId });
    return jsonFetch<Service>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

export default {
    add,
    publish,
};
