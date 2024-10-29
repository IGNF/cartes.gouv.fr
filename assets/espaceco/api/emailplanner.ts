import { EmailPlannerDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getAll = (communityId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_emailplanner_get", { communityId });
    return jsonFetch<EmailPlannerDTO[]>(url);
};

const remove = (communityId: number, emailplannerId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_emailplanner_remove", { communityId, emailplannerId });
    return jsonFetch<{ emailplanner_id: number }>(url, {
        method: "DELETE",
    });
};

const emailplanner = {
    getAll,
    remove,
};

export default emailplanner;
