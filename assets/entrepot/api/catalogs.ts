import SymfonyRouting from "../../modules/Routing";

import { jsonFetch } from "../../modules/jsonFetch";
import { CommunityListResponseDto } from "../../types/entrepot";

const getAllPublicCommunities = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_catalogs_communities");
    return jsonFetch<CommunityListResponseDto[]>(url, { ...otherOptions });
};

const catalogs = { getAllPublicCommunities };

export default catalogs;
