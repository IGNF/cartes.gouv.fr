import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { CommunityListResponseDto } from "../types/entrepot";

const getAllPublicCommunities = () => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_catalogs_communities");
    return jsonFetch<CommunityListResponseDto[]>(url);
};

const catalogs = { getAllPublicCommunities };

export default catalogs;
