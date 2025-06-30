import { EmailPlannerDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getAll = (communityId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_emailplanner_get", { communityId });
    return jsonFetch<EmailPlannerDTO[]>(url);
};

const add = (communityId: number, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_emailplanner_add", { communityId });
    return jsonFetch<EmailPlannerDTO>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        data
    );
};

const update = (communityId: number, emailPlannerId: number, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_emailplanner_update", { communityId, emailPlannerId });
    return jsonFetch<EmailPlannerDTO>(
        url,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        data
    );
};

const remove = (communityId: number, emailplannerId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_emailplanner_remove", { communityId, emailplannerId });
    return jsonFetch<{ emailplanner_id: number }>(url, {
        method: "DELETE",
    });
};

const emailplanner = {
    getAll,
    add,
    update,
    remove,
};

export default emailplanner;
