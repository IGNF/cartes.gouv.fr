import { useDatastore } from "@/contexts/datastore";
import useMembership from "./useMembership";

/**
 * Droits de l'utilisateur sur la communauté liée à l'entrepôt courant.
 * Si l'appartenance est introuvable (données périmées), dégrade en "aucun droit" au lieu de lever une erreur.
 */
const useCommunityRights = () => {
    const { datastore } = useDatastore();
    const member = useMembership({ datastoreId: datastore._id });

    return {
        userId: member?.userId,
        userRights: member?.rights,
        isSupervisor: member?.isSupervisor ?? false,
        communityMember: member?.membership,
    };
};

export default useCommunityRights;
