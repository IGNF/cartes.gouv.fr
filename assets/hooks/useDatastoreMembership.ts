import { useDatastore } from "@/contexts/datastore";
import useMembership from "./useMembership";

/**
 * Appartenance de l'utilisateur à la communauté liée à l'entrepôt courant.
 * Null si l'appartenance est introuvable (données périmées) : dégrade en "aucun droit" au lieu de lever une erreur.
 */
const useDatastoreMembership = () => {
    const { datastore } = useDatastore();

    return useMembership({ datastoreId: datastore._id });
};

export default useDatastoreMembership;
