import { GroupByPermission } from "@/@types/app_espaceco";
import { PermissionResponseDTO } from "../../@types/espaceco";
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
    return jsonFetch<GroupByPermission>(url, {
        signal: signal,
    });
};

// Retourne les permissions données à une communauté sur les bases de données databaseIds
const getOnDBs = (communityId: number, databaseIds: number[], signal: AbortSignal) => {
    const params = { communityId: communityId, dbIds: databaseIds };

    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_permission_get_databases_permissions", params);
    return jsonFetch<PermissionResponseDTO[]>(url, {
        signal: signal,
    });
};
const permission = { getThemableTables, get, getOnDBs };

export default permission;
