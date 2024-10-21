import SymfonyRouting from "../../modules/Routing";

import { CommunityListFilter, CommunityMember, GetResponse, Role } from "../../@types/app_espaceco";
import { type CommunityResponseDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";

const get = (queryParams: { page: number; limit: number }, signal: AbortSignal) => {
    const params = { ...queryParams, sort: "name:ASC" };

    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get", params);
    return jsonFetch<GetResponse<CommunityResponseDTO>>(url, {
        signal: signal,
    });
};

const getCommunitiesName = () => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get_names");
    return jsonFetch<string[]>(url);
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

const getCommunityMembers = (communityId: number, page: number, limit: number = 10, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get_members", {
        communityId,
        page: page,
        limit: limit,
        roles: ["member", "admin"],
    });
    return jsonFetch<GetResponse<CommunityMember>>(url, {
        signal: signal,
    });
};

const getCommunityMembershipRequests = (communityId: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get_members", { communityId, page: 1, limit: 50, roles: ["pending"] });
    return jsonFetch<GetResponse<CommunityMember>>(url, {
        signal: signal,
    });
};

const updateMemberRole = (communityId: number, userId: number, role: Role) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_update_member_role", { communityId, userId });
    return jsonFetch<CommunityMember>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        { role: role }
    );
};

const updateMemberGrids = (communityId: number, userId: number, grids: string[]) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_update_member_grids", { communityId, userId });
    return jsonFetch<CommunityMember>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        { grids: grids }
    );
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

const removeMember = (communityId: number, userId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_remove_member", { communityId, userId });
    return jsonFetch<{ user_id: number }>(url, {
        method: "DELETE",
    });
};

const community = {
    get,
    getCommunitiesName,
    getCommunity,
    getCommunityMembers,
    getCommunityMembershipRequests,
    searchByName,
    getAsMember,
    updateMemberRole,
    updateMemberGrids,
    removeMember,
    updateLogo,
};

export default community;
