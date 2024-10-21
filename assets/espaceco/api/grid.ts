import { GetResponse, SearchGridFilters } from "../../@types/app_espaceco";
import { GridDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const search = (text: string, filters: SearchGridFilters, otherOptions: RequestInit = {}) => {
    const queryParams = { text: `${text}%` };
    ["searchBy", "fields"].forEach((p) => {
        if (filters[p] !== undefined) {
            queryParams[p] = filters[p].join(",");
        }
    });
    if (filters.adm !== undefined) {
        queryParams["adm"] = new Boolean(filters.adm).toString();
    }

    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_grid_search", queryParams);
    return jsonFetch<GetResponse<GridDTO>>(url, {
        ...otherOptions,
    });
};

const fromNames = (names: string[], otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_grid_get_by_names", { names: names });
    return jsonFetch<GetResponse<GridDTO>>(url, {
        ...otherOptions,
    });
};

const grid = { search, fromNames };

export default grid;
