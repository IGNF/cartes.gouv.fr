import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Service } from "../../@types/app";

// nouveau formulaire : champ JSON `data` et fichiers `thumbnail`, `attribution_logo` dans un seul multipart
const publish = (datastoreId: string, storedDataId: string, formData: FormData) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_wfs_publish", { datastoreId, storedDataId });
    return jsonFetch<Service>(url, { method: "POST" }, formData, true);
};

const wfs = {
    publish,
};

export default wfs;
