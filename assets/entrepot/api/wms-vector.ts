import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Service } from "../../types/app";

const add = (datastoreId: string, storedDataId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_wmsvector_add", { datastoreId, storedDataId });
    return jsonFetch<Service>(
        url,
        {
            method: "POST",
            // NOTE : fetch spécifie le header "Content-Type" tout seul
            // ne pas spécifier ce header à la main parce qu'il y a un boundary ajouté automatiquement, sans quoi la requête ne marchera pas
            // multipart/form-data; boundary=---------------------------237460224523877474322081326490"
            // headers: {
            //     "Content-Type": "multipart/form-data",
            //     Accept: "application/json",
            // },
        },
        formData,
        true,
        true
    );
};

const edit = (datastoreId: string, storedDataId: string, offeringId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_wmsvector_edit", { datastoreId, storedDataId, offeringId });
    return jsonFetch<Service>(
        url,
        {
            method: "POST",
        },
        formData,
        true,
        true
    );
};

export default {
    add,
    edit,
};
