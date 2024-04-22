import SymfonyRouting from "../../modules/Routing";

import { jsonFetch } from "../../modules/jsonFetch";
import { type CommunityResponseDTO } from "../../@types/espaceco";
import { GetResponse } from "../../@types/app_espaceco";

const get = (name: string, page: number, limit: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get", {
        name: name,
        page: page,
        limit: limit,
    });

    return jsonFetch<GetResponse<CommunityResponseDTO>>(url, {
        signal: signal,
    });
};

const community = { get };

export default community;
