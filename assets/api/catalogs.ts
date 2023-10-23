import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { CommunityListResponseDto } from "../types/entrepot";

export type CommunitiesReponse = {
    communities: CommunityListResponseDto[];
    numPages: number;
};

const getPublicCommunities = (page: number, limit: number = 10) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_catalogs_communities");
    return jsonFetch<CommunitiesReponse>(`${url}?page=${page}&limit=${limit}`);
};

const catalogs = { getPublicCommunities };

export default catalogs;
