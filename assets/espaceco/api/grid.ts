import { GetResponse, SearchGridFilters } from "../../@types/app_espaceco";
import { GridDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getAll = (text: string, filters: SearchGridFilters, otherOptions: RequestInit = {}) => {
    const queryParams = { text: `${text}%` };
    ["searchBy", "fields"].forEach((p) => {
        if (filters[p] !== undefined) {
            queryParams[p] = filters[p].join(",");
        }
    });
    if (filters.adm !== undefined) {
        queryParams["adm"] = new Boolean(filters.adm).toString();
    }

    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_grids_get_all", queryParams);
    return jsonFetch<GetResponse<GridDTO>>(url, {
        ...otherOptions,
    });
};

const get = (name: string[], otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_grids_get", { name });
    return jsonFetch<GetResponse<GridDTO>>(url, {
        ...otherOptions,
    });
};

const grid = { getAll, get };

export default grid;
