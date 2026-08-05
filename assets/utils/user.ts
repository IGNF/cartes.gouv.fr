import { CartesUser } from "@/@types/app";
import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";

/**
 * Retrouve l'appartenance de l'utilisateur à une communauté, par datastore ou par communauté.
 * Source de vérité unique pour la jointure user ↔ communauté/datastore.
 */
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

/**
 * Chargement des données de l'utilisateur à partir du DOM dans le cache de react-query.
 * Cette initialisation est faite avant le premier rendu de l'application.
 */
export function bootstrapUser(): void {
    let cartesUser: CartesUser | null = null;

    try {
        const raw = (document.getElementById("user") as HTMLDivElement | null)?.dataset?.user ?? null;
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                cartesUser = parsed as CartesUser;
            }
        }
    } catch {
        // ne rien faire, cartesUser restera à null
    }

    queryClient.setQueryData<CartesUser | null>(RQKeys.user_me(), cartesUser);
}
