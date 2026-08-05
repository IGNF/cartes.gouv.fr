import { useMemo } from "react";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { canUserAccess, findMembership } from "@/utils";

type CommunityMemberCriteria = { datastoreId: string; communityId?: never } | { communityId: string; datastoreId?: never };

/**
 * Appartenance de l'utilisateur courant à une communauté (par datastore ou par communauté),
 * calculée depuis user.communities_member — aucune requête réseau.
 * Retourne null si l'utilisateur n'est pas membre.
 */
export default function useCommunityMember(criteria: CommunityMemberCriteria) {
    const { data: user } = useUserQuery();
    const { datastoreId, communityId } = criteria;

    return useMemo(() => {
        if (!user?.id) return null;

        const membership = findMembership(user, { datastoreId, communityId });
        if (!membership) return null;

        return {
            userId: user.id,
            membership,
            rights: membership.rights ?? [],
            isSupervisor: membership.community?.supervisor === user.id,
            /** true si superviseur ou si l'utilisateur a TOUS les droits demandés */
            can: (...rights: CommunityMemberDtoRightsEnum[]) => canUserAccess(user.id, membership, rights.length > 0 ? rights : undefined),
        };
    }, [user, datastoreId, communityId]);
}
