import { useMemo } from "react";

import { sandboxCommunityId } from "@/env";
import { findMembership, isSandboxCommunity } from "@/utils";
import useUserQuery from "./queries/useUserQuery";

/** Appartenance de l’utilisateur courant (par datastore ou par communauté), dérivée de user.communities_member sans requête ; null si non membre */
export default function useMembership(ref: { datastoreId?: string; communityId?: string }) {
    const { data: user } = useUserQuery();
    const { datastoreId, communityId } = ref;

    return useMemo(() => {
        const membership = findMembership(user, { datastoreId, communityId });
        if (!membership) return null;

        return {
            membership,
            community: membership.community,
            isSandbox: isSandboxCommunity(membership.community, sandboxCommunityId),
        };
    }, [user, datastoreId, communityId]);
}
