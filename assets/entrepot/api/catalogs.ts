import SymfonyRouting from "../../modules/Routing";

import { jsonFetch } from "../../modules/jsonFetch";
import { CommunityListResponseDto, OrganizationCatalogResponseDto } from "../../@types/entrepot";

const getAllPublicCommunities = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_catalogs_communities");
    return jsonFetch<CommunityListResponseDto[]>(url, { ...otherOptions });
};

const getAllOrganizations = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_catalogs_organizations");
    return jsonFetch<OrganizationCatalogResponseDto[]>(url, { ...otherOptions });
};

const catalogs = { getAllPublicCommunities, getAllOrganizations };

export default catalogs;
