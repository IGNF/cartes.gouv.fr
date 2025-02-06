import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";

export function canUserAccess(
    userId: string,
    communityMember: CommunityMemberDto,
    accessRight?: CommunityMemberDtoRightsEnum | CommunityMemberDtoRightsEnum[]
) {
    const { community, rights } = communityMember;
    if (community?.supervisor === userId) {
        return true;
    }
    if (!accessRight) {
        return true;
    }
    if (typeof accessRight === "string") {
        return rights?.includes(accessRight);
    }
    return accessRight.every((right) => rights?.includes(right));
}
