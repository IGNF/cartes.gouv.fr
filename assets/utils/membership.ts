import { CartesUser } from "@/@types/app";
import { CommunityMemberDto, CommunityUserDto } from "@/@types/entrepot";

/** Retrouve l’appartenance de l’utilisateur à une communauté, par datastore ou par communauté (source unique de la jointure user ↔ communauté) */
export function findMembership(user: CartesUser | null | undefined, criteria: { datastoreId?: string; communityId?: string }): CommunityMemberDto | undefined {
    const { datastoreId, communityId } = criteria;
    if (!user?.communities_member || (datastoreId === undefined && communityId === undefined)) {
        return undefined;
    }
    return user.communities_member.find((member) => {
        if (!member.community) return false;
        if (datastoreId !== undefined) return member.community.datastore === datastoreId;
        return member.community._id === communityId;
    });
}

/** true si la communauté est celle du bac à sable (id absent de la config : jamais sandbox) */
export function isSandboxCommunity(community: Pick<CommunityUserDto, "_id"> | undefined, sandboxCommunityId: string | null): boolean {
    return sandboxCommunityId !== null && community?._id === sandboxCommunityId;
}
