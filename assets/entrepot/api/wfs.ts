import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Service } from "../../@types/app";

const add = (datastoreId: string, storedDataId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_wfs_add", { datastoreId, storedDataId });
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

const edit = (datastoreId: string, storedDataId: string, offeringId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_wfs_edit", { datastoreId, storedDataId, offeringId });
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

const wfs = {
    add,
    edit,
};

export default wfs;
