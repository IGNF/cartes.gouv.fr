import { CartesUser } from "@/@types/app";
import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import { hasRights, isSupervisor } from "./membership";

export function canUserAccess(
    userId: string,
    communityMember: CommunityMemberDto,
    accessRight?: CommunityMemberDtoRightsEnum | CommunityMemberDtoRightsEnum[]
): boolean {
    return (
        isSupervisor(userId, communityMember) ||
        hasRights(communityMember, accessRight === undefined ? [] : Array.isArray(accessRight) ? accessRight : [accessRight])
    );
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
            const parsed: unknown = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                cartesUser = parsed as CartesUser;
            }
        }
    } catch {
        // ne rien faire, cartesUser restera à null
    }

    queryClient.setQueryData<CartesUser | null>(RQKeys.user_me(), cartesUser);
}
