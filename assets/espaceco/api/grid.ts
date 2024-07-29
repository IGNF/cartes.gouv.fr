import { GetResponse, SearchGridFilters } from "../../@types/app_espaceco";
import { Grid } from "../../@types/espaceco";
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
    return jsonFetch<GetResponse<Grid>>(url, {
        ...otherOptions,
    });
};

const grid = { search };

export default grid;
