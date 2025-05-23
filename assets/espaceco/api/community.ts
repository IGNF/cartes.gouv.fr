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

const add = (data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_add");
    return jsonFetch<CommunityResponseDTO>(
        url,
        {
            method: "POST",
        },
        data
    );
};

const update = (communityId: number, datas: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_update", { communityId });
    return jsonFetch<CommunityResponseDTO>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        datas
    );
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

const getCommunityMembers = (communityId: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get_members", {
        communityId,
        roles: ["member", "admin"],
    });
    return jsonFetch<CommunityMember[]>(url, {
        signal: signal,
    });
};

const getCommunityMembershipRequests = (communityId: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_get_members", { communityId, roles: ["pending"] });
    return jsonFetch<CommunityMember[]>(url, {
        signal: signal,
    });
};

const addMembers = (communityId: number, members: (number | string)[]) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_add_members", { communityId });
    return jsonFetch<CommunityMember[]>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        { members: members }
    );
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
    return jsonFetch<{ logo_url: string }>(
        url,
        {
            method: "POST",
        },
        formData,
        true
    );
};

const removeLogo = (communityId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_remove_logo", { communityId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const removeMember = (communityId: number, userId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_remove_member", { communityId, userId });
    return jsonFetch<{ user_id: number }>(url, {
        method: "DELETE",
    });
};

const community = {
    get,
    add,
    update,
    getCommunitiesName,
    getCommunity,
    getCommunityMembers,
    getCommunityMembershipRequests,
    addMembers,
    searchByName,
    getAsMember,
    updateMemberRole,
    updateMemberGrids,
    removeMember,
    updateLogo,
    removeLogo,
};

export default community;
