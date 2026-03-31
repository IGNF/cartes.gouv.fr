import { CartesUser } from "@/@types/app";
import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";

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
            cartesUser = JSON.parse(raw) as CartesUser;
        }
    } catch {
        // ne rien faire, cartesUser restera à null
    }

    queryClient.setQueryData<CartesUser | null>(RQKeys.user_me(), cartesUser);
}
