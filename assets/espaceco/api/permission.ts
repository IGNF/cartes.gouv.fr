import { IDatabasePermission } from "@/@types/app_espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getThemableTables = (communityId: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_permission_get_themable_tables_by_community", { communityId: communityId });
    return jsonFetch<string[]>(url, {
        signal: signal,
    });
};

// Retourne les permissions données à une communauté
const get = (communityId: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_permission_get", { communityId });
    return jsonFetch<IDatabasePermission[]>(url, {
        signal: signal,
    });
};

const update = (communityId: number, datas: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_permission_update", { communityId });
    return jsonFetch<IDatabasePermission[]>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        datas
    );
};

const permission = { getThemableTables, get, update };

export default permission;
