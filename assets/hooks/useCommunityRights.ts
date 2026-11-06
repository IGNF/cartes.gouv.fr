import { useParams } from "@tanstack/react-router";

import { findMembership, isSupervisor } from "@/utils/membership";
import useUserQuery from "./queries/useUserQuery";

/**
 * Hook utilitaire pour centraliser le calcul des droits de l'utilisateur sur la communauté liée à l'entrepôt courant.
 */
const useCommunityRights = () => {
    const { data: user } = useUserQuery();
    if (!user) {
        throw new Error("useCommunityRights must be used within an authenticated context (i.e., where user is logged in)");
    }

    // appelé seulement sous le layout entrepôt
    const { datastoreId } = useParams({ from: "/_private/tableau-de-bord/entrepots/$datastoreId" });
    const communityMember = findMembership(user, { datastoreId });
    const community = communityMember?.community;
    if (!communityMember || !community) {
        throw new Error("User is not a member of the community related to the current datastore");
    }

    const userRights = communityMember?.rights;
    const supervisor = isSupervisor(user.id, communityMember);

    return {
        userId: user.id,
        userRights,
        isSupervisor: supervisor,
        communityMember,
    };
};

export default useCommunityRights;
