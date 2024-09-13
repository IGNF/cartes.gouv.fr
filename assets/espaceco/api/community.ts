import SymfonyRouting from "../../modules/Routing";

import { CommunityListFilter, GetResponse } from "../../@types/app_espaceco";
import { type CommunityResponseDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";

const get = (queryParams: { page: number; limit: number }, signal: AbortSignal) => {
    const params = { ...queryParams, sort: "name:ASC" };

    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get", params);
    return jsonFetch<GetResponse<CommunityResponseDTO>>(url, {
        signal: signal,
    });
};

const searchByName = (name: string, filter: CommunityListFilter, signal: AbortSignal) => {
    const queryParams = { name: `%${name}%`, filter: filter, sort: "name:ASC" };
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_search", queryParams);
    return jsonFetch<CommunityResponseDTO[]>(url, {
        signal: signal,
    });
};

const getAsMember = (queryParams: Record<string, unknown>, signal: AbortSignal) => {
    const params = { ...queryParams, sort: "name:ASC" };
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get_as_member", params);
    return jsonFetch<GetResponse<CommunityResponseDTO>>(url, {
        signal: signal,
    });
};

const getCommunity = (communityId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get_community", { communityId });
    return jsonFetch<CommunityResponseDTO>(url);
};

const updateLogo = (communityId: number, formData: FormData) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_update_logo", { communityId });
    return jsonFetch<CommunityResponseDTO>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const community = { get, getCommunity, searchByName, getAsMember, updateLogo };

export default community;
