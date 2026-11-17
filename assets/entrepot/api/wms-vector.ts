import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Service } from "../../@types/app";

/** publication depuis le nouveau formulaire, voir buildServiceFormData */
const publish = (datastoreId: string, storedDataId: string, formData: FormData) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_wmsvector_publish", { datastoreId, storedDataId });
    return jsonFetch<Service>(url, { method: "POST" }, formData, true);
};

export default {
    publish,
};
