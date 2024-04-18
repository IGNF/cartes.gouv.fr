import SymfonyRouting from "../../modules/Routing";

import { jsonFetch } from "../../modules/jsonFetch";
import { CommunityDetailResponseDto, CommunityUserResponseDto } from "../../@types/entrepot";
import { UserRightsResponseDto } from "../../@types/app";

const get = (communityId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_community_get", { communityId });
    return jsonFetch<CommunityDetailResponseDto>(url);
};

const getMembers = (communityId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_community_members", { communityId });
    return jsonFetch<CommunityUserResponseDto[]>(url);
};

/**
 * Cree ou modifie un utilisateur pour la communaute communityId
 * @param communityId
 * @param formData
 * @returns
 */
const updateMember = (communityId: string, formData: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_community_add_member", { communityId });
    return jsonFetch<UserRightsResponseDto>(
        url,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const removeMember = (communityId: string, userId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_community_remove_member", { communityId });
    return jsonFetch<{ user: string }>(
        url,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        { user_id: userId }
    );
};

const community = { get, getMembers, updateMember, removeMember };

export default community;
