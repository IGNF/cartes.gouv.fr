import { TableResponseDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getThemableTables = (communityId: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_permission_get_themable_tables_by_community", { communityId: communityId });
    return jsonFetch<Partial<TableResponseDTO>[]>(url, {
        signal: signal,
    });
};

const permission = { getThemableTables };

export default permission;
