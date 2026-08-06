import { useMemo } from "react";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { findMembership, hasRights, isSupervisor } from "@/utils";

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
            isSupervisor: isSupervisor(user.id, membership),
            /** true si superviseur OU si l'utilisateur a TOUS les droits demandés */
            can: (...requiredRights: CommunityMemberDtoRightsEnum[]) => isSupervisor(user.id, membership) || hasRights(membership, requiredRights),
        };
    }, [user, datastoreId, communityId]);
}
