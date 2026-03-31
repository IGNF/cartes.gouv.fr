import { useDatastore } from "@/contexts/datastore";
import useUserQuery from "./queries/useUserQuery";

/**
 * Hook utilitaire pour centraliser le calcul des droits de l'utilisateur sur la communauté liée à l'entrepôt courant.
 */
const useCommunityRights = () => {
    const { data: user } = useUserQuery();
    if (!user) {
        throw new Error("useCommunityRights must be used within an authenticated context (i.e., where user is logged in)");
    }

    const { datastore } = useDatastore();

    const communityId = datastore.community._id;
    const communityMember = user.communities_member.find((member) => member.community?._id === communityId);
    const community = communityMember?.community;
    if (!communityMember || !community) {
        throw new Error("User is not a member of the community related to the current datastore");
    }

    const userRights = communityMember?.rights;
    const isSupervisor = community?.supervisor === user.id;

    return {
        userId: user.id,
        userRights,
        isSupervisor,
        communityMember,
    };
};

export default useCommunityRights;
